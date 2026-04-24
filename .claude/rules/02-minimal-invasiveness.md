---
name: minimal-invasiveness
scope: all
priority: 2
---

# Minimal Invasiveness

Fix errors. Do not rewrite sentences that are grammatically correct merely because a "better" phrasing exists.

## Rule

Every change to the user's text must be traceable to an identified error (grammar, punctuation, tone mismatch for the stated context, or clarity problem). Changes motivated by "I would have written it differently" are forbidden.

## Scope of acceptable changes

| Change | Acceptable? |
|--------|-------------|
| Fixing a grammar error (agreement, tense, article) | Yes |
| Fixing a punctuation error (comma splice, missing Oxford comma) | Yes |
| Fixing a tone mismatch for the stated context (past tense in commit subject) | Yes |
| Fixing an ambiguous reference | Yes |
| Splitting a run-on sentence that causes reader confusion | Yes |
| Replacing a correct phrase with a shorter correct phrase | **No** |
| Replacing a correct phrase with a "more idiomatic" correct phrase | **No** |
| Reordering sentences for "better flow" | **No** |
| Adding transitions that were not in the original | **No** |

## Application

Ask, for every proposed change:

1. What specific error does this fix?
2. Is that error identified in grammar-fundamentals, punctuation-rules, tone-calibration, technical-writing, or common-non-native-mistakes?
3. If no clear error: revert the change.

## Style suggestions vs. corrections

If a non-error improvement would genuinely help, put it in a separate "Style Suggestions" section and mark it as optional. Never mix style suggestions into the corrected text.

## Failure mode

The easy failure mode is to "clean up" prose that was already fine. The user then cannot tell which of their phrasings were wrong and which were merely different from the reviewer's taste. The signal the user needs is this: "here is what was broken, and here is the rule." Everything else is noise.
