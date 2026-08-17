import test from "node:test";
import assert from "node:assert/strict";

import {
  externalApiKey,
  externalBaseUrl,
  externalModel,
  buildOpenAIBody,
} from "../scripts/lib/provider.mjs";

function withEnv(env, fn) {
  const saved = {};
  for (const key of Object.keys(env)) {
    saved[key] = process.env[key];
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(saved)) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}

test("externalApiKey prefers OPENAI_API_KEY over DEEPSEEK_API_KEY", () => {
  withEnv({ OPENAI_API_KEY: "sk-openai", DEEPSEEK_API_KEY: "sk-deepseek" }, () => {
    assert.equal(externalApiKey(), "sk-openai");
  });
});

test("externalApiKey falls back to DEEPSEEK_API_KEY", () => {
  withEnv({ OPENAI_API_KEY: undefined, DEEPSEEK_API_KEY: "sk-deepseek" }, () => {
    assert.equal(externalApiKey(), "sk-deepseek");
  });
});

test("externalApiKey returns empty string when neither is set", () => {
  withEnv({ OPENAI_API_KEY: undefined, DEEPSEEK_API_KEY: undefined }, () => {
    assert.equal(externalApiKey(), "");
  });
});

test("externalBaseUrl defaults to DeepSeek", () => {
  withEnv({ OPENAI_BASE_URL: undefined }, () => {
    assert.equal(externalBaseUrl(), "https://api.deepseek.com/v1");
  });
});

test("externalBaseUrl strips trailing slashes", () => {
  withEnv({ OPENAI_BASE_URL: "https://api.openai.com/v1/" }, () => {
    assert.equal(externalBaseUrl(), "https://api.openai.com/v1");
  });
});

test("externalModel defaults to deepseek-chat", () => {
  withEnv({ ENGLISH_BUDDY_MODEL: undefined }, () => {
    assert.equal(externalModel(), "deepseek-chat");
  });
});

test("externalModel honors ENGLISH_BUDDY_MODEL", () => {
  withEnv({ ENGLISH_BUDDY_MODEL: "kimi-latest" }, () => {
    assert.equal(externalModel(), "kimi-latest");
  });
});

test("buildOpenAIBody emits system + user messages and max_tokens", () => {
  const body = JSON.parse(
    buildOpenAIBody({ model: "deepseek-chat", systemPrompt: "SYS", userText: "hello" }),
  );
  assert.equal(body.model, "deepseek-chat");
  assert.equal(body.max_tokens, 1024);
  assert.deepEqual(body.messages, [
    { role: "system", content: "SYS" },
    { role: "user", content: "hello" },
  ]);
});
