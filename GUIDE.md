# English Coach User Guide

A step-by-step guide to getting the most out of the English Coach plugin.

## Quick Start

### 1. Install the Plugin

```bash
claude plugin install english-coach@xiaolai
```

### 2. Check Your First Prompt

```
@english-coach check: I want to refactor the autentication module.
```

**Response:**
```
I want to refactor the authentication module.
(autentication>authentication)
```

### 3. Review the Correction

- The first line shows the corrected text
- The parenthetical shows what was fixed
- Use this as a learning opportunity

---

## Commands Overview

### `/english-coach:check`

Quick error check without detailed analysis.

**Best for:** Fast feedback on your writing

```
@english-coach check: Your text here
```

**Output:**
- Corrected text (or CLEAN if no errors)
- List of fixes made

### `/english-coach:analyze`

Detailed analysis of errors and patterns.

**Best for:** Understanding your error patterns

```
@english-coach analyze: Your text here
```

**Output:**
- Total errors by category
- Pattern analysis
- Improvement recommendations

---

## Learning from Corrections

### Step 1: Identify the Error

Look at the parenthetical and understand what changed:
```
(autentication>authentication)
```
This is a **spelling error**: missing an 'e' in the middle.

### Step 2: Understand the Rule

- **Spelling:** Learn the correct spelling
- **Grammar:** Understand the rule (e.g., singular verb = singular subject)
- **Punctuation:** Know when and why marks are needed
- **Word choice:** Learn the difference between similar words

### Step 3: Remember for Next Time

- Write it down
- Use it in your next prompt intentionally
- Check the coach to verify you got it right

### Step 4: Celebrate Progress

Track improvements:
- Errors in Session 1: 8
- Errors in Session 2: 5
- Errors in Session 3: 3

You're improving! 🎉

---

## Error Type Reference

### Spelling Errors

**What to watch:**
- Double letters: `recieve` → `receive`, `occured` → `occurred`
- Missing letters: `autentication` → `authentication`
- Extra letters: `responsibilties` → `responsibilities`

**How to improve:**
- Read the word aloud slowly
- Break it into syllables: au-then-ti-ca-tion
- Write it 5 times to build muscle memory

### Grammar Errors

**What to watch:**
- Verb tense: `I am coding` (correct) vs `I coding` (wrong)
- Subject-verb agreement: `Code is` (singular) vs `Codes are` (plural)
- Pronouns: `he/him`, `who/whom`

**How to improve:**
- Review English grammar rules
- Identify the subject and main verb
- Check if they match (both singular or both plural)

### Punctuation Errors

**What to watch:**
- Missing periods at end of sentences
- Missing commas in lists
- Missing apostrophes in contractions (`it's`, `don't`, `isn't`)

**How to improve:**
- Read your text aloud—pause at commas, stop at periods
- Check contractions: always need an apostrophe
- Use checklists for longer prompts

### Word Choice Errors

**What to watch:**
- Homophones: `to/too/two`, `their/there/they're`, `its/it's`
- Wrong word: `affect/effect`, `loose/lose`
- Awkward phrasing: `make the code more better` → `improve the code`

**How to improve:**
- Learn the differences (create flashcards if helpful)
- Remember pairs: `your` = possession, `you're` = "you are"
- Use simpler, more direct phrasing

---

## Keyboard Shortcuts & Tips

### Save Time

```
# For frequently checked prompts
@english-coach check: [paste your prompt]

# For ongoing improvement
@english-coach analyze: [paste longer text for detailed feedback]
```

### Build Habits

1. **Always check before submitting important prompts**
2. **Review corrections to understand patterns**
3. **Track your improvement weekly**
4. **Practice writing more to build confidence**

---

## Common Mistakes & How to Avoid Them

### Mistake 1: Ignoring Patterns

**Problem:** You keep making the same error

**Solution:** 
- Write down your recurring errors
- Review the rule that governs each one
- Practice until it becomes automatic

### Mistake 2: Not Reviewing Corrections

**Problem:** You get feedback but don't understand why

**Solution:**
- For each correction, ask: "Why did this change?"
- Look up the rule if you're unsure
- Ask for clarification in detailed analysis mode

### Mistake 3: Being Discouraged by Errors

**Problem:** Too many errors feels overwhelming

**Solution:**
- Errors are learning opportunities, not failures
- Everyone makes mistakes
- Focus on one error type at a time
- Celebrate incremental improvement

---

## Advanced Usage

### Session Memory

The coach remembers:
- Your most common errors
- Corrections you've already made
- Your progress over multiple prompts

Use this to your advantage—the more you use it, the better the coaching.

### Multi-Prompt Learning

```
Session 1: 8 errors detected
  @english-coach check: [prompt 1]
  @english-coach check: [prompt 2]

Session 2: 5 errors detected (down from 8!)
  @english-coach check: [prompt 3]
  @english-coach check: [prompt 4]

Session 3: 3 errors detected (continuing improvement!)
```

### Error Category Focus

If you struggle with a specific category:

```
# Week 1: Focus on spelling
# Week 2: Focus on grammar
# Week 3: Focus on word choice
# Repeat and refine
```

---

## Privacy & Security

- ✅ All processing happens locally in your Claude Code session
- ✅ No data sent to external services
- ✅ No logging of your prompts
- ✅ Your writing is private

---

## Getting Help

### If Something Doesn't Work

1. **Verify the plugin is installed:** `claude plugin list`
2. **Update the plugin:** `claude plugin update english-coach@xiaolai`
3. **Check the syntax:** Make sure you're using `@english-coach check:` format

### If You Disagree with a Correction

Corrections are based on standard English grammar rules. If you believe a correction is wrong:

1. Check standard grammar references
2. Report the issue with examples
3. Consider context—sometimes informal English is intentional

---

## Next Steps

1. **Install the plugin** and run your first check
2. **Review the examples** in EXAMPLES.md
3. **Check your prompts regularly** to build the habit
4. **Track your progress** week to week
5. **Celebrate improvements** and set new goals

---

## Resources

- [English Grammar Rules](https://www.english-grammar-rules.com/)
- [Common Spelling Errors](https://www.spelling.com/)
- [Homophones Guide](https://www.homophones.com/)

## Support

For questions or suggestions:
- GitHub Issues: https://github.com/xiaolai/english-coach-for-claude/issues
- Documentation: See README.md and EXAMPLES.md

---

## Your English Learning Journey

```
Week 1          Week 4          Week 12
8 errors        4 errors        <1 error
   |───────────►    |──────────►    |
   |                |               |
   ✓ Aware         ✓ Improving     ✓ Confident
   ✓ Learning      ✓ Consistent    ✓ Skilled
```

You've got this! Every correction is progress. Keep writing, keep learning.
