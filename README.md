# api-quality-kit

A Claude Code plugin that checks the quality of a small Express API with a team of subagents. One command runs the whole workflow: two read-only reviewers work at the same time, a test writer then adds the tests they find missing, and the tests and lint run at the end.

The repository is both the plugin and the marketplace that offers it. The example API it runs on is in `course-api/`.

## Install

In Claude Code:

```
/plugin marketplace add mandziakl-cell/claude-multi-agent-workflow
/plugin install api-quality-kit@api-quality-kit-marketplace
```

To try it without installing, load it from a clone of this repo for one session:

```bash
claude --plugin-dir .
```

Run `/reload-plugins` after you edit a component.

## Use it

Install the API's dependencies once, so tests and lint can run:

```bash
cd course-api && npm install
```

Then, from the repo root, run the workflow:

```
/api-quality-kit:quality-check
```

You can pass another API folder: `/api-quality-kit:quality-check my-api`. The default is `course-api`.

If you load the plugin with `claude --plugin-dir .` from this repo's root, writes inside the repo are blocked as "sensitive files". See "Testing notes" below.

## What is inside

| Part | Name | What it does |
|---|---|---|
| Subagent | `api-reviewer` | Read-only (`Read`, `Grep`, `Glob`), `sonnet`. Reviews routes and the store against the project's conventions and returns findings by severity plus a list of behaviors that need tests. |
| Subagent | `docs-checker` | Read-only (`Read`, `Grep`, `Glob`), `haiku`. Compares `docs/api.md` with the routes and returns every mismatch. |
| Subagent | `test-writer` | Can write (`Read`, `Grep`, `Glob`, `Write`, `Edit`), `sonnet`. Adds the missing `supertest` tests. It has no shell, so it cannot run anything. |
| Command | `/api-quality-kit:quality-check` | The workflow below. |
| Skill | `api-test-conventions` | How tests are written in this API. It applies when you ask for tests for the routes. |
| Hook | `PostToolUse` lint | After Claude writes or edits a `.js` file, runs the ESLint of that file's own project through `scripts/lint-js.js`, so lint errors reach Claude at once. |

## How the workflow runs

1. **In parallel:** `api-reviewer` and `docs-checker` start together, because neither needs the other.
2. **Depends on step 1:** `test-writer` starts only after both reports are back, because it works from their findings.
3. **Depends on step 2:** the main session runs `npm test` and `npm run lint` on the API, one after the other, and reports the real result.

Only `test-writer` writes files, and the command tells it to stay inside the API's `tests/` folder.

## Things to know

- The hook only lints when the edited file belongs to a project that has ESLint installed and an ESLint config. Until you run `npm install` in `course-api/`, it does nothing.
- A subagent cannot be limited to a folder by its tool list, so `test-writer` staying inside `tests/` is an instruction, not a hard lock. Review the changes it makes before you commit them.
- Known bugs in the API are written as `todo` tests, so the test suite stays green and the bug stays visible.

## Testing notes

I tested the plugin with headless runs (`claude -p`) in throwaway copies of this repo, with the plugin loaded by `--plugin-dir` from its own folder and `course-api/` in a separate project folder.

**Verified**
- The plugin loads with no errors and registers the command, the three subagents, the skill and the hook.
- The workflow ran in the right order: `api-reviewer` and `docs-checker` were started together, `test-writer` started after both had finished, and `npm test` and `npm run lint` ran last.
- On `course-api`, `test-writer` added 32 tests (18 normal, 14 `todo` for bugs) and changed no application code. I ran the suite myself: 37 tests, 23 pass, 0 fail, 14 todo. Lint exits 0.
- The skill fired, without being named, for "Add tests for the GET /health route in course-api."
- The hook exits 2 and reports the problem when Claude writes a JavaScript file with a lint error. It exits 0 for a clean file, and it ignores other file types, files in `node_modules`, and folders without ESLint.

**A limit I found**
- When the plugin is loaded from the repo root (`claude --plugin-dir .`) and the API is inside that same folder, Claude Code treats every file in the folder as sensitive and blocks writes there, including `course-api/tests/`. In my headless runs the writes were denied, so `test-writer` wrote nothing and the hook never ran. The two reviewers are read-only and were not affected.
- The workflow worked fully when the plugin was loaded from its own folder and the API was in a different project folder.
- I have not tested whether an interactive session lets you approve those writes, so I cannot say it works from the repo root.

**Marketplace install (verified)**
- I added the marketplace straight from GitHub at this branch (`mandziakl-cell/claude-multi-agent-workflow#api-quality-plugin`) and installed `api-quality-kit@api-quality-kit-marketplace` with `--scope local`, in a throwaway project and with an isolated Claude config folder. The plugin showed as enabled (version 0.1.0) and the install held every component.
- In a fresh session with the installed copy loaded, the workflow ran in order and added tests to the project: 38 tests, 21 pass, 0 fail, 17 todo, lint exit 0. No application code changed.
- Until this branch is merged, `/plugin marketplace add mandziakl-cell/claude-multi-agent-workflow` reads the default branch `main`, which does not have the plugin yet. Add `#api-quality-plugin` to the end to install from the branch.

**Not tested**
- Registering the marketplace in my normal user-level Claude config and running the command from there. I used an isolated config for the install, and the live run loaded the installed copy with `--plugin-dir`.
- An interactive session, including approving writes.

## Layout

```
.
├── .claude-plugin/
│   ├── plugin.json         # name + version
│   └── marketplace.json    # the catalog that lists this plugin
├── agents/                 # api-reviewer, docs-checker, test-writer
├── commands/               # quality-check
├── skills/api-test-conventions/SKILL.md
├── hooks/hooks.json
├── scripts/lint-js.js      # run by the hook through ${CLAUDE_PLUGIN_ROOT}
├── course-api/             # the example API the plugin is tested on
├── NOTES.md
└── README.md
```

Only manifest files live in `.claude-plugin/`. Everything else sits at the root.

## Check the structure

The "Validate plugin" check runs on every push. You can run it locally:

```bash
node .github/scripts/validate-plugin.js
claude plugin validate .
```
