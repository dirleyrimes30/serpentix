
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const socket = io();

let snake = [];
let orbs = [];
let direction = { x: 1, y: 0 };

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') direction = { x: 0, y: -1 };
  if (e.key === 'ArrowDown') direction = { x: 0, y: 1 };
  if (e.key === 'ArrowLeft') direction = { x: -1, y: 0 };
  if (e.key === 'ArrowRight') direction = { x: 1, y: 0 };
});

socket.on('gameState', state => {
  snake = state.snake;
  orbs = state.orbs;
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let orb of orbs) {
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'cyan';
  for (let segment of snake) {
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function update() {
  socket.emit('move', direction);
  draw();
  requestAnimationFrame(update);
}

update();
