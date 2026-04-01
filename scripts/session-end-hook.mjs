#!/usr/bin/env node
// SessionEnd hook — show a brief session summary of corrections made.

import fs from "node:fs";
import process from "node:process";
import { readToday } from "./lib/state.mjs";

function main() {
  const records = readToday();
  if (records.length === 0) return;

  const corrections = records.filter((r) => r.mode === "correct");
  const translations = records.filter((r) => r.mode === "translate");
  const refinements = records.filter((r) => r.mode === "refine");
  const clean = records.filter((r) => r.mode === "clean");
  const total = records.length;

  if (corrections.length === 0 && translations.length === 0) return;

  const parts = [];
  parts.push(`Session language stats: ${total} prompts`);
  if (corrections.length > 0) parts.push(`${corrections.length} corrections`);
  if (translations.length > 0) parts.push(`${translations.length} translations`);
  if (refinements.length > 0) parts.push(`${refinements.length} refinements`);
  if (clean.length > 0) parts.push(`${clean.length} clean`);

  process.stderr.write(parts.join(", ") + "\n");

  // Find recurring mistakes in this session
  const fixes = {};
  for (const r of corrections) {
    if (!r.annotations) continue;
    const items = r.annotations.replace(/^\(/, "").replace(/\)$/, "").split(";").map((s) => s.trim()).filter(Boolean);
    for (const item of items) {
      fixes[item] = (fixes[item] || 0) + 1;
    }
  }

  const recurring = Object.entries(fixes)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a);

  if (recurring.length > 0) {
    process.stderr.write("Recurring this session: " + recurring.map(([fix, n]) => `${fix} (${n}x)`).join(", ") + "\n");
  }
}

main();
