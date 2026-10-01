# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Draft
> **Depends on:** Ninguna (usa los assets existentes en `assets/`)
> **Date:** 2026-10-01
> **Objective:** Crear un Arkanoid jugable en el navegador con un nivel fijo, 3 vidas, puntuación y explosiones, usando HTML, CSS y JavaScript puro.

---

## Alcance

**Dentro:**

- `index.html` en la raíz con un `<canvas>` de 800x600 y los scripts cargados en orden: `assets/spritesheet.js`, luego `game.js`.
- `style.css` con el centrado del canvas y el fondo de la página.
- `game.js` con el bucle de juego, entrada, física, colisiones, HUD y estados.
- Un único nivel: 6 filas x 7 columnas de bloques, un color por fila.
- Control del paddle con teclado (← / → o A / D) y lanzamiento de la bola con Espacio.
- Rebote de la bola contra paredes, techo, paddle y bloques; el ángulo en el paddle depende del punto de impacto.
- 3 vidas, puntuación (+10 por bloque), pantalla de Game Over y pantalla de Victoria; Enter reinicia.
- Animación de explosión al destruir un bloque con `EXPLOSION_FRAMES`.

**Fuera de alcance (para otras specs):**

- Más de un nivel, o niveles infinitos.
- Control con ratón y pausa (Esc/P).
- Bloques resistentes o indestructibles (el sprite `gray` no se usa).
- Power-ups, múltiples bolas, láser.
- Sonidos (`ball-bounce.mp3` y `break-sound.mp3`): irán en su propia spec.
- Puntuaciones máximas persistentes (`localStorage`).
- Menú inicial, música de fondo, ajustes de volumen.
- Adaptación a pantallas pequeñas o móviles.
- Tests automáticos, build, linter o dependencias.

---

## Modelo de datos

```js
// Constantes
const W = 800, H = 600;
const BALL_SPEED = 6;        // px/frame
const PADDLE_SPEED = 8;      // px/frame
const MAX_BOUNCE_ANGLE = 60; // grados respecto a la vertical
const LIVES = 3;
const POINTS_PER_BLOCK = 10;
const BLOCK_ROWS = ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green'];
const BLOCK_COLS = 7;

// Estado del juego
const state = {
  phase: 'ready',   // 'ready' | 'playing' | 'gameover' | 'won'
  score: 0,
  lives: LIVES,
  paddle: { x, y, w: 162, h: 14 },
  ball: { x, y, w: 16, h: 16, vx, vy },
  blocks: [/* { x, y, w: 32, h: 16, color, alive } */],
  explosions: [/* { x, y, color, start } */],
  keys: { left: false, right: false },
};
```

Convenciones:

- Origen de coordenadas arriba a la izquierda; velocidades en píxeles por frame.
- Los sprites se dibujan a tamaño nativo (1x): paddle 162x14, bola 16x16, bloque 32x16.
- Los bloques forman una rejilla de 224x96 px (sin separación), centrada horizontalmente: `x0 = (800 - 224) / 2 = 288`.
- La fase `ready` significa "bola pegada al paddle, esperando Espacio". Se vuelve a ella tras perder una vida.
- Una explosión se dibuja con `EXPLOSION_FRAMES[color]` repartiendo `EXPLOSION_DURATION` ms entre sus 4 frames, y se elimina al terminar.

---

## Plan de implementación

1. Crear `index.html` y `style.css`: canvas 800x600 centrado, scripts en orden. `game.js` solo llama a `loadSpritesheet` y pinta el fondo. Prueba manual: abrir la página sin errores en consola.
2. Dibujar paddle, bola pegada al paddle y los 42 bloques tras la carga del spritesheet. Prueba: se ve la escena inicial.
3. Añadir bucle con `requestAnimationFrame`, entrada de teclado y movimiento del paddle limitado a los bordes del canvas. Prueba: ← / → y A / D mueven el paddle sin salirse.
4. Lanzar la bola con Espacio y rebotar en paredes y techo. Prueba: la bola rebota por los tres bordes.
5. Rebote en el paddle con ángulo según el punto de impacto, manteniendo `BALL_SPEED` constante. Prueba: centro = vertical, bordes = ángulo máximo.
6. Colisión bola-bloque: el bloque desaparece, se invierte la velocidad en el eje de menor penetración y se suma puntuación. Prueba: los bloques se rompen de uno en uno.
7. HUD en el canvas (puntuación y vidas), pérdida de vida al caer la bola y vuelta a `ready`. Prueba: a la tercera caída aparece Game Over.
8. Pantallas de Game Over y Victoria; Enter reinicia el estado completo. Prueba: ambos finales alcanzables y reiniciables.
9. Añadir explosiones animadas al romper un bloque. Prueba: se ve la animación de 4 frames en cada bloque destruido.

