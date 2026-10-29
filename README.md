# api-quality

> **In short:** a Claude Code plugin that runs a multi-agent code-quality workflow on an Express API. It bundles two scoped subagents (a read-only reviewer and a test writer), one workflow command (`/api-quality:quality-check`) with parallel and sequential steps, a skill with the API conventions, a lint-on-edit hook (using `${CLAUDE_PLUGIN_ROOT}`) and a marketplace entry. Install: `/plugin marketplace add juanpame65-sudo/claude-multi-agent-workflow` then `/plugin install api-quality@api-quality-marketplace`. This `README.md` lives at the repo root; design decisions are in [`NOTES.md`](NOTES.md).

Plugin de Claude Code que revisa la calidad de una API Express con un flujo multi-agente: dos subagentes con herramientas distintas, un comando que los orquesta, una skill con las convenciones y un hook que corre el linter cada vez que Claude edita un `.js`.

La API de prueba está en [`course-api/`](course-api/).

## Qué incluye

| Pieza | Archivo | Nombre con namespace |
| --- | --- | --- |
| Manifiesto | `.claude-plugin/plugin.json` | `api-quality` |
| Subagente de solo lectura | `agents/api-reviewer.md` | `api-quality:api-reviewer` |
| Subagente que escribe pruebas | `agents/test-writer.md` | `api-quality:test-writer` |
| Comando del flujo | `commands/quality-check.md` | `/api-quality:quality-check` |
| Skill | `skills/api-conventions/SKILL.md` | `api-quality:api-conventions` |
| Hook (PostToolUse) | `hooks/hooks.json` + `scripts/lint-edited.js` | — |
| Catálogo | `.claude-plugin/marketplace.json` | `api-quality-marketplace` |

Solo los archivos de manifiesto (`plugin.json` y `marketplace.json`) viven dentro de `.claude-plugin/`. Todo lo demás está en la raíz.

## Instalación

Desde Claude Code, en cualquier sesión:

```
/plugin marketplace add juanpame65-sudo/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

Para probarlo sin instalar, desde la raíz del repo:

```
claude --plugin-dir .
```

Después de editar archivos del plugin, usa `/reload-plugins`.

## Uso

```
/api-quality:quality-check            # revisa course-api
/api-quality:quality-check course-api # igual, con la carpeta explícita
```

Antes de la primera corrida: `cd course-api && npm install`.

El flujo:

1. En paralelo: dos `api-reviewer` (uno en `routes/`, otro en `db/` y `server.js`) y la línea base de `npm test` y `npm run lint`.
2. Se unen los hallazgos en una sola lista.
3. `test-writer` escribe las pruebas que faltan.
4. Se vuelve a correr todo y se entrega un reporte corto.

## Estructura del repo

```
.
├── .claude-plugin/
│   ├── plugin.json          # manifiesto: name + version
│   └── marketplace.json     # catálogo (source: "./")
├── agents/
│   ├── api-reviewer.md      # solo lectura: Read, Grep, Glob
│   └── test-writer.md       # escribe pruebas: Write, Edit, Bash
├── commands/
│   └── quality-check.md     # flujo: paralelo + secuencial
├── skills/
│   └── api-conventions/
│       └── SKILL.md
├── hooks/
│   └── hooks.json           # PostToolUse -> ${CLAUDE_PLUGIN_ROOT}/scripts/lint-edited.js
├── scripts/
│   └── lint-edited.js
├── course-api/              # API Express de prueba
├── NOTES.md                 # instalación y decisiones
└── README.md                # este archivo
```

Más detalle de las decisiones en [`NOTES.md`](NOTES.md).
