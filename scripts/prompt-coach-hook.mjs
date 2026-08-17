#!/usr/bin/env node
// UserPromptSubmit hook — auto-correct, translate, or refine prompts.
// Also injects summary_language instruction when configured.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

import { detectMode } from "./lib/detect.mjs";
import { logCorrection, logClean, resolveConfig } from "./lib/state.mjs";
import {
  externalApiKey,
  externalBaseUrl,
  externalModel,
  buildChatBody,
} from "./lib/provider.mjs";
import {
  anthropicCredentials,
  anthropicAuthHeader,
  writeBearerConfigFile,
} from "./lib/auth.mjs";
import { postJson, parseResponse } from "./lib/transport.mjs";
import {
  parseAnnotations,
  formatAnnotationsForStorage,
  formatAnnotationsForDisplay,
} from "./lib/annotations.mjs";

function readStdin() {
  return JSON.parse(fs.readFileSync(0, "utf8").trim() || "{}");
}

// Pending user-visible warning (auth failure). Drained on next emit().
let authWarning = null;

function emit(obj) {
  if (authWarning) {
    obj = { ...obj, systemMessage: obj.systemMessage ? `${authWarning}\n${obj.systemMessage}` : authWarning };
    authWarning = null;
  }
  process.stdout.write(JSON.stringify(obj) + "\n");
}

// Used by main() in fallback branches that would otherwise return silently.
// Ensures auth warnings still surface even when there's no summary context.
function emitFallback(summaryCtx) {
  if (summaryCtx || authWarning) {
    emit(summaryCtx ? { additionalContext: summaryCtx } : {});
  }
}

// Route the correction/translation/refine call to the right provider.
// Priority:
//   1. External chat-completions API (DeepSeek by default) — when
//      ENGLISH_BUDDY_API_KEY is set. This lets the plugin run on any external
//      LLM key instead of requiring a Claude subscription.
//   2. AWS Bedrock — when Claude Code itself is running on Bedrock.
//   3. Anthropic API / Claude Code OAuth — the original default.
function callLLM(systemPrompt, userText) {
  if (externalApiKey()) {
    return callExternalLLM(systemPrompt, userText);
  }
  if (process.env.CLAUDE_CODE_USE_BEDROCK === "1") {
    return callHaikuBedrock(systemPrompt, userText);
  }
  return callHaikuAnthropic(systemPrompt, userText);
}

// External chat-completions path — DeepSeek, Kimi, Qwen, GLM, etc.
function callExternalLLM(systemPrompt, userText) {
  const key = externalApiKey();
  if (!key) return null;

  // Keep the bearer token out of the process list (curl's argv is visible via
  // `ps`): it's written to a 0600 temp file and read back with `-K`.
  const cfgFile = writeBearerConfigFile(key);
  try {
    const stdout = postJson({
      url: `${externalBaseUrl()}/chat/completions`,
      headers: ["content-type: application/json"],
      configFile: cfgFile,
      body: buildChatBody({ model: externalModel(), systemPrompt, userText }),
    });
    const { text, authError } = parseResponse({
      stdout,
      extractText: (r) => r.choices?.[0]?.message?.content,
      isAuthError: (e) => /auth|invalid|401|403/i.test(String(e?.type || e?.code || "")),
    });
    if (authError) {
      authWarning = "[claude-english-buddy] External LLM authentication failed. Check ENGLISH_BUDDY_API_KEY.";
    }
    return text;
  } finally {
    try { fs.unlinkSync(cfgFile); } catch {}
  }
}

function callHaikuAnthropic(systemPrompt, userText) {
  const creds = anthropicCredentials();
  if (!creds) return null;

  if (creds.expired) {
    authWarning = "[claude-english-buddy] OAuth token expired. Restart Claude Code to refresh the keychain.";
    return null;
  }

  const stdout = postJson({
    url: "https://api.anthropic.com/v1/messages",
    headers: [
      "content-type: application/json",
      anthropicAuthHeader(creds.token),
      "anthropic-version: 2023-06-01",
    ],
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userText }],
    }),
  });

  const { text, authError } = parseResponse({
    stdout,
    extractText: (r) => r.content?.[0]?.text || "",
    isAuthError: (e) => e?.type === "authentication_error",
  });
  if (authError) {
    authWarning = "[claude-english-buddy] Authentication failed. If you authenticate via `claude setup-token`, restart Claude Code to refresh the OAuth token.";
  }
  return text;
}

