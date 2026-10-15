# SPEC 02 — Animación de destrucción visible

> **Status:** Draft
> **Depends on:** SPEC 01
> **Date:** 2026-10-15
> **Objective:** Alargar la animación de destrucción de bloques, basada en los frames de `EXPLOSION_FRAMES` del spritesheet, para que se aprecie al romper cada bloque.

---

## Por qué existe esta spec

La SPEC 01 ya dibuja la animación de 4 frames de `EXPLOSION_FRAMES` al romper un bloque, pero `EXPLOSION_DURATION` es 150 ms (~37 ms por frame, unos 2 frames de pantalla a 60 Hz), así que apenas se percibe. Esta spec solo ajusta su duración y verifica que se usan los frames del spritesheet; no añade efectos nuevos.

---

## Alcance

**Dentro:**

- Subir `EXPLOSION_DURATION` en `assets/spritesheet.js` de 150 a 400 ms (100 ms por frame).
- Verificar que cada color de fila (`red`, `yellow`, `cyan`, `magenta`, `hotpink`, `green`) reproduce sus 4 frames propios de `EXPLOSION_FRAMES`, en orden.
- Verificar que la explosión se dibuja donde estaba el bloque, a 32x16, y se elimina al terminar.

**Fuera de alcance (para otras specs):**

- Partículas, fragmentos, screen shake, fade o escalado.
- Sonidos (`break-sound.mp3`).
- Frames propios para `gray` (hoy reutiliza los de `red`; el sprite `gray` no se usa en el juego).
- Paso de tiempo fijo independiente de los Hz del monitor.
- Cambios en el spritesheet o en sus coordenadas.

---

## Modelo de datos

Esta feature no introduce estructuras nuevas. Reutiliza `state.explosions` (`{ x, y, color, start }`) y `EXPLOSION_FRAMES` de la SPEC 01. Solo cambia el valor de la constante:

```js
const EXPLOSION_DURATION = 400; // ms (antes 150)
```

Convenciones:

- El frame mostrado es `floor((now - start) / (EXPLOSION_DURATION / 4))`.
- La explosión se elimina en `update()` cuando `now - start >= EXPLOSION_DURATION`.

---

## Plan de implementación

1. Cambiar `EXPLOSION_DURATION` a 400 en `assets/spritesheet.js`. Prueba manual: servir por HTTP, romper un bloque y ver los 4 frames de forma claramente distinguible.
2. Revisar `drawExplosions()` y `update()` en `game.js` y confirmar que usan solo `EXPLOSION_FRAMES` y `EXPLOSION_DURATION`, sin duraciones fijas. Prueba: romper bloques de varias filas y comprobar que `state.explosions` vuelve a 0 unos 400 ms después.

---

## Criterios de aceptación

- [ ] El juego carga sin errores en la consola.
- [ ] `EXPLOSION_DURATION` vale 400 en `assets/spritesheet.js`.
- [ ] Al romper un bloque se ven los 4 frames de su color, en orden y cada uno durante ~100 ms.
- [ ] La explosión aparece en la posición exacta del bloque destruido.
- [ ] Los 6 colores de fila muestran su animación propia.
- [ ] `state.explosions` queda vacío ~400 ms después de la última destrucción.
- [ ] Romper varios bloques seguidos muestra varias explosiones simultáneas sin cortarse.
- [ ] La bola, el paddle y la puntuación no cambian de comportamiento.
- [ ] Reiniciar con Enter vacía las explosiones en curso.

---

## Decisiones tomadas y descartadas

- **Sí:** usar los frames de `EXPLOSION_FRAMES` del spritesheet. Es la animación de destrucción que ya trae el asset.
- **No:** partículas. Isaac pidió usar las animaciones de los sprites.
- **Sí:** 400 ms (100 ms por frame). Es suficiente para verse sin tapar el juego.
- **No:** fade final. Isaac eligió solo alargar la duración.
- **Sí:** cambiar el valor en `assets/spritesheet.js`, donde está definida la constante.
- **No:** sonido. Sigue fuera, como en la SPEC 01.

---

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| 400 ms puede sentirse largo si se rompen bloques muy seguidos. | Es un solo valor; se ajusta sin cambiar la spec. |
| La duración depende de `performance.now()` y no de los frames. | Es correcto en cualquier Hz; solo el movimiento de la bola depende de ellos (SPEC 01). |

---

## Lo que **no** entra en esta spec

- Partículas, screen shake, fade, escalado.
- Sonidos.
- Frames propios para `gray`.
- Tests, build o dependencias externas.

Cada uno de estos puntos, si llega, irá en su propia spec.
