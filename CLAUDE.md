# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

Juego de Arkanoid en HTML, CSS y JavaScript puro, **cero dependencias** (sin npm, bundler ni framework). Todavía no está implementado: solo existen los assets y el módulo de sprites. No hay build, lint ni tests; el juego se ejecutará abriendo `index.html` en el navegador (aún no existe). El repo no es git por ahora.

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

El proyecto usa dos skills manuales (`disable-model-invocation`):

- `/spec <descripción>`: hace preguntas aclaratorias y escribe `specs/NN-slug.md` (estado `Draft`, nunca `Approved`) siguiendo `.claude/skills/spec/template.md`. No escribe código. Siembra `specs/.spec-config.yml`.
- `/spec-impl <NN-slug>`: solo implementa specs en estado "Approved" (lo cambia el humano). Crea la rama `spec-NN-slug` (según `AutoCreateBranch`; requiere git), implementa paso a paso pausando tras cada paso, y **nunca hace commit automáticamente**. Si algo queda fuera del alcance de la spec, se anota para otra spec en lugar de implementarlo.

Las specs se escriben en el mismo idioma que el prompt inicial (aquí, español) y deben imitar el formato de las specs existentes.
