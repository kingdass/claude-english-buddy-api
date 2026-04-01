# english-coach

English language coach for non-native speakers using Claude Code. Auto-corrects prompts via UserPromptSubmit hook, tracks corrections, generates daily reports.

## Project structure

```
commands/
  today.md              /today — daily correction report with lessons
  stats.md              /stats — long-term trends and improvement
  mistakes.md           /mistakes — all-time recurring errors
  config.md             /config — configure settings
  review.md             /review — deep text review
agents/
  writing-reviewer.md   Deep English text reviewer (sonnet, green)
skills/
  english-coach/
    writing-guide/
      SKILL.md          English patterns for developers
hooks/
  hooks.json            UserPromptSubmit + SessionEnd hooks
scripts/
  prompt-coach-hook.mjs   Main hook — correct/translate/refine
  session-end-hook.mjs    Session summary on exit
  lib/
    detect.mjs          Language detection (ASCII ratio heuristic)
    state.mjs           Correction history (JSONL per day)
    stats.mjs           Trend analysis and pattern extraction
tests/
  detect.test.mjs       Language detection tests
  state.test.mjs        State persistence tests
  stats.test.mjs        Stats computation tests
package.json            Node.js project config
```

## Conventions

### Hook behavior

The UserPromptSubmit hook has four modes:
- **correct**: English with errors → fix and show corrections via `systemMessage`
- **translate**: Non-English detected (ASCII ratio < 85%) → translate via `systemMessage`
- **refine**: `::` prefix → rewrite into precise prompt via `systemMessage`
- **skip**: slash commands, short prompts, code patterns → exit 0

All modes inject corrected/translated text into `additionalContext` so Claude acts on the clean version. If `summary_language` is configured, the summary instruction is appended to `additionalContext` in all modes.

### State storage

Correction history stored as JSONL in `$CLAUDE_PLUGIN_DATA/english-coach/history/YYYY-MM-DD.jsonl`. One line per correction event:

```json
{"ts":"...","mode":"correct","original":"...","corrected":"...","annotations":"(...)","session":"..."}
```

Clean prompts logged as `{"mode":"clean"}` for accurate rate calculation.

### Config resolution

Priority: project (`.english-coach.json`) > global (`~/.claude/hooks/prompt_coach.json`) > defaults.

### Testing

```bash
npm test    # Node.js native test runner
```
