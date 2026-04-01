// Trend analysis — compute stats from correction history.

import { readDay, readToday, readLastNDays, listHistoryDates } from "./state.mjs";

function countByMode(records) {
  const counts = { correct: 0, translate: 0, refine: 0, clean: 0 };
  for (const r of records) {
    const mode = r.mode || "clean";
    counts[mode] = (counts[mode] || 0) + 1;
  }
  return counts;
}

function extractPatterns(records) {
  const patterns = {};
  for (const r of records) {
    if (!r.annotations) continue;
    // Parse "original>corrected; original>corrected" format
    const fixes = r.annotations
      .replace(/^\(/, "")
      .replace(/\)$/, "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const fix of fixes) {
      const parts = fix.split(">");
      if (parts.length === 2) {
        const key = `${parts[0].trim().toLowerCase()}>${parts[1].trim().toLowerCase()}`;
        patterns[key] = (patterns[key] || 0) + 1;
      }
    }
  }
  return Object.entries(patterns)
    .map(([key, count]) => {
      const [original, corrected] = key.split(">");
      return { original, corrected, count };
    })
    .sort((a, b) => b.count - a.count);
}

export function todayStats() {
  const records = readToday();
  const total = records.length;
  const counts = countByMode(records);
  const corrections = total - counts.clean;
  const errorRate = total > 0 ? Math.round((corrections / total) * 100) : 0;
  const patterns = extractPatterns(records);

  return {
    date: new Date().toISOString().slice(0, 10),
    total,
    corrections,
    clean: counts.clean,
    translations: counts.translate,
    refinements: counts.refine,
    errorRate,
    patterns,
    records: records.filter((r) => r.mode !== "clean"),
  };
}

export function periodStats(days) {
  const records = readLastNDays(days);
  const total = records.length;
  const counts = countByMode(records);
  const corrections = total - counts.clean;
  const errorRate = total > 0 ? Math.round((corrections / total) * 100) : 0;
  const patterns = extractPatterns(records);

  return {
    days,
    total,
    corrections,
    clean: counts.clean,
    translations: counts.translate,
    refinements: counts.refine,
    errorRate,
    patterns,
  };
}

export function weeklyTrend(weeks = 4) {
  const trend = [];
  const now = new Date();
  for (let w = 0; w < weeks; w++) {
    const end = new Date(now);
    end.setDate(end.getDate() - w * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const records = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().slice(0, 10);
      records.push(...readDay(date));
    }

    const total = records.length;
    const counts = countByMode(records);
    const corrections = total - counts.clean;
    const errorRate = total > 0 ? Math.round((corrections / total) * 100) : 0;
    const avgPerDay = total > 0 ? Math.round((corrections / 7) * 10) / 10 : 0;

    trend.push({
      weekStart: start.toISOString().slice(0, 10),
      weekEnd: end.toISOString().slice(0, 10),
      total,
      corrections,
      errorRate,
      avgPerDay,
    });
  }
  return trend.reverse();
}
