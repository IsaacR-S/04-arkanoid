# SPEC 03 — Sonidos y niveles

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-15
> **Objective:** Añadir los sonidos de rebote y ruptura, tres niveles nuevos (cuatro en total) con avance automático, y un indicador "Nivel N" arriba a la derecha del HUD.

---

## Por qué existe esta spec

La SPEC 01 dejó fuera los sonidos (`assets/sounds/`) y los niveles adicionales. Ambos son ampliaciones pequeñas del juego existente y se agrupan para tocar `game.js` una sola vez. No cambian la física ni los sprites.

---

## Alcance

**Dentro:**

- Reproducir `assets/sounds/ball-bounce.mp3` cuando la bola rebota en la pared izquierda, la derecha, el techo o el paddle.
- Reproducir `assets/sounds/break-sound.mp3` cuando la bola destruye un bloque. En ese caso **no** suena `ball-bounce`.
- Definir 4 niveles (el actual más 3 nuevos) como mapas de texto en `game.js`.
- Avance automático: al romper todos los bloques de un nivel, se carga el siguiente con la bola pegada al paddle (`ready`), conservando puntos y vidas.
- Mostrar "Victoria" solo al completar el nivel 4.
- Mostrar `Nivel N` en la esquina superior derecha, en una segunda línea debajo de las bolas de vida.
- Enter tras Game Over o Victoria reinicia desde el nivel 1.

**Fuera de alcance (para otras specs):**

- Música de fondo, tecla de silencio (mute) y ajuste de volumen.
- Sonido al perder una vida, al lanzar la bola, de Game Over o de Victoria.
- Pantalla intermedia "Nivel completado".
- Aumento de velocidad de la bola por nivel.
- Bloques resistentes o indestructibles (`gray`) y frames propios de explosión para ellos.
- Más de 4 niveles, niveles infinitos o editor de niveles.
- Persistencia del nivel alcanzado o de puntuaciones máximas.
- Cambios en `index.html`, `style.css`, el spritesheet o `assets/spritesheet.js`.

---

## Modelo de datos

```js
// Sonidos
const SOUND_BOUNCE = new Audio('assets/sounds/ball-bounce.mp3');
const SOUND_BREAK = new Audio('assets/sounds/break-sound.mp3');

// Niveles: 7 columnas por fila; '.' = hueco; una letra = un bloque de ese color
const LEVEL_COLORS = {
  r: 'red', y: 'yellow', c: 'cyan', m: 'magenta', h: 'hotpink', g: 'green',
};
const LEVELS = [
  [ // 1 — el nivel actual
    'rrrrrrr', 'yyyyyyy', 'ccccccc', 'mmmmmmm', 'hhhhhhh', 'ggggggg',
  ],
  [ // 2 — pirámide
    '...r...', '..yyy..', '.ccccc.', 'mmmmmmm', 'hhhhhhh', 'ggggggg',
  ],
  [ // 3 — tablero de ajedrez
    'r.y.c.m', '.h.g.r.', 'y.c.m.h', '.g.r.y.', 'c.m.h.g', '.r.y.c.',
  ],
  [ // 4 — reloj de arena
    'rrrrrrr', '.yyyyy.', '..ccc..', '...m...', '..hhh..', '.ggggg.', 'yyyyyyy',
  ],
];

// Nuevo campo en el estado del juego
state.level = 0; // índice en LEVELS; se muestra como state.level + 1
```

Convenciones:

- `BLOCK_ROWS` deja de definir la rejilla; el color y la posición salen del mapa del nivel. La rejilla sigue en `GRID_Y0`, con bloques de 32x16 sin separación y centrada con `x0 = 288`.
- Cada sonido se reproduce con `sound.cloneNode().play()` y se ignora el error de `play()` (`.catch(() => {})`), para que varios sonidos puedan solaparse y un fallo no rompa el juego.
- El primer sonido ocurre tras pulsar Espacio, así que el navegador ya permite el audio.
- Los niveles 1 a 4 tienen 42, 30, 21 y 31 bloques respectivamente.

---

## Plan de implementación

1. Añadir `SOUND_BOUNCE`, `SOUND_BREAK` y la función `playSound(sound)` en `game.js`. Llamarla en `updateBall()` al rebotar en paredes y techo, en `bouncePaddle()` al rebotar, y en `bounceBlocks()` al romper un bloque. Prueba manual: servir por HTTP y comprobar que suena bounce en paredes, techo y paddle, y break (sin bounce) al romper un bloque.
2. Introducir `LEVEL_COLORS`, `LEVELS` (solo con el nivel 1) y `state.level`. Reescribir `createBlocks()` para leer el mapa del nivel actual. Prueba: el juego se ve y se comporta igual que antes (42 bloques, mismos colores y posiciones).
3. Dibujar `Nivel N` en `drawHUD()`, alineado a la derecha en `x = W - 16`, `y = 36`. Prueba: se ve "Nivel 1" bajo las bolas de vida sin tapar nada.
4. Añadir los niveles 2, 3 y 4 a `LEVELS`. Prueba: forzar `state.level` desde la consola y llamar a `init()` para ver cada disposición con el recuento de bloques correcto.
5. Avance automático: en `updateBall()`, cuando no quedan bloques vivos, si hay un nivel siguiente incrementar `state.level`, regenerar los bloques, volver a `ready` y llamar a `resetBall()`; si era el último, pasar a `won`. `restart()` pone `state.level = 0`. Prueba: completar un nivel carga el siguiente conservando puntos y vidas; tras el nivel 4 aparece "Victoria"; Enter vuelve al nivel 1.

