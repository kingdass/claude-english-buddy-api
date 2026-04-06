---
name: review
description: "Deep English review of any text — commit messages, PR descriptions, docs, emails"
argument-hint: "<text or file path>"
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Resolve input

| Input | Action |
|-------|--------|
| File path | Read the file |
| Inline text | Use directly |
| (empty) | Ask for text via AskUserQuestion |

### Step 2: Review

For texts over 5,000 words, suggest breaking into sections and reviewing one section at a time.

Analyze the text for:

1. **Grammar & Mechanics** — spelling, punctuation, tense, agreement, articles
2. **Clarity** — awkward phrasing, ambiguous sentences, wordiness
3. **Tone** — appropriate for the context (commit message vs docs vs email)
4. **Structure** — logical flow, paragraph breaks, transitions
5. **Technical accuracy** — correct use of technical terms

### Step 3: Report

```markdown
# English Review

**Text length**: {words} words
**Overall quality**: {Excellent / Good / Needs Work / Poor}
**Error count**: {N}

## Corrected Version

{Full corrected text}

## Changes Made

| # | Original | Corrected | Category | Explanation |
|---|----------|-----------|----------|-------------|
| 1 | ... | ... | grammar | ... |

## Style Suggestions

{Optional improvements that aren't errors but would sound more natural.}

## Summary

{2-3 sentence assessment: what's good, what needs work, one actionable tip.}
```
