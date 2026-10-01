const W = 800, H = 600;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function drawBackground() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
}

loadSpritesheet(() => {
  drawBackground();
});
