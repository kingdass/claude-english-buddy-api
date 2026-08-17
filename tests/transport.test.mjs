import test from "node:test";
import assert from "node:assert/strict";

import { parseResponse } from "../scripts/lib/transport.mjs";

// Shared per-shape extractors/isAuthError, mirroring the hook's callers.
const chatCompletions = {
  extractText: (r) => r.choices?.[0]?.message?.content,
  isAuthError: (e) => /auth|invalid|401|403/i.test(String(e?.type || e?.code || "")),
};
const anthropicMessages = {
  extractText: (r) => r.content?.[0]?.text || "",
  isAuthError: (e) => e?.type === "authentication_error",
};

test("parseResponse extracts chat-completions text", () => {
  const { text, authError } = parseResponse({
    stdout: JSON.stringify({ choices: [{ message: { content: "  hello  " } }] }),
    ...chatCompletions,
  });
  assert.equal(text, "hello");
  assert.equal(authError, false);
});

test("parseResponse extracts Anthropic messages text", () => {
  const { text, authError } = parseResponse({
    stdout: JSON.stringify({ content: [{ text: "hi there" }] }),
    ...anthropicMessages,
  });
  assert.equal(text, "hi there");
  assert.equal(authError, false);
});

test("parseResponse flags auth errors from chat-completions", () => {
  const { text, authError } = parseResponse({
    stdout: JSON.stringify({ error: { type: "invalid_request_error", code: "invalid_api_key" } }),
    ...chatCompletions,
  });
  assert.equal(text, null);
  assert.equal(authError, true);
});

test("parseResponse flags Anthropic authentication_error", () => {
  const { text, authError } = parseResponse({
    stdout: JSON.stringify({ error: { type: "authentication_error" } }),
    ...anthropicMessages,
  });
  assert.equal(text, null);
  assert.equal(authError, true);
});

test("parseResponse does not flag non-auth errors", () => {
  const { text, authError } = parseResponse({
    stdout: JSON.stringify({ error: { type: "rate_limit_error" } }),
    ...anthropicMessages,
  });
  assert.equal(text, null);
  assert.equal(authError, false);
});

test("parseResponse returns null on malformed JSON", () => {
  const { text, authError } = parseResponse({
    stdout: "not json",
    ...chatCompletions,
  });
  assert.equal(text, null);
  assert.equal(authError, false);
});

test("parseResponse returns null on empty stdout", () => {
  const { text, authError } = parseResponse({ stdout: "", ...chatCompletions });
  assert.equal(text, null);
  assert.equal(authError, false);
});
