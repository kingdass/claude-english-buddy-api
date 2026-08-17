// External LLM provider resolution (OpenAI-compatible API).
//
// The hook can run against any OpenAI-compatible endpoint — DeepSeek, OpenAI,
// Kimi, Qwen, GLM, etc. — so it no longer requires a Claude subscription. These
// helpers are pure so the request-body building can be unit-tested without a
// network call or reading stdin.
//
// Configuration is via environment variables (API keys should never live in a
// project config file):
//   OPENAI_API_KEY     — the API key (canonical name, shared with other tools)
//   DEEPSEEK_API_KEY   — alias, used only when OPENAI_API_KEY is unset
//   OPENAI_BASE_URL    — base URL of the compatible endpoint
//                        (default: https://api.deepseek.com/v1)
//   ENGLISH_BUDDY_MODEL— model name (default: deepseek-chat)

export function externalApiKey() {
  return process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || "";
}

export function externalBaseUrl() {
  return (process.env.OPENAI_BASE_URL || "https://api.deepseek.com/v1").replace(/\/+$/, "");
}

export function externalModel() {
  return process.env.ENGLISH_BUDDY_MODEL || "deepseek-chat";
}

// Build the OpenAI Chat Completions request body (JSON string). Unlike the
// Anthropic Messages API, the system prompt is a `role: "system"` message
// inside the messages array rather than a separate top-level field.
export function buildOpenAIBody({ model, systemPrompt, userText }) {
  return JSON.stringify({
    model,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ],
  });
}
