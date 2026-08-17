// External LLM provider resolution (chat-completions API).
//
// The hook can run against any provider that exposes a `/chat/completions`
// endpoint — DeepSeek, Kimi, Qwen, GLM, etc. — so it no longer requires a
// Claude subscription. These helpers are pure so the request-body building can
// be unit-tested without a network call or reading stdin.
//
// Configuration is via environment variables (API keys should never live in a
// project config file):
//   ENGLISH_BUDDY_API_KEY  — the provider's API key
//   ENGLISH_BUDDY_BASE_URL — base URL of the chat-completions endpoint
//                             (default: https://api.deepseek.com/v1)
//   ENGLISH_BUDDY_MODEL    — model name (default: deepseek-chat)

export function externalApiKey() {
  return process.env.ENGLISH_BUDDY_API_KEY || "";
}

export function externalBaseUrl() {
  return (process.env.ENGLISH_BUDDY_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
}

export function externalModel() {
  return process.env.ENGLISH_BUDDY_MODEL || "deepseek-chat";
}

// Build the chat-completions request body (JSON string). Unlike the Anthropic
// Messages API, the system prompt is a `role: "system"` message inside the
// messages array rather than a separate top-level field.
export function buildChatBody({ model, systemPrompt, userText }) {
  return JSON.stringify({
    model,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ],
  });
}
