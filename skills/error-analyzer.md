---
description: "Analyze error patterns and provide detailed feedback"
user-invocable: false
---

# Error Analyzer

Detailed analysis of English language errors to help users improve systematically.

## Error Categories

### Spelling (SP)
- Typos: `recieve` → `receive`
- Misspellings: `occured` → `occurred`
- Homophone confusion: `its`/`it's`, `their`/`there`

### Grammar (GR)
- Verb tense: `I am writing` vs `I am write`
- Subject-verb agreement: `The code are` → `The code is`
- Pronoun usage: `I`/`me`, `who`/`whom`
- Modifiers: Dangling or misplaced

### Punctuation (PU)
- Missing periods, commas, question marks
- Apostrophes in contractions: `its` vs `it's`
- Quotation marks and parentheses
- Semicolon/colon usage

### Word Choice (WC)
- Wrong word: `to/too/two`, `affect/effect`
- Awkward phrasing: `make a code` → `write code`
- Redundancy: `repeat again`
- Vague terms: `thing`, `stuff`

### Style (ST)
- Clarity issues
- Conciseness opportunities
- Formality mismatches

## Analysis Process

1. **Categorize** each error by type
2. **Count** errors per category
3. **Identify patterns** in the user's writing
4. **Suggest** areas for improvement
5. **Celebrate** progress on previously fixed errors

## Output Format

```markdown
## Error Analysis

### Summary
- Total errors: N
- Most common: {category} (N instances)
- Accuracy: {percentage}%

### By Category
- Spelling: N errors
- Grammar: N errors
- Punctuation: N errors
- Word Choice: N errors

### Pattern Analysis
- Recurring errors: {list}
- Previously fixed errors: {list}
- Areas of strength: {list}

### Recommendations
1. Focus on {top category}
2. Practice {specific issue}
3. Review {rule} for {pattern}
```

## Examples

### User's Pattern: Verb Tense Issues
Common mistakes:
- `I am coding` (correct) vs `I coding` (wrong)
- `The program has run` vs `The program has runned`

Recommendation: Review English verb tense rules, especially past participles.

### User's Pattern: Punctuation
Common mistakes:
- Missing commas in lists
- Forgetting apostrophes in contractions

Recommendation: Use a checklist when writing longer prompts.

### User's Progress
Session 1: 8 errors
Session 2: 5 errors
Session 3: 3 errors

Trend: Improving! Keep up the practice.
