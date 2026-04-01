---
description: "Today's language report — corrections made, recurring mistakes, lessons, and improvement trend"
---

## Workflow

### Step 1: Load today's correction history

```bash
node -e "
  import { todayStats } from '${CLAUDE_PLUGIN_ROOT}/scripts/lib/stats.mjs';
  console.log(JSON.stringify(todayStats()));
"
```

Parse the JSON output. It contains: `date`, `total`, `corrections`, `clean`, `translations`, `refinements`, `errorRate`, `patterns` (array of {original, corrected, count}), `records` (array of correction records).

If `total` is 0: respond "No prompts processed today yet." and STOP.

### Step 2: Load comparison data

```bash
node -e "
  import { todayStats, periodStats, weeklyTrend } from '${CLAUDE_PLUGIN_ROOT}/scripts/lib/stats.mjs';
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yd = yesterday.toISOString().slice(0, 10);
  import { readDay } from '${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.mjs';
  const yRecords = readDay(yd);
  const yTotal = yRecords.length;
  const yCorrections = yRecords.filter(r => r.mode !== 'clean').length;
  const yRate = yTotal > 0 ? Math.round(yCorrections / yTotal * 100) : 0;
  const week = periodStats(7);
  const trend = weeklyTrend(4);
  console.log(JSON.stringify({ yesterday: { total: yTotal, corrections: yCorrections, errorRate: yRate }, week, trend }));
"
```

### Step 3: Generate report

```markdown
# Today's Language Report — {date}

## Overview

| Metric | Today | Yesterday | 7-day avg |
|--------|------:|----------:|----------:|
| Prompts | {total} | {yesterday.total} | {week.total / 7 rounded} |
| Corrections | {corrections} ({errorRate}%) | {yesterday.corrections} ({yesterday.errorRate}%) | {week.corrections / 7 rounded} ({week.errorRate}%) |
| Translations | {translations} | — | — |
| Clean prompts | {clean} | — | — |
| Refinements (::) | {refinements} | — | — |

## Today's Corrections

| # | You Wrote | Corrected | Pattern |
|---|-----------|-----------|---------|
{for each record in records: | N | original | corrected | annotations | }

## Recurring Patterns

| Pattern | Count Today | Status |
|---------|:-----------:|--------|
{for each pattern with count > 1: | original > corrected | count | comment |}

## Lessons of the Day

{Pick the top 2-3 most interesting/educational corrections from today. For each:}

1. **{pattern name}** — {explanation of the rule}
   Wrong: "{original}"
   Right: "{corrected}"

## Trend

| Week | Error Rate | Corrections/Day |
|------|:----------:|:---------------:|
{for each week in trend: | weekStart — weekEnd | errorRate% | avgPerDay |}

{If error rate is decreasing: "You're improving. Error rate down {delta}% in {weeks} weeks."}
{If error rate is flat: "Holding steady. Focus on your recurring patterns to break through."}
{If error rate is increasing: "Error rate is up — try to slow down and re-read before submitting."}
```
