# English Coach

A Claude Code plugin that provides real-time English language coaching for non-native speakers who use AI coding tools daily.

## Purpose

Help non-native English speakers improve their writing by identifying and correcting errors in their prompts while preserving technical intent and code references.

## Core Coaching Rules

1. **Fix these error types:**
   - Spelling errors (typos, misspellings)
   - Grammar errors (tense, agreement, structure)
   - Punctuation errors (missing/incorrect marks)
   - Word choice errors (incorrect word selection, awkward phrasing)

2. **Preserve these elements:**
   - Technical terms and jargon
   - Code references and variable names
   - Tool names and command syntax
   - User's intent and structure
   - Original content organization

3. **Never do this:**
   - Restructure or reorganize content
   - Expand or add new ideas
   - Change technical terms
   - Alter the user's voice or style beyond error correction

## Output Format

When coaching a prompt, produce exactly:

```
{Corrected prompt text}
({original>corrected}; {original>corrected}; ... )
```

If no errors found:
```
CLEAN
```

## Implementation

### Commands

- `coach` — Check a prompt for English errors and provide corrections

### Agents

- `coach-engine` — Core correction logic, processes prompts and identifies error patterns

### Scoring

Success metrics:
- **Accuracy**: Corrections are valid and don't change meaning (target: 99%+)
- **Coverage**: All detectable errors are caught (target: 95%+)
- **False positives**: Never flag correct text as wrong (target: <1%)

## Development Strategy

1. Start with command-line interface for testing
2. Build correction agent with comprehensive error patterns
3. Integrate with Claude Code's command system
4. Gather feedback from non-native English speaking users
5. Iterate on accuracy and coverage

## Testing

Tested with 1,263+ test cases covering:
- Common spelling mistakes
- Grammar and tense errors
- Punctuation issues
- Word choice and phrasing problems
- Edge cases with code and technical terms
