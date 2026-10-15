# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Juego de Arkanoid en HTML, CSS y JavaScript puro, **cero dependencias** (sin npm, bundler ni framework). Se juega abriendo `index.html` en el navegador (mejor servido por HTTP, ver Assets). No hay build, lint ni tests. El repo es git (rama `main`).

Archivos: `index.html` (canvas 800x600), `style.css`, `game.js` (bucle, entrada, física, colisiones, HUD, niveles, sonidos) y `assets/`.

Specs implementadas: 01 MVP jugable, 02 animación de destrucción, 03 sonidos y 4 niveles con avance automático.

## Assets (`assets/`)

- `spritesheet-breakout.png`: spritesheet único (paddle, bola, bloques, explosiones).
- `spritesheet.js`: script global (sin módulos ES) que define `SPRITES`, `EXPLOSION_FRAMES`, `EXPLOSION_DURATION` y las funciones `loadSpritesheet(cb)`, `drawFrame(ctx, frame, x, y, w, h)` y `drawSprite(ctx, name, x, y, w, h)`.
  - Hay que llamar a `loadSpritesheet` y esperar el callback antes de dibujar; `drawSprite`/`drawFrame` no hacen nada si aún no cargó.
  - Los bloques se piden como `'block_<color>'` (gray, red, yellow, cyan, magenta, hotpink, green); paddle y bola como `'paddle'` / `'ball'`.
  - La ruta de la imagen es relativa a la página HTML (`assets/spritesheet-breakout.png`), así que el HTML debe estar en la raíz.
  - `EXPLOSION_FRAMES.gray` reutiliza los frames de `red` (probable placeholder).
  - La carga requiere servir por HTTP o `file://` permisivo, pues copia la imagen a un canvas offscreen.
- `sounds/`: `ball-bounce.mp3` y `break-sound.mp3`.

## Flujo spec-driven (`.claude/skills/`)

Todo cambio no trivial pasa primero por una spec en `specs/NN-slug.md` (numeración correlativa, estado en el encabezado) y luego se implementa. Dos skills manuales (`disable-model-invocation`):

- `/spec <descripción>`: 4 fases (contexto, preguntas aclaratorias, redacción, guardado). Hace preguntas en bloques de 3-5 antes de escribir; si la info está completa escribe la spec entera sin pedir confirmación por sección. Escribe `specs/NN-slug.md` en estado `Draft` (nunca `Approved`) siguiendo `.claude/skills/spec/template.md`. **No escribe código** ni propone implementar. Siembra `specs/.spec-config.yml` si no existe.
- `/spec-impl <NN-slug>`: solo implementa specs cuyo estado signifique "Aprobado" (lo cambia el humano). Crea/cambia a la rama `spec-NN-slug` (según `AutoCreateBranch` en `specs/.spec-config.yml`; si el árbol de trabajo no está limpio, pregunta antes), muestra objetivo, alcance, plan y criterios, e implementa **paso a paso pausando tras cada paso** para revisar el diff. **Nunca hace commit automáticamente.** Si algo queda fuera del alcance, se anota para otra spec en lugar de implementarlo; ante ambigüedades se detiene y pregunta.

Ciclo de estados: `Draft` → `Aprobado` (humano) → `Implementado` (tras verificar los criterios de aceptación).

Estructura de una spec (en español, imitando las existentes): encabezado (Status, Depends on, Date, Objective), Por qué existe, Alcance (dentro / fuera), Modelo de datos, Plan de implementación (pasos que dejan el sistema funcional), Criterios de aceptación (checklist verificable), Decisiones tomadas y descartadas, Riesgos identificados.

Las specs se escriben en el mismo idioma que el prompt inicial (aquí, español).
