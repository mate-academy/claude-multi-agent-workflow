# localization-toolkit

A Claude Code plugin that localizes content for multiple markets in one command: it translates copy for each target locale in parallel, audits the results for regional SEO, then applies the fixes.

## Why use it

- **Culturally adapted, not word-for-word.** Idioms, tone, register, and formats are adapted per locale, and approved terms come from a translation memory and lexicon.
- **SEO-ready output.** Keyword density, title/meta length, and search intent are checked per target market, with CJK length rules handled separately.
- **Safe by design.** The auditing agent is read-only, and a hook catches broken placeholders (`{name}`, `%d`) before they ship.
- **One trigger.** A single command runs the whole flow.

## Installation

```
/plugin marketplace add javelinnathan/claude-multi-agent-workflow
/plugin install localization-toolkit@localization-marketplace
/reload-plugins
```

For local development, run `claude --plugin-dir .` from the repo root and use `/reload-plugins` after edits.

## Usage: the workflow command

```
/localization-toolkit:localize-content <source-file> <locale> [<locale> ...]
```

Example:

```
/localization-toolkit:localize-content copy.md es-MX ja-JP
```

| Step | What runs | Ordering |
|---|---|---|
| 1. Translate | One `content-translator` per locale, launched together | Parallel |
| 2. SEO analysis | One `seo-locale-analyzer` per locale on its translated file | Waits for step 1 |
| 3. Apply fixes | `content-translator` applies the analyzer's keyword and metadata fixes | Waits for step 2 |

Output files are written next to the source as `copy.es-MX.md`, `copy.ja-JP.md`, and so on. The source file is never modified. Locale codes are BCP 47 tags.

## Subagents and how they are scoped

| | `content-translator` | `seo-locale-analyzer` |
|---|---|---|
| Purpose | Translates copy and adapts idioms, tone, and cultural nuance | Audits keyword density, title/meta length, and search intent for the target regional search engine |
| Tools | `Read, Grep, Glob, Write, Edit` | `Read, Grep, Glob` (read-only) |
| Model | `sonnet` (adaptation needs judgment) | `haiku` (mostly counting and pattern matching) |
| Data it uses | `data/translation-memory.json` (reuse approved translations) and `data/lexicon.json` (approved terms, do-not-translate list) | Grep regexes for metadata extraction and hygiene checks; density computed from Grep counts |
| Returns | Output file paths, adaptations with reasons, memory/lexicon hits, new term candidates, review flags | Per-locale summary, keyword table, metadata lengths, intent check, prioritized fixes |

The analyzer cannot edit files, so an audit can never rewrite the copy it is judging. All edits go through the translator, the only agent with write access. You can also call either agent directly, for example "use the seo-locale-analyzer to check keywords and meta tags in the de-DE version".

## Skill: `locale-style-guide`

Per-locale conventions for es-MX, fr-FR, de-DE, and ja-JP: formal vs. informal address, date/number/currency formats, punctuation, and title/meta length guidance. Claude loads it automatically when translating, reviewing, or SEO-checking for a target locale. It also restates the rules to never translate brand terms and to keep placeholders identical. To add a locale, add a row to `skills/locale-style-guide/SKILL.md`.

## Hook: placeholder check

A `PostToolUse` hook (`hooks/hooks.json`) runs `${CLAUDE_PLUGIN_ROOT}/scripts/check-placeholders.js` after every `Write` or `Edit`.

- It applies only to files named `name.<locale>.ext` (for example `copy.es-MX.md`).
- It compares their placeholders (`{name}`, `{{count}}`, `%s`, `%d`) with the source file `name.ext`.
- On a mismatch it reports the missing and unexpected placeholders back to Claude so it can fix the file. All other files are ignored.

## Layout

```
.claude-plugin/
  plugin.json          # manifest
  marketplace.json     # marketplace catalog
agents/                # content-translator, seo-locale-analyzer
commands/              # localize-content workflow
skills/                # locale-style-guide/SKILL.md
hooks/                 # hooks.json
scripts/               # check-placeholders.js
data/                  # translation memory and lexicon (seed data)
course-api/            # Express API used as a test target
NOTES.md               # scoping and orchestration decisions
```

See `NOTES.md` for the reasoning behind the scoping and orchestration choices.

---

# Course instructions (original project brief)

## Project — Ship your workflow as a plugin
 
Across the course you've built scoped subagents, orchestrated them into workflows, written skills, commands, and hooks, and learned how a plugin packages all of it. Now you'll put it together into one real, shareable thing: a plugin that carries a multi-agent workflow, tested against a live codebase and published so anyone can install it with a single command.
 
Lean on Claude as you go: ask it to scaffold files, look up current syntax, and review your structure. That's how you'd really build one.
 
---
 
### The repository
 
We've provided a repo for your plugin — this is where you'll assemble and publish it. The same Express API from the earlier projects is included here under course-api/; build and test your plugin against it so your subagents and workflow operate on real code rather than a toy example.
 
By the end, the provided repo will be two things at once: the plugin itself, and the marketplace that offers it.
 
---
 
### What you'll build
 
A single plugin that bundles:
 
- Two scoped subagents — purpose-built workers, each limited to the tools and model its job needs.
- A multi-agent workflow command — one command that runs those subagents as a workflow, with at least one parallel step and one dependent step.
- A skill and a hook — to round the plugin into a complete setup, not just agents.
- A manifest, a README, and a marketplace catalog — so the plugin installs by name and you can version it.
---
 
