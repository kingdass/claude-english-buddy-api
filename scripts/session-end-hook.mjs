#!/usr/bin/env node
// SessionEnd hook — show a brief session summary of corrections made.

import process from "node:process";
import { readToday } from "./lib/state.mjs";
import { parseAnnotations } from "./lib/annotations.mjs";

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

  // Find recurring mistakes in this session — bucket by case-insensitive
  // (original, corrected) pair so "Its" and "its" count together.
  const fixes = {};
  for (const r of corrections) {
    for (const fix of parseAnnotations(r.annotations)) {
      const key = `${fix.original.toLowerCase()}|${fix.corrected.toLowerCase()}`;
      const entry = fixes[key] || { label: `${fix.original} → ${fix.corrected}`, count: 0 };
      entry.count += 1;
      fixes[key] = entry;
    }
  }

  const recurring = Object.values(fixes)
    .filter((entry) => entry.count >= 2)
    .sort((a, b) => b.count - a.count);

  if (recurring.length > 0) {
    process.stderr.write(
      "Recurring this session: " +
        recurring.map((entry) => `${entry.label} (${entry.count}x)`).join(", ") +
        "\n",
    );
  }
}

main();
