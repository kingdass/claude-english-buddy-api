import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { logCorrection, logClean } from "../scripts/lib/state.mjs";
import { todayStats } from "../scripts/lib/stats.mjs";

function withTempData(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ec-stats-test-"));
  const prev = process.env.CLAUDE_PLUGIN_DATA;
  process.env.CLAUDE_PLUGIN_DATA = dir;
  try {
    fn(dir);
  } finally {
    if (prev == null) delete process.env.CLAUDE_PLUGIN_DATA;
    else process.env.CLAUDE_PLUGIN_DATA = prev;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("todayStats returns zeros when no data", () => {
  withTempData(() => {
    const stats = todayStats();
    assert.equal(stats.total, 0);
    assert.equal(stats.corrections, 0);
    assert.equal(stats.errorRate, 0);
  });
});

test("todayStats computes error rate", () => {
  withTempData(() => {
    logCorrection({ mode: "correct", original: "a", corrected: "b", annotations: "(a>b)" });
    logCorrection({ mode: "correct", original: "c", corrected: "d", annotations: "(c>d)" });
    logClean();
    logClean();
    const stats = todayStats();
    assert.equal(stats.total, 4);
    assert.equal(stats.corrections, 2);
    assert.equal(stats.errorRate, 50);
    assert.equal(stats.clean, 2);
  });
});

test("todayStats extracts patterns", () => {
  withTempData(() => {
    logCorrection({ mode: "correct", original: "its", corrected: "it's", annotations: "(its>it's)" });
    logCorrection({ mode: "correct", original: "its", corrected: "it's", annotations: "(its>it's)" });
    logCorrection({ mode: "correct", original: "modul", corrected: "module", annotations: "(modul>module)" });
    const stats = todayStats();
    assert.equal(stats.patterns.length, 2);
    assert.equal(stats.patterns[0].original, "its");
    assert.equal(stats.patterns[0].count, 2);
  });
});

test("todayStats counts translations and refinements", () => {
  withTempData(() => {
    logCorrection({ mode: "translate", original: "中文", corrected: "Chinese" });
    logCorrection({ mode: "refine", original: "fix auth", corrected: "Refactor the authentication module" });
    logClean();
    const stats = todayStats();
    assert.equal(stats.translations, 1);
    assert.equal(stats.refinements, 1);
    assert.equal(stats.clean, 1);
  });
});
