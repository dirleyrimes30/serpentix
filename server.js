
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let players = {};
let orbs = generateOrbs();

app.use(express.static(__dirname + '/public'));

function generateOrbs() {
  return Array.from({length: 20}, () => ({
    x: Math.random() * 800,
    y: Math.random() * 600
  }));
}

io.on('connection', socket => {
  socket.on('start', data => {
    players[socket.id] = {
      name: data.name,
      skin: data.skin,
      avatar: data.avatar,
      score: 0,
      snake: [{ x: 400, y: 300 }],
      direction: { x: 1, y: 0 }
    };
  });

  socket.on('move', dir => {
    if (players[socket.id]) {
      players[socket.id].direction = dir;
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

function gameLoop() {
  for (let id in players) {
    let player = players[id];
    let head = player.snake[0];
    let newHead = {
      x: head.x + player.direction.x * 5,
      y: head.y + player.direction.y * 5,
      color: player.skin
    };
    player.snake.unshift(newHead);

    for (let i = orbs.length - 1; i >= 0; i--) {
      let orb = orbs[i];
      let dx = newHead.x - orb.x;
      let dy = newHead.y - orb.y;
      if (dx * dx + dy * dy < 400) {
        player.score += 10;
        orbs.splice(i, 1);
        orbs.push({ x: Math.random() * 800, y: Math.random() * 600 });
      }
    }

    if (player.snake.length > 10 + player.score / 10) player.snake.pop();

    if (newHead.x < 0 || newHead.x > 800 || newHead.y < 0 || newHead.y > 600) {
      delete players[id];
    }
  }

  const ranking = Object.values(players)
    .map(p => ({ name: p.name, score: p.score, avatar: p.avatar }))
    .sort((a, b) => b.score - a.score);

  const snakeData = Object.values(players).flatMap(p =>
    p.snake.map(segment => ({ ...segment, color: p.skin }))
  );

  io.sockets.emit('gameState', {
    snake: snakeData,
    orbs,
    ranking
  });
}

setInterval(gameLoop, 1000 / 30);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
