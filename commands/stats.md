---
description: "Long-term correction trends — error rate over time, most common mistakes, improvement trajectory"
argument-hint: "[--days N]"
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Parse arguments

| Input | Period |
|-------|--------|
| (empty) | Last 30 days |
| `--days N` | Last N days |

### Step 2: Load stats

```bash
node -e "
  import { periodStats, weeklyTrend } from '${CLAUDE_PLUGIN_ROOT}/scripts/lib/stats.mjs';
  const days = parseInt('${DAYS}') || 30;
  const stats = periodStats(days);
  const trend = weeklyTrend(Math.ceil(days / 7));
  console.log(JSON.stringify({ stats, trend }));
"
```

### Step 3: Generate report

```markdown
# Language Stats — Last {days} Days

## Summary

| Metric | Value |
|--------|------:|
| Total prompts | {total} |
| Corrections made | {corrections} ({errorRate}%) |
| Translations | {translations} |
| Refinements | {refinements} |
| Clean prompts | {clean} ({100 - errorRate}%) |

## Top 10 Recurring Mistakes

| # | You Write | Should Be | Times |
|---|-----------|-----------|------:|
{for each of top 10 patterns: | N | original | corrected | count |}

## Weekly Trend

| Week | Prompts | Corrections | Error Rate |
|------|--------:|------------:|-----------:|
{for each week: | start — end | total | corrections | errorRate% |}

## Analysis

{Analyze the trend — improving, flat, or regressing?}
{Identify the top 3 mistake categories and suggest focus areas.}
```
