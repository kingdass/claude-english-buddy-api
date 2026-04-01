---
description: "Your top recurring English mistakes — all-time patterns that need attention"
argument-hint: "[--top N]"
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Load all-time patterns

```bash
node -e "
  import { readLastNDays } from '${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.mjs';
  const records = readLastNDays(365);
  const patterns = {};
  for (const r of records) {
    if (!r.annotations) continue;
    const fixes = r.annotations.replace(/^\(/, '').replace(/\)$/, '').split(';').map(s => s.trim()).filter(Boolean);
    for (const fix of fixes) {
      const parts = fix.split('>');
      if (parts.length === 2) {
        const key = parts[0].trim() + '>' + parts[1].trim();
        patterns[key] = (patterns[key] || 0) + 1;
      }
    }
  }
  const sorted = Object.entries(patterns).map(([k, c]) => ({ pattern: k, count: c })).sort((a, b) => b.count - a.count);
  const total = records.length;
  const corrections = records.filter(r => r.mode !== 'clean').length;
  console.log(JSON.stringify({ total, corrections, patterns: sorted }));
"
```

### Step 2: Parse arguments

Default top N: 20. Override with `--top N`.

### Step 3: Generate report

```markdown
# Recurring Mistakes

**Period**: All time ({total} prompts, {corrections} corrections)

## Top {N} Patterns

| # | You Write | Should Be | Times | Category |
|---|-----------|-----------|------:|----------|
{for each pattern: | N | original | corrected | count | category |}

Categories: spelling, grammar (tense/agreement/structure), punctuation, word-choice, article, preposition

## Focus Areas

{Group the top patterns by category. For the top 3 categories:}

### {Category 1}: {count} total occurrences

{Explain the underlying rule with 2-3 examples from the user's actual mistakes.}

### {Category 2}: {count} total occurrences

{Same format.}

### {Category 3}: {count} total occurrences

{Same format.}
```
