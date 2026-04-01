---
description: "Configure claude-english-buddy — set language, strictness, toggle auto-correction"
argument-hint: "[--show | --set key=value]"
---

## User Input

```text
$ARGUMENTS
```

## Workflow

### Step 1: Parse arguments

| Input | Action |
|-------|--------|
| (empty) or `--show` | Show current config |
| `--set auto_correct=true` | Set a config value |
| `--set summary_language=Chinese` | Set summary language |
| `--set strictness=strict` | Set strictness level |
| `--set domain_terms=Tailscale,Headscale` | Set domain terms |

### Step 2: Show current config

Read both global config (`~/.claude/hooks/prompt_coach.json`) and project config (`.claude-english-buddy.json` in cwd). Display merged result:

```markdown
# English Coach Config

## Active Settings (merged)

| Setting | Value | Source |
|---------|-------|--------|
| auto_correct | {value} | {global / project / default} |
| summary_language | {value or "disabled"} | {source} |
| strictness | {value} | {source} |
| domain_terms | {list or "none"} | {source} |

## Strictness Levels

| Level | Behavior |
|-------|----------|
| gentle | Only fix clear errors. Accept informal English. |
| standard | Fix errors + improve awkward phrasing. (default) |
| strict | Fix everything + suggest more natural alternatives. |

## Config Files

- Global: `~/.claude/hooks/prompt_coach.json`
- Project: `.claude-english-buddy.json` (in project root)
- Priority: project > global > defaults
```

### Step 3: Set config value

If `--set` was used, update the project config file (`.claude-english-buddy.json` in cwd):

```bash
node -e "
  import fs from 'fs';
  const file = '.claude-english-buddy.json';
  const config = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  config['{key}'] = {value};
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
  console.log('Set {key} = {value}');
"
```

Then show the updated merged config.
