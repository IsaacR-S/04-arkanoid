# Juego de Arkanoid

Arkanoid en HTML, CSS y JavaScript puro, **cero dependencias** (sin npm, bundler ni framework).

## Cómo jugar

Abre `index.html` en el navegador. Es preferible servirlo por HTTP, porque el spritesheet se copia a un canvas offscreen y `file://` puede bloquearlo:

```
python -m http.server 8000
```

y entra a `http://localhost:8000`.

### Controles

| Tecla | Acción |
|---|---|
| `←` / `A` | Mover la paleta a la izquierda |
| `→` / `D` | Mover la paleta a la derecha |
| `Espacio` | Lanzar la bola |
| `Enter` | Reiniciar (en Game Over o al ganar) |

## Características

- Canvas de 800x600 con paleta, bola, bloques de colores, HUD (puntos, vidas, nivel).
- Rebote de la bola según el punto de impacto en la paleta.
- 3 vidas y 10 puntos por bloque.
- Animación de destrucción de bloques (explosión).
- Efectos de sonido (rebote y rotura de bloque).
- 4 niveles con avance automático.

## Estructura

```
index.html        Página con el canvas
style.css         Estilos
game.js           Bucle, entrada, física, colisiones, HUD, niveles y sonidos
assets/
  spritesheet-breakout.png   Paleta, bola, bloques y explosiones
  spritesheet.js             Carga y dibujo de sprites
  sounds/                    ball-bounce.mp3, break-sound.mp3
specs/            Especificaciones del proyecto
.claude/skills/   Skills /spec y /spec-impl
```

## Desarrollo spec-driven

Todo cambio no trivial se especifica primero en `specs/NN-slug.md` y luego se implementa:

- `/spec <descripción>`: redacta la spec en estado `Draft`.
- `/spec-impl <NN-slug>`: implementa una spec aprobada, paso a paso y sin commits automáticos.

Specs implementadas:

1. `01-mvp-jugable`: MVP jugable.
2. `02-animacion-destruccion`: animación de destrucción de bloques.
3. `03-sonidos-y-niveles`: sonidos y 4 niveles con avance automático.