---

## Criterios de aceptación

- [ ] Abrir `index.html` (servido por HTTP) carga el juego sin errores en la consola.
- [ ] Al cargar se ven el paddle, la bola pegada a él y 42 bloques en 6 filas x 7 columnas, con un color distinto por fila.
- [ ] ← / A mueven el paddle a la izquierda y → / D a la derecha, sin salirse de los 800 px de ancho.
- [ ] Espacio lanza la bola solo en la fase `ready`.
- [ ] La bola rebota en paredes laterales, techo y paddle.
- [ ] Un impacto en el centro del paddle da una trayectoria vertical, y uno en el borde da ~60° respecto a la vertical.
- [ ] Romper un bloque suma exactamente 10 puntos y el bloque deja de dibujarse y de colisionar.
- [ ] Al romper un bloque se reproduce una animación de explosión de 4 frames.
- [ ] Si la bola cae por debajo del paddle, se pierde una vida y la bola vuelve pegada al paddle.
- [ ] Con 0 vidas se muestra "Game Over" y los bloques ya no responden.
- [ ] Al romper los 42 bloques se muestra "Victoria".
- [ ] Enter en Game Over o Victoria reinicia puntuación, vidas, bloques y bola.
- [ ] El HUD muestra siempre la puntuación y las vidas restantes.

---

## Decisiones tomadas y descartadas

- **Sí:** un solo nivel fijo. Es lo mínimo para que el juego sea jugable de principio a fin.
- **No:** varios niveles o infinitos. Merecen su propia spec.
- **Sí:** 3 vidas con Game Over y Victoria. Da un ciclo completo de partida.
- **Sí:** solo control por teclado. Es el único método elegido para el MVP.
- **No:** ratón y pausa. Se pueden añadir después sin cambiar el núcleo.
- **Sí:** canvas de 800x600 con sprites a 1x. Es la elección explícita de Isaac y evita escalados.
- **Sí:** ángulo de rebote según el punto de impacto en el paddle, velocidad constante. Da control al jugador.
- **Sí:** `index.html` + `style.css` + `game.js` en la raíz, sin módulos ES. La ruta de la imagen es relativa al HTML y `spritesheet.js` es un script global.
- **Sí:** 6 filas x 7 columnas con un color por fila, sin `gray`. No hace falta lógica de resistencia.
- **Sí:** las explosiones entran en el MVP porque los assets ya existen.
- **No:** sonidos. Isaac prefiere dejarlos para otra spec.

---

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| La rejilla de 7x32 = 224 px ocupa solo el 28% del ancho de 800 px y puede verse pequeña. | Aceptado en el MVP; si se ve mal, una spec posterior aumenta las columnas o el escalado. |
| `loadSpritesheet` copia la imagen a un canvas y falla con `file://` restrictivo. | Probar sirviendo por HTTP (por ejemplo `python -m http.server`). |
| Túnel de la bola a través de un bloque o paddle a velocidad alta. | `BALL_SPEED` de 6 px/frame es menor que la altura de bloque (16 px), así que no hace falta subdividir el movimiento. |
| La velocidad depende de los frames por segundo (monitores de 120/144 Hz). | Se acepta en el MVP; un paso de tiempo fijo queda para otra spec. |

---

## Lo que **no** entra en esta spec

- Más niveles, power-ups, bloques resistentes.
- Sonidos, ratón, pausa, menú inicial, música.
- Persistencia de puntuaciones.
- Soporte móvil o responsive.
- Tests, build o dependencias externas.

Cada uno de estos puntos, si llega, irá en su propia spec.