---

## Criterios de aceptación

- [ ] El juego carga sin errores en la consola.
- [ ] Rebotar en la pared izquierda, la derecha, el techo y el paddle reproduce `ball-bounce.mp3`.
- [ ] Romper un bloque reproduce `break-sound.mp3` y no `ball-bounce.mp3`.
- [ ] Romper varios bloques seguidos permite que los sonidos se solapen sin cortarse.
- [ ] Si el audio falla o se bloquea, el juego sigue funcionando sin errores no controlados.
- [ ] Existen exactamente 4 niveles, con 42, 30, 21 y 31 bloques.
- [ ] El nivel 1 es idéntico al nivel de la SPEC 01.
- [ ] Los niveles 2, 3 y 4 usan solo los 6 colores de fila y respetan los mapas del modelo de datos.
- [ ] Se muestra "Nivel N" en la esquina superior derecha, bajo las vidas, durante toda la partida.
- [ ] El indicador cambia al pasar de nivel (1 → 2 → 3 → 4).
- [ ] Al romper el último bloque de los niveles 1, 2 o 3 se carga el siguiente, con la bola pegada al paddle en fase `ready`.
- [ ] Al cambiar de nivel, la puntuación y las vidas se conservan.
- [ ] Al romper el último bloque del nivel 4 se muestra "Victoria".
- [ ] Enter en Game Over o Victoria reinicia puntos, vidas y nivel 1.
- [ ] La velocidad de la bola es la misma (`BALL_SPEED`) en los 4 niveles.
- [ ] Las explosiones de la SPEC 02 siguen funcionando.

---

## Decisiones tomadas y descartadas

- **Sí:** `ball-bounce` en paredes, techo y paddle, y `break-sound` al romper bloques. Cada sonido corresponde a un evento distinto.
- **No:** sonar ambos al romper un bloque. Podría saturar y `break-sound` ya señala el golpe.
- **No:** tecla de mute ni música. Isaac no los pidió; irán en otra spec si se necesitan.
- **Sí:** `cloneNode().play()` para poder solapar sonidos rápidos sin cortar el anterior.
- **Sí:** niveles como mapas de texto en `game.js`. Son legibles y fáciles de editar, sin crear archivos ni cambiar `index.html`.
- **No:** `levels.js` aparte. Añadiría un script más y no hace falta para 4 niveles.
- **Sí:** 3 niveles nuevos solo con patrones distintos, con los mismos bloques y la misma velocidad. Es lo mínimo que cumple la petición sin añadir mecánicas.
- **No:** bloques resistentes ni velocidad creciente. Cambiarían la dificultad y la lógica; merecen su propia spec.
- **Sí:** avance automático conservando puntos y vidas. Mantiene el ritmo y la puntuación acumulada tiene sentido.
- **No:** pantalla "Nivel completado". Añadiría un estado nuevo que no se pidió.
- **Sí:** `Nivel N` en una segunda línea bajo las vidas. Cumple "arriba a la derecha" sin mover el HUD de la SPEC 01.
- **Sí:** "Victoria" solo tras el nivel 4, para que el último nivel cierre la partida.

---

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| Los navegadores bloquean audio sin interacción previa. | El primer sonido sucede tras Espacio (gesto del usuario) y se ignora el error de `play()`. |
| `Audio` con `file://` o rutas mal escritas falla en silencio. | Probar por HTTP; la ruta es relativa a `index.html`, como la del spritesheet. |
| Bola atrapada en huecos del tablero de ajedrez (nivel 3). | El paddle devuelve la bola siempre; no hay bloques indestructibles que la bloqueen. |
| El rebote doble en una esquina de bloques puede disparar `break-sound` y `ball-bounce` en el mismo frame. | `bounceBlocks()` ya rompe un solo bloque por frame y solo suena `break-sound` en ese caso. |
| Un nivel de 7 filas (nivel 4) se acerca al paddle. | Termina en `y = 80 + 7 * 16 = 192`, lejos de `y = 560` del paddle. |

---

## Lo que **no** entra en esta spec

- Música, mute, volumen y otros sonidos.
- Pantalla "Nivel completado".
- Velocidad creciente, bloques resistentes o power-ups.
- Más de 4 niveles, editor de niveles y persistencia.
- Tests, build o dependencias externas.

Cada uno de estos puntos, si llega, irá en su propia spec.
