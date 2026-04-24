---
description: "Shared: correction-history JSONL format and parsing pattern"
user-invocable: false
---
<!-- Shared partial: JSONL parser -->
<!-- Referenced by: today, stats, mistakes, drill. Do not use standalone. -->

## Correction-History JSONL

Every UserPromptSubmit hook call appends one line to the day's JSONL file. The library functions in `scripts/lib/state.mjs` read and write this file. This partial documents the format so commands can fall back to raw parsing when the library is unavailable.

### File Layout

```
$CLAUDE_PLUGIN_DATA/claude-english-buddy/history/YYYY-MM-DD.jsonl
```

One file per calendar day. One JSON object per line. Files are append-only.

### Record Shape

Every record has these fields (some nullable):

| Field | Type | Notes |
|-------|------|-------|
| `ts` | ISO 8601 string | Timestamp of the event |
| `mode` | `"correct"` / `"translate"` / `"refine"` / `"clean"` | Which hook branch fired |
| `original` | string or null | User's raw input (null for `clean`) |
| `corrected` | string or null | What the hook produced (null for `clean`) |
| `annotations` | string or null | Parenthetical diff string, e.g. `(its got>it has; modul>module)` |
| `pattern` | string or null | Dominant pattern label (optional) |
| `session` | string or null | `CLAUDE_SESSION_ID` when the hook ran |

### Mode Semantics

| Mode | Meaning |
|------|---------|
| `correct` | English input with errors — prompt was fixed |
| `translate` | Non-English input — prompt was translated into English |
| `refine` | `::` prefix — rough idea rewritten into a precise prompt |
| `clean` | English input with no errors — nothing to fix, logged for rate calculation |

### Canonical Read Pattern

Prefer the library:

```bash
node -e "
  const { readDay, readLastNDays, listHistoryDates } = await import('${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.mjs');
  console.log(JSON.stringify(readDay('2026-04-24')));
"
```

### Fallback Raw Read

When the library import fails (missing node_modules, wrong path), commands MUST be able to fall back to raw `Glob` + `Read`:

1. `Glob` the history dir: `$CLAUDE_PLUGIN_DATA/claude-english-buddy/history/*.jsonl`
2. `Read` the target file(s).
3. Split by `\n`, filter empty lines, `JSON.parse` each line inside a `try/catch` (skip malformed lines).
4. Build the aggregate manually.

### Extracting Corrections

Within the parsed records, corrections are every record where `mode !== "clean"`. The `annotations` field, when present, contains the diff pairs joined by `; ` inside parentheses — e.g. `(autentication>authentication; modul>module)`. Split on `; ` to get individual diff pairs; split each pair on `>` to get `[original, corrected]`.

### Pattern Extraction for Reports

For stats and mistakes reports, aggregate by the `(original, corrected)` pair across records:

1. Iterate records.
2. Parse the `annotations` diff pairs.
3. Count occurrences of each `original>corrected` pair.
4. Sort by count descending.
5. Classify each pair into a category (spelling, grammar, punctuation, word-choice, article, preposition) using heuristics.

### Extracting User Prompts

For drills and previews, iterate `correct` records. The `original` field is the user's raw prompt; the `corrected` field is the fixed version. Combined with `annotations`, they form the full learning signal.
