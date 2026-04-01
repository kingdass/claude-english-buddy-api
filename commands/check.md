---
description: "Check a prompt for English errors and get corrections"
user-invocable: true
---

# Check English

Analyze your prompt for spelling, grammar, punctuation, and word choice errors.

## Usage

```
@english-coach check: Your prompt text here
```

## What It Does

1. Analyzes your prompt for errors
2. Generates a corrected version
3. Lists all corrections made
4. Preserves technical terms and intent

## Example

Input:
```
I want to refactor the autentication module. Its got too many responsibilties.
```

Output:
```
I want to refactor the authentication module. It has too many responsibilities.
(autentication>authentication; Its got>It has; responsibilties>responsibilities)
```

## Output Format

- **No errors**: `CLEAN`
- **Has errors**: Two lines
  - Line 1: Corrected text
  - Line 2: Parenthetical list of fixes as `original>corrected`

## Tips

- Be specific: longer prompts get more accurate corrections
- Technical terms: Code references and tool names are preserved
- Style: Corrections focus on errors, not style changes
- Learning: Review corrections to improve your English over time

## See Also

- `/english-coach:coach` — Enable continuous coaching
- `/english-coach:analyze` — Detailed error analysis