// AWS Bedrock path — used when CLAUDE_CODE_USE_BEDROCK=1.
// Shells out to `aws bedrock-runtime invoke-model`, which picks up
// AWS_PROFILE/AWS_REGION/credentials from the environment. Requires the aws
// CLI on PATH (already a prerequisite for running Claude Code on Bedrock).
function callHaikuBedrock(systemPrompt, userText) {
  const region  = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
  const modelId = process.env.CLAUDE_ENGLISH_BUDDY_BEDROCK_MODEL
               || "us.anthropic.claude-haiku-4-5-20251001-v1:0";

  // The Bedrock body differs from the Anthropic API: use anthropic_version
  // (not an HTTP header) and omit the top-level model field.
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userText }],
  });

  const suffix  = `ceb-${process.pid}-${Date.now()}`;
  const inFile  = path.join(os.tmpdir(), `${suffix}-in.json`);
  const outFile = path.join(os.tmpdir(), `${suffix}-out.json`);

  try {
    fs.writeFileSync(inFile, body, "utf8");

    const result = spawnSync("aws", [
      "bedrock-runtime", "invoke-model",
      "--model-id", modelId,
      "--region", region,
      "--body", `fileb://${inFile}`,
      "--content-type", "application/json",
      "--accept", "application/json",
      outFile,
    ], { encoding: "utf8", timeout: 35_000 });

    if (result.error || result.status !== 0) return null;

    const response = JSON.parse(fs.readFileSync(outFile, "utf8"));
    if (response.error) return null;
    const text = response.content?.[0]?.text || "";
    return text.trim() || null;
  } catch {
    return null;
  } finally {
    try { fs.unlinkSync(inFile); } catch {}
    try { fs.unlinkSync(outFile); } catch {}
  }
}

const SYSTEM_CORRECT = `You are an English language coach for a non-native speaker who uses AI coding tools daily.
The user's prompt will be processed by an AI assistant that understands them regardless of errors. Your job is to help the USER improve by showing corrections.

Rules:
- Fix spelling, grammar, punctuation, and word choice errors
- Improve awkward phrasing to sound natural
- Keep technical terms, code references, and tool names unchanged
- Preserve the user's intent and structure exactly
- Do NOT restructure or expand the prompt — only correct errors
- Never emit a correction whose before and after sides are identical after trimming — only flag real changes
- Show the smallest token that actually changed, not the whole surrounding phrase (e.g. "html → HTML", not "rather than single html → rather than a single HTML file")
- Surface at most 3 corrections per prompt; pick the ones most worth learning from

Output format (strict):
- If the prompt has NO errors, output EXACTLY: CLEAN
- If the prompt has errors, output the corrected prompt on the first line, then a blank line, then ONE correction per line in the format:
    {wrong} → {right} ({short category})
  where {short category} is one or two words such as: missing article, acronym capitalization, verb tense, word choice, spelling, apostrophe, preposition, punctuation, capitalization, agreement.
  Do not add bullet markers; do not wrap in parentheses; do not repeat the corrected sentence.

Example input: "i seen the file but its missing comma"
Example output:
I saw the file, but it's missing a comma.

i → I (capitalization)
seen → saw (verb tense)
its → it's (apostrophe)`;

const SYSTEM_TRANSLATE = `You are a translator for a developer who uses AI coding tools.
Rules:
- Translate the user's text into natural, idiomatic English
- Keep ALL technical terms, code references, file paths, and tool names unchanged
- Preserve the intent and structure exactly
- Use imperative voice where appropriate for instructions
- Output EXACTLY two lines:
  Line 1: The English translation
  Line 2: The detected source language in parentheses, e.g. (Chinese) or (Japanese)
- Output ONLY the translation, no commentary`;

