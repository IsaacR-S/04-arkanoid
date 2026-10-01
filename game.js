const W = 800, H = 600;
const PADDLE_SPEED = 8; // px/frame
const BLOCK_ROWS = ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green'];
const BLOCK_COLS = 7;
const BLOCK_W = 32, BLOCK_H = 16;
const GRID_Y0 = 80;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  phase: 'ready',
  paddle: { x: 0, y: 0, w: 162, h: 14 },
  ball: { x: 0, y: 0, w: 16, h: 16, vx: 0, vy: 0 },
  blocks: [],
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
  resetBall();
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  for (const b of state.blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
  }
  const { paddle, ball } = state;
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x, ball.y, ball.w, ball.h);
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
    default:
      return;
  }
  e.preventDefault();
}

window.addEventListener('keydown', (e) => onKey(e, true));
window.addEventListener('keyup', (e) => onKey(e, false));

function update() {
  const { paddle, keys } = state;
  if (keys.left) paddle.x -= PADDLE_SPEED;
  if (keys.right) paddle.x += PADDLE_SPEED;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

  if (state.phase === 'ready') resetBall();
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
