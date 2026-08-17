// Authentication — credential resolution and auth-header construction.
//
// The hook can talk to several backends, each with its own way of presenting
// credentials. This module owns *how to authenticate*, so the callers don't
// have to. Two concerns live here:
//
//   1. Resolving credentials (env vars, macOS keychain) — `anthropicCredentials`.
//   2. Building the auth header / bearer config that proves them to the API.
//
// The external provider's API key itself is read from the environment in
// `provider.mjs` (`externalApiKey`); here we only turn a key/token into the
// header the HTTP layer needs.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Resolve Anthropic credentials with macOS keychain fallback.
// Order: CLAUDE_CODE_OAUTH_TOKEN → ANTHROPIC_API_KEY → macOS keychain.
// Returns { token, expired } or null.
export function anthropicCredentials() {
  const envOauth = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  if (envOauth) return { token: envOauth, expired: false };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) return { token: apiKey, expired: false };

  if (process.platform !== "darwin") return null;

  const result = spawnSync("security", [
    "find-generic-password", "-s", "Claude Code-credentials", "-w",
  ], { encoding: "utf8", timeout: 5_000 });
  if (result.error || result.status !== 0) return null;

  try {
    const creds = JSON.parse(result.stdout.trim());
    const token = creds?.claudeAiOauth?.accessToken;
    const expiresAt = creds?.claudeAiOauth?.expiresAt;
    if (!token) return null;
    return { token, expired: Boolean(expiresAt && Date.now() > expiresAt) };
  } catch {
    return null;
  }
}

// Anthropic OAuth tokens (sk-ant-oat...) require `Authorization: Bearer`;
// plain API keys use `x-api-key`.
export function anthropicAuthHeader(token) {
  return token.startsWith("sk-ant-oat")
    ? `Authorization: Bearer ${token}`
    : `x-api-key: ${token}`;
}

// Write an external provider's bearer token to a 0600 temp config file so it
// stays out of the process list (`curl`'s argv is visible via `ps`). The
// caller is responsible for deleting the returned file.
export function writeBearerConfigFile(key) {
  const cfgFile = path.join(os.tmpdir(), `ceb-${process.pid}-${Date.now()}.cfg`);
  fs.writeFileSync(cfgFile, `header = "Authorization: Bearer ${key}"\n`, { mode: 0o600 });
  return cfgFile;
}