const SYSTEM_REFINE = `You are a prompt engineer. Rewrite the user's rough idea into a precise, effective prompt for an AI coding assistant.
Rules:
- Use imperative voice
- Be specific and actionable
- Add structure (numbered steps, categories) if the task is complex
- Expand vague requests into concrete instructions
- Keep technical terms intact
- Translate non-English to English
- Output ONLY the refined prompt, nothing else`;

function main() {
  const input = readStdin();
  const prompt = input.prompt || "";
  const cwd = input.cwd || process.cwd();
  const config = resolveConfig(cwd);

  // Build summary instruction
  let summaryCtx = "";
  if (config.summary_language) {
    summaryCtx = `After your response, add a brief summary in ${config.summary_language} under a --- separator. Summarize the key points, actions taken, and decisions made. Keep it concise (2-5 sentences). Label it: **${config.summary_language} Summary**`;
  }

  // Detect mode
  const detection = detectMode(prompt);

  if (detection.mode === "skip") {
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  if (detection.mode === "refine") {
    if (!detection.text) {
      emit({ decision: "block", reason: "Nothing to refine. Provide text after ::." });
      return;
    }

    const result = callLLM(SYSTEM_REFINE, detection.text);
    if (!result) {
      emit({ decision: "block", reason: "Refinement failed." });
      return;
    }

    logCorrection({ mode: "refine", original: detection.text, corrected: result });

    let ctx = `IMPORTANT: The user used :: to request prompt refinement. Their refined intent is: ${result}. Follow this refined prompt as the user's actual request.`;
    if (summaryCtx) ctx += " " + summaryCtx;
    emit({ additionalContext: ctx, systemMessage: `Refined: ${result}` });
    return;
  }

  if (!config.auto_correct) {
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  if (detection.mode === "translate") {
    const result = callLLM(SYSTEM_TRANSLATE, detection.text);
    if (!result) {
      emitFallback(summaryCtx);
      return;
    }

    const lines = result.split("\n").filter(Boolean);
    const translated = lines[0] || result;
    const sourceLang = lines[1] || "";

    logCorrection({ mode: "translate", original: detection.text, corrected: translated, annotations: sourceLang });

    let ctx = `Translated prompt: ${translated}`;
    if (summaryCtx) ctx += " " + summaryCtx;
    const label = sourceLang ? `Translated ${sourceLang}: ${translated}` : `Translated: ${translated}`;
    emit({ additionalContext: ctx, systemMessage: label });
    return;
  }

  // mode === "correct"
  const domainTerms = config.domain_terms.length > 0
    ? `\nAdditional domain terms to preserve unchanged: ${config.domain_terms.join(", ")}`
    : "";
  const system = SYSTEM_CORRECT + domainTerms;

  const result = callLLM(system, detection.text);
  if (!result) {
    emitFallback(summaryCtx);
    return;
  }

  if (result === "CLEAN") {
    logClean();
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  const rawLines = result.split("\n");
  const corrected = (rawLines[0] || result).trim();
  const annotationBlock = rawLines.slice(1).join("\n").trim();

  // Parse Haiku's output through the shared parser so we get defensive
  // no-op suppression and tolerate format drift (stray bullets, missing
  // categories, accidental legacy `>` syntax).
  const parsed = parseAnnotations(annotationBlock);
  const annotations = formatAnnotationsForStorage(parsed);

  // If the model emitted zero real corrections (everything was a no-op),
  // treat the prompt as clean rather than logging a misleading entry.
  if (parsed.length === 0) {
    logClean();
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  logCorrection({ mode: "correct", original: detection.text, corrected, annotations });

  let ctx = `Corrected prompt: ${corrected}`;
  if (summaryCtx) ctx += " " + summaryCtx;
  const display = formatAnnotationsForDisplay(parsed);
  // Prefix the systemMessage so it reads naturally after Claude Code's
  // "UserPromptSubmit says:" wrapper. Without the label the reader can't
  // tell that the text below is the *interpreted* version of what they
  // typed — it looks like a raw echo. "User intends to say:" mirrors the
  // attribution-friendly framing the plugin uses elsewhere.
  const msg = display
    ? `User intends to say: ${corrected}\n${display}`
    : `User intends to say: ${corrected}`;
  emit({ additionalContext: ctx, systemMessage: msg });
}

main();
