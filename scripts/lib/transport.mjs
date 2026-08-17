// HTTP transport + response parsing — the shared "call a chat API" plumbing.
//
// Every backend the hook talks to needs the same dance: make a synchronous
// HTTP request, parse the JSON, pull out the text, and classify whether a
// non-200 error was an authentication failure (so the user gets a targeted
// warning instead of silence). That dance used to be copy-pasted into each
// provider caller; it lives here once now.

import { spawnSync } from "node:child_process";

// Synchronous HTTP POST via curl. The claude CLI deadlocks when spawned inside
// hooks, so we shell out to curl directly. `configFile` is an optional curl
// `-K` config (used to keep bearer tokens out of argv). Returns raw stdout, or
// null on transport failure (spawn error, non-zero exit, timeout).
export function postJson({ url, headers = [], configFile = null, body }) {
  const args = ["-s", "--max-time", "30"];
  if (configFile) args.push("-K", configFile);
  for (const h of headers) args.push("-H", h);
  args.push("-d", body, url);

  const result = spawnSync("curl", args, { encoding: "utf8", timeout: 35_000 });
  if (result.error || result.status !== 0) return null;
  return result.stdout;
}

// Parse a JSON response body and extract the assistant text, classifying
// provider-returned errors as auth failures via `isAuthError`. Returns
// `{ text, authError }`; text is null on any failure (including malformed
// JSON), and authError is true only for recognized auth errors.
export function parseResponse({ stdout, extractText, isAuthError }) {
  if (!stdout) return { text: null, authError: false };

  try {
    const response = JSON.parse(stdout);
    if (response.error) {
      return { text: null, authError: isAuthError(response.error) };
    }
    const text = extractText(response);
    return {
      text: (typeof text === "string" ? text : "").trim() || null,
      authError: false,
    };
  } catch {
    return { text: null, authError: false };
  }
}
