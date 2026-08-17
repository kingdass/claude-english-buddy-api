import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  anthropicAuthHeader,
  writeBearerConfigFile,
} from "../scripts/lib/auth.mjs";

test("anthropicAuthHeader uses Bearer for OAuth tokens", () => {
  assert.equal(
    anthropicAuthHeader("sk-ant-oat-abc123"),
    "Authorization: Bearer sk-ant-oat-abc123",
  );
});

test("anthropicAuthHeader uses x-api-key for API keys", () => {
  assert.equal(
    anthropicAuthHeader("sk-ant-api03-xyz789"),
    "x-api-key: sk-ant-api03-xyz789",
  );
});

test("writeBearerConfigFile writes an 0600 bearer header config", () => {
  const file = writeBearerConfigFile("sk-test-token");
  try {
    assert.equal(
      fs.readFileSync(file, "utf8"),
      'header = "Authorization: Bearer sk-test-token"\n',
    );
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  } finally {
    fs.unlinkSync(file);
  }
});
