# Notas del plugin `api-quality`

## Qué hace y cómo se instala

`api-quality` revisa la calidad de una API Express con un solo comando, `/api-quality:quality-check`. Lanza dos revisores de solo lectura en paralelo, junta lo que encuentran, le pasa los huecos de pruebas a un subagente que escribe tests y al final vuelve a correr `npm test` y `npm run lint` para comparar contra la línea base. Además trae una skill con las convenciones de la API (`api-quality:api-conventions`) y un hook que corre ESLint sobre cada `.js` que Claude escribe o edita.

Instalación:

```
/plugin marketplace add juanpame65-sudo/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

Para probarlo en local: `claude --plugin-dir .` desde la raíz del repo, y `/reload-plugins` después de cada edición. La API de prueba está en `course-api/` (hacer `npm install` una vez).

## Decisión de alcance: herramientas y modelo de cada subagente

**`api-reviewer`** tiene solo `Read, Grep, Glob` y usa `sonnet`. Su trabajo es juzgar código, no cambiarlo, así que no necesita escribir ni ejecutar nada: quitarle `Write`, `Edit` y `Bash` hace imposible que "arregle" algo por su cuenta y deja el reporte como una opinión limpia e independiente. Pongo `sonnet` porque encontrar bugs y violaciones de convenciones pide criterio, y ahí vale la pena un modelo más capaz.

**`test-writer`** tiene `Read, Grep, Glob, Write, Edit, Bash` y usa `haiku`. Necesita escribir archivos de test y correr `npm test` / `npm run lint` para demostrar que pasan, por eso es el único con `Bash`. Su trabajo es mecánico: copiar el estilo de `tests/users.test.js` y cubrir casos que ya vienen listados. Para eso `haiku` alcanza y es más barato y rápido. Como las herramientas no pueden limitarlo a una carpeta, la restricción de tocar solo `tests/` está escrita en sus instrucciones, y el comando repite que ningún archivo de código fuente se modifica.

## Decisión de orquestación: qué va en paralelo y qué en secuencia

**En paralelo (paso 1):** los dos `api-reviewer` y la línea base de tests y lint. Cada uno trabaja sobre archivos distintos (`routes/` contra `db/` y `server.js`) o solo lee, y ninguno necesita el resultado de los otros, así que correrlos juntos tarda lo que tarde el más lento en vez de la suma de los tres. La línea base también va aquí porque se mide sobre el código sin tocar.

**En secuencia (pasos 2 a 4):** `test-writer` no puede empezar hasta tener la lista unida de huecos de pruebas, porque sin ella no sabe qué escribir. Y la verificación final tiene que esperar a que existan las pruebas nuevas, porque su objetivo es compararlas con la línea base. Si esos pasos corrieran en paralelo, el escritor trabajaría a ciegas y la verificación mediría un estado a medias.
