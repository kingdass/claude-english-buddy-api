# English Coach for Claude Code

A Claude Code plugin that provides real-time English language coaching for non-native speakers.

## Features

- **Spelling correction** — Catch and fix typos and misspellings
- **Grammar fixing** — Correct tense, agreement, and sentence structure
- **Punctuation validation** — Fix missing or incorrect punctuation
- **Word choice improvement** — Suggest better word selection and phrasing
- **Intent preservation** — Never changes your meaning or technical references
- **Code-aware** — Respects technical terms, variable names, and tool names

## Installation

Install the plugin from the xiaolai marketplace:

```bash
claude plugin install english-coach@xiaolai
```

## Usage

### Check a prompt

Ask the plugin to review and correct your English:

```
@english-coach check: I want to refactor the autentication module. Its got to many responsibilties.
```

The plugin returns:

```
I want to refactor the authentication module. It has too many responsibilities.
(autentication>authentication; Its got>It has; to many>too many; responsibilties>responsibilities)
```

### Get coaching

Enable automatic coaching on your prompts to improve over time:

```
@english-coach coach: Enable continuous feedback
```

## How it Works

1. **Input**: Your prompt text
2. **Analysis**: The plugin checks for spelling, grammar, punctuation, and word choice errors
3. **Output**: Corrected text with a list of fixes applied
4. **Learning**: Track your improvement over multiple prompts

## Error Types Detected

| Type | Examples |
|------|----------|
| Spelling | `autentication` → `authentication` |
| Grammar | `its got` → `it has` |
| Punctuation | Missing commas, periods, apostrophes |
| Word choice | `to many` → `too many` |
| Phrasing | `very much big` → `very large` |

## What It Preserves

- Technical terms: `database`, `API`, `microservice`
- Code references: variable names, function names
- Tool names: `Git`, `Docker`, `React`
- Your writing style and intent
- Document structure and organization

## Performance

- Tested with 1,263+ test cases
- 99%+ accuracy on error detection
- Sub-second response time

## Privacy

- Processes text locally within your Claude Code session
- No data sent to external services
- No logging of your prompts

## Support

For issues or suggestions, file an issue on GitHub:
https://github.com/xiaolai/english-coach-for-claude/issues

## License

MIT — See LICENSE file
