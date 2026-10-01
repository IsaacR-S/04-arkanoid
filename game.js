const W = 800, H = 600;
const BALL_SPEED = 6;    // px/frame
const PADDLE_SPEED = 8;  // px/frame
const LAUNCH_ANGLE = 30; // grados respecto a la vertical
const MAX_BOUNCE_ANGLE = 60; // grados respecto a la vertical
const POINTS_PER_BLOCK = 10;
const LIVES = 3;
const BLOCK_ROWS = ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green'];
const BLOCK_COLS = 7;
const BLOCK_W = 32, BLOCK_H = 16;
const GRID_Y0 = 80;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  phase: 'ready',
  score: 0,
  lives: LIVES,
  paddle: { x: 0, y: 0, w: 162, h: 14 },
  ball: { x: 0, y: 0, w: 16, h: 16, vx: 0, vy: 0 },
  blocks: [],
  explosions: [],
  keys: { left: false, right: false },
};

function createBlocks() {
  const x0 = (W - BLOCK_COLS * BLOCK_W) / 2;
  const blocks = [];
  BLOCK_ROWS.forEach((color, row) => {
    for (let col = 0; col < BLOCK_COLS; col++) {
      blocks.push({
        x: x0 + col * BLOCK_W,
        y: GRID_Y0 + row * BLOCK_H,
        w: BLOCK_W,
        h: BLOCK_H,
        color,
        alive: true,
      });
    }
  });
  return blocks;
}

function resetBall() {
  const { paddle, ball } = state;
  ball.x = paddle.x + (paddle.w - ball.w) / 2;
  ball.y = paddle.y - ball.h;
  ball.vx = 0;
  ball.vy = 0;
}

function init() {
  const { paddle } = state;
  paddle.x = (W - paddle.w) / 2;
  paddle.y = H - 40;
  state.blocks = createBlocks();
  state.explosions = [];
  resetBall();
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  for (const b of state.blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
  }
  drawExplosions();
  const { paddle, ball } = state;
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x, ball.y, ball.w, ball.h);
  drawHUD();
  if (state.phase === 'gameover') drawEndScreen('Game Over');
  else if (state.phase === 'won') drawEndScreen('Victoria');
}

function drawEndScreen(title) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 56px monospace';
  ctx.fillText(title, W / 2, H / 2 - 30);
  ctx.font = '22px monospace';
  ctx.fillText('Puntos: ' + state.score, W / 2, H / 2 + 20);
  ctx.fillText('Pulsa Enter para reiniciar', W / 2, H / 2 + 56);
}

function drawExplosions() {
  const now = performance.now();
  for (const ex of state.explosions) {
    const frames = EXPLOSION_FRAMES[ex.color];
    const i = Math.floor((now - ex.start) / (EXPLOSION_DURATION / frames.length));
    if (i < frames.length) drawFrame(ctx, frames[i], ex.x, ex.y, BLOCK_W, BLOCK_H);
  }
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + state.score, 16, 12);
  const size = state.ball.w, gap = 6;
  for (let i = 0; i < state.lives; i++) {
    drawSprite(ctx, 'ball', W - 16 - (i + 1) * size - i * gap, 12, size, size);
  }
}

function onKey(e, down) {
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      state.keys.left = down;
      break;
    case 'ArrowRight':
    case 'KeyD':
      state.keys.right = down;
      break;
    case 'Space':
      if (down && state.phase === 'ready') launchBall();
      break;
    case 'Enter':
      if (down && (state.phase === 'gameover' || state.phase === 'won')) restart();
      break;
    default:
      return;
  }
  e.preventDefault();
}

function launchBall() {
  const angle = LAUNCH_ANGLE * Math.PI / 180;
  state.ball.vx = BALL_SPEED * Math.sin(angle);
  state.ball.vy = -BALL_SPEED * Math.cos(angle);
  state.phase = 'playing';
}

function updateBall() {
  const { ball } = state;
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x <= 0) {
    ball.x = 0;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + ball.w >= W) {
    ball.x = W - ball.w;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y <= 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
  }

  bouncePaddle();
  bounceBlocks();

  if (state.blocks.every((b) => !b.alive)) {
    state.phase = 'won';
    return;
  }
  if (ball.y > H) loseLife();
}

function restart() {
  state.score = 0;
  state.lives = LIVES;
  state.phase = 'ready';
  init();
}

function loseLife() {
  state.lives--;
  if (state.lives <= 0) {
    state.phase = 'gameover';
    return;
  }
  state.phase = 'ready';
  resetBall();
}

function bounceBlocks() {
  const { ball } = state;
  for (const b of state.blocks) {
    if (!b.alive) continue;
    const overlapX = Math.min(ball.x + ball.w, b.x + b.w) - Math.max(ball.x, b.x);
    const overlapY = Math.min(ball.y + ball.h, b.y + b.h) - Math.max(ball.y, b.y);
    if (overlapX <= 0 || overlapY <= 0) continue;

    // Se invierte la velocidad en el eje de menor penetración
    if (overlapX < overlapY) {
      ball.vx = -ball.vx;
      ball.x += ball.x + ball.w / 2 < b.x + b.w / 2 ? -overlapX : overlapX;
    } else {
      ball.vy = -ball.vy;
      ball.y += ball.y + ball.h / 2 < b.y + b.h / 2 ? -overlapY : overlapY;
    }
    b.alive = false;
    state.explosions.push({ x: b.x, y: b.y, color: b.color, start: performance.now() });
    state.score += POINTS_PER_BLOCK;
    return; // un solo bloque por frame
  }
}

function bouncePaddle() {
  const { ball, paddle } = state;
  const overlaps =
    ball.vy > 0 &&
    ball.x + ball.w > paddle.x && ball.x < paddle.x + paddle.w &&
    ball.y + ball.h >= paddle.y && ball.y + ball.h <= paddle.y + paddle.h + ball.vy;
  if (!overlaps) return;

  // -1 en el borde izquierdo, 0 en el centro, 1 en el borde derecho
  const ballCenter = ball.x + ball.w / 2;
  const offset = (ballCenter - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
  const angle = Math.max(-1, Math.min(1, offset)) * MAX_BOUNCE_ANGLE * Math.PI / 180;
  ball.vx = BALL_SPEED * Math.sin(angle);
  ball.vy = -BALL_SPEED * Math.cos(angle);
  ball.y = paddle.y - ball.h;
}

window.addEventListener('keydown', (e) => onKey(e, true));
window.addEventListener('keyup', (e) => onKey(e, false));

function update() {
  const now = performance.now();
  state.explosions = state.explosions.filter((ex) => now - ex.start < EXPLOSION_DURATION);

  const { paddle, keys } = state;
  if (keys.left) paddle.x -= PADDLE_SPEED;
  if (keys.right) paddle.x += PADDLE_SPEED;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

  if (state.phase === 'ready') resetBall();
  else if (state.phase === 'playing') updateBall();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(() => {
  init();
  loop();
});
