
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let players = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
  console.log('New player: ' + socket.id);

  players[socket.id] = {
    snake: [{ x: 400, y: 300 }],
    direction: { x: 1, y: 0 }
  };

  socket.on('move', dir => {
    players[socket.id].direction = dir;
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
      y: head.y + player.direction.y * 5
    };

    player.snake.unshift(newHead);
    if (player.snake.length > 20) player.snake.pop();
  }

  io.sockets.emit('gameState', {
    snake: Object.values(players).flatMap(p => p.snake),
    orbs: [{ x: 100, y: 200 }, { x: 300, y: 150 }]
  });
}

setInterval(gameLoop, 1000 / 30);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