### Before you start

- Have this repo cloned. The course API to test against is included here in `course-api/` — `cd course-api && npm install` once so it's ready to run.
- Skim back over Unit 8 (creating, scoping, and orchestrating subagents) and Unit 9 (plugin structure, `${CLAUDE_PLUGIN_ROOT}`, marketplaces, versioning) — you'll use all of it.
- Decide on a theme for your plugin so the pieces belong together. A 'code quality' plugin (review + tests + a formatting hook) or a 'release' plugin (changelog + version bump + checks) both work well.
---
 
### Tasks
 
#### Task 1 — Scaffold the plugin.
In the provided repo, create the plugin structure: `.claude-plugin/plugin.json` with a `name` and a starting `version`, the component folders you'll need at the root, and a `README.md`. Confirm the layout is right — only `plugin.json` lives inside `.claude-plugin/`, everything else sits at the root.
 
#### Task 2 — Build two scoped subagents.
Add at least two custom subagents in `agents/`. For each one:
- a `description` that names when to use it, in the words a real situation would use;
- a body that says what to do and what to return;
- a `tools` line limited to what the job actually needs (read-only workers get read-and-search tools only);
- a `model` matched to the difficulty of the job.
Make them genuinely different — for example, a read-only reviewer and an agent that writes or edits.
 
#### Task 3 — Orchestrate them into a workflow command.
Add a command in `commands/` whose body runs your subagents as a workflow. It must include at least one parallel step and one dependent (sequential) step — independent work running together, and a step that waits for earlier results. Write the orchestration in plain language, the command is the one-word trigger for the whole flow.
 
#### Task 4 — Round out the bundle: a skill and a hook.
Add one skill (`skills/<name>/SKILL.md`) and one hook (`hooks/hooks.json`) that fit your plugin's theme. If the hook runs a bundled script, reference it through `${CLAUDE_PLUGIN_ROOT}` so it resolves wherever the plugin installs — don't hardcode a path.
 
#### Task 5 — Test it locally.
Load the plugin with `claude --plugin-dir .` from the repo root and run it against the API in  course-api/. Confirm each piece fires by its namespaced name, and that your workflow command orchestrates the subagents in the right order. Use `/reload-plugins` to pick up edits as you refine. Fix anything that doesn't load — start by checking folder placement.
 
#### Task 6 — Publish it as a marketplace.
Add `.claude-plugin/marketplace.json` listing your plugin (its `name` matching `plugin.json`, `source: "./"`, a one-line description). Commit and push. Then, as your own first user, run `/plugin marketplace add <your repo>` and `/plugin install <your-plugin>@<your-marketplace>` in a fresh session, and confirm everything installs and runs cleanly.
 
#### Task 7 — Document it in `NOTES.md`.
Add a `NOTES.md` to the repo covering:
- what the plugin does and how to install it;
- one scoping decision and why you made it (why a subagent got the tools or model it did);
- why your workflow command runs the steps it does in parallel versus in sequence.
---
 
### Definition of Done
 
- [ ] The repo has a valid plugin: `.claude-plugin/plugin.json` with `name` and `version`, component folders at the root, and a `README.md`.
- [ ] At least two subagents in `agents/`, each with a sharp description, a body that states what to return, a scoped `tools` line, and a fitting `model`.
- [ ] A workflow command in `commands/` that orchestrates the subagents with at least one parallel step and one dependent step.
- [ ] A skill in `skills/<name>/SKILL.md` and a hook in `hooks/hooks.json`, both fitting the plugin's theme; any bundled script path uses `${CLAUDE_PLUGIN_ROOT}`.
- [ ] The plugin loads and runs locally via  --plugin-dir against the API in course-api/.
- [ ] `.claude-plugin/marketplace.json` is present and correct, and the plugin installs cleanly via `/plugin marketplace add` + `/plugin install`.
- [ ] `NOTES.md` covers install steps, one scoping decision, and one orchestration decision.
- [ ] Everything is committed and pushed.
---
 
### How to submit
 
Build your plugin in this repo, commit, and open the pull request against the main repository, not your fork,. Make sure `plugin.json`, `marketplace.json`, all your component folders, the `README.md`, and `NOTES.md` are committed, and that the repo installs as a marketplace from a clean checkout.
 
---
 
### How it's checked
 
This project is graded automatically by the **Validate plugin** check that runs on every push — the tick or cross next to your latest commit, with the full run in the Actions tab. When you first open the repo the check is **red**, because there's no plugin yet. It turns **green** once your plugin is complete and correctly structured, and green is the pass. If it's red, open the run: it prints exactly which item is missing or wrong.
 
The check confirms everything that can be read from your files:
- `plugin.json` is valid with a `name` and `version`, and only manifest files sit inside `.claude-plugin/`;
- at least two subagents in `agents/`, each with a `description`, a body, a scoped `tools` line, and a `model` — and genuinely different: at least one read-only worker, and at least one that can write or edit;
- a workflow command in `commands/`;
- a skill at `skills/<name>/SKILL.md` and a hook at `hooks/hooks.json`, with no hardcoded absolute paths (use `${CLAUDE_PLUGIN_ROOT}`);
- `marketplace.json` is valid and lists your plugin under the same `name` as `plugin.json`;
- `README.md` and a real `NOTES.md` are present.
