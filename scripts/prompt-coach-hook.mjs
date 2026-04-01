#!/usr/bin/env node
// UserPromptSubmit hook — auto-correct, translate, or refine prompts.
// Also injects summary_language instruction when configured.

import fs from "node:fs";
import process from "node:process";
import { spawnSync } from "node:child_process";

import { detectMode } from "./lib/detect.mjs";
import { logCorrection, logClean, resolveConfig } from "./lib/state.mjs";

function readStdin() {
  return JSON.parse(fs.readFileSync(0, "utf8").trim() || "{}");
}

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function callHaiku(systemPrompt, userText) {
  // Use CLAUDE_COACH_TOKEN if set, otherwise fall back to current session auth
  const token = process.env.CLAUDE_COACH_TOKEN || process.env.CLAUDE_CODE_OAUTH_TOKEN || "";
  const env = { ...process.env };
  if (token) {
    env.ANTHROPIC_API_KEY = "";
    env.CLAUDE_CODE_OAUTH_TOKEN = token;
  }
  const result = spawnSync("claude", ["-p", "--model", "haiku", `${systemPrompt}\n\nUser's text:\n${userText}`], {
    encoding: "utf8",
    timeout: 45_000,
    env,
  });

  if (result.error || result.status !== 0) return null;
  return (result.stdout || "").trim();
}

const SYSTEM_CORRECT = `You are an English language coach for a non-native speaker who uses AI coding tools daily.
The user's prompt will be processed by an AI assistant that understands them regardless of errors. Your job is to help the USER improve by showing corrections.
Rules:
- Fix spelling, grammar, punctuation, and word choice errors
- Improve awkward phrasing to sound natural
- Keep technical terms, code references, and tool names unchanged
- Preserve the user's intent and structure exactly
- Do NOT restructure or expand the prompt — only correct errors
Output format (strict):
- If the prompt has errors, output EXACTLY two lines:
  Line 1: The corrected prompt
  Line 2: A parenthetical listing each fix as original>corrected, separated by semicolons
- If the prompt has NO errors, output EXACTLY: CLEAN`;

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

    const result = callHaiku(SYSTEM_REFINE, detection.text);
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
    const result = callHaiku(SYSTEM_TRANSLATE, detection.text);
    if (!result) {
      if (summaryCtx) emit({ additionalContext: summaryCtx });
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

  const result = callHaiku(system, detection.text);
  if (!result) {
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  if (result === "CLEAN") {
    logClean();
    if (summaryCtx) emit({ additionalContext: summaryCtx });
    return;
  }

  const lines = result.split("\n").filter(Boolean);
  const corrected = lines[0] || result;
  const annotations = lines[1] || "";

  logCorrection({ mode: "correct", original: detection.text, corrected, annotations });

  let ctx = `Corrected prompt: ${corrected}`;
  if (summaryCtx) ctx += " " + summaryCtx;
  const msg = annotations ? `${corrected}\n${annotations}` : corrected;
  emit({ additionalContext: ctx, systemMessage: msg });
}

main();
