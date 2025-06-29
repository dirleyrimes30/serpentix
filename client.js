
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const socket = io();
const menu = document.getElementById('menu');
const rankingDiv = document.getElementById('ranking');
const avatarPreview = document.getElementById('avatarPreview');
let direction = { x: 1, y: 0 };
let playerName = '';
let playerSkin = 'cyan';
let playerAvatar = '';
let snake = [];
let orbs = [];
let ranking = [];

function updateAvatar() {
  const url = document.getElementById('avatarUrl').value;
  avatarPreview.src = url;
}

function startGame() {
  playerName = document.getElementById('playerName').value || 'Anônimo';
  playerSkin = document.getElementById('skinSelect').value;
  playerAvatar = document.getElementById('avatarUrl').value;
  socket.emit('start', { name: playerName, skin: playerSkin, avatar: playerAvatar });
  menu.style.display = 'none';
  canvas.style.display = 'block';
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') direction = { x: 0, y: -1 };
  if (e.key === 'ArrowDown') direction = { x: 0, y: 1 };
  if (e.key === 'ArrowLeft') direction = { x: -1, y: 0 };
  if (e.key === 'ArrowRight') direction = { x: 1, y: 0 };
});

socket.on('gameState', state => {
  snake = state.snake;
  orbs = state.orbs;
  ranking = state.ranking;
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let orb of orbs) {
    const gradient = ctx.createRadialGradient(orb.x, orb.y, 1, orb.x, orb.y, 10);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'lime');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let segment of snake) {
    ctx.fillStyle = segment.color || 'cyan';
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  updateRanking();
}

function updateRanking() {
  rankingDiv.innerHTML = '<strong>Ranking</strong><br>' +
    ranking.map(p => `
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="${p.avatar}" width="20" height="20" style="border-radius:50%"/>
        ${p.name}: ${p.score}
      </div>
    `).join('');
}

function update() {
  if (playerName) socket.emit('move', direction);
  draw();
  requestAnimationFrame(update);
}

update();
