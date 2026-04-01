---
name: writing-guide
description: "English writing patterns for developers — common mistakes by non-native speakers, technical writing conventions, and self-correction strategies. Use when reviewing or coaching English text."
version: 0.1.0
---

# English for Developers — Quick Reference

## Most Common Mistakes by Non-Native Speakers

### Articles (a / the / zero article)

| Wrong | Right | Rule |
|-------|-------|------|
| "Fix bug in authentication" | "Fix **the** bug in authentication" | Specific bug = use "the" |
| "Create a new the file" | "Create a new file" | Already have "a" = drop "the" |
| "I use the React" | "I use React" | Framework/tool names = no article |

### Its vs It's

| Form | Meaning | Example |
|------|---------|---------|
| it's | it is / it has | "It's broken" = "It is broken" |
| its | possessive (belonging to it) | "The module and its tests" |

### Subject-Verb Agreement

| Wrong | Right | Rule |
|-------|-------|------|
| "There is many issues" | "There **are** many issues" | Plural subject = plural verb |
| "The data show" | "The data **shows**" | "Data" is usually singular in tech |
| "None of the tests pass" | "None of the tests **passes**" | "None" = singular (formal) |

### Who vs That vs Which

| Use | For | Example |
|-----|-----|---------|
| who | People | "The developer **who** wrote this" |
| that | Things (restrictive) | "The function **that** handles auth" |
| which | Things (non-restrictive) | "The module, **which** was added last week, has a bug" |

### Prepositions

| Wrong | Right |
|-------|-------|
| "depend of" | "depend **on**" |
| "consist in" | "consist **of**" |
| "different of" | "different **from**" |
| "search a solution" | "search **for** a solution" |

## Technical Writing Patterns

### Imperative Voice for Instructions

| Weak | Strong |
|------|--------|
| "You should run the tests" | "Run the tests" |
| "It would be good to add logging" | "Add logging" |
| "We need to refactor this" | "Refactor this" |

### Concise Phrasing

| Wordy | Concise |
|-------|---------|
| "In order to" | "To" |
| "Due to the fact that" | "Because" |
| "At this point in time" | "Now" |
| "In the event that" | "If" |
| "Has the ability to" | "Can" |
| "Is going to" | "Will" |

### Commit Message Patterns

| Bad | Good |
|-----|------|
| "Fixed bug" | "Fix null pointer in session handler" |
| "Updated code" | "Refactor auth module to use token-based validation" |
| "Changes" | "Add rate limiting to API endpoints" |

Rule: imperative mood, present tense, specific. "Fix X" not "Fixed X" or "Fixes X".
