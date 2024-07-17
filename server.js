const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const MAX_LIFE_POINTS = 39;
const MIN_LIFE_POINTS = 3;
const MAX_SHIELD = 13;
const MIN_SHIELD = 1;
const MAX_ATTACK = 13;
const MIN_ATTACK = 1;

let games = {};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createNewPlayer() {
  return {
    lifePoints: getRandomInt(MIN_LIFE_POINTS, MAX_LIFE_POINTS),
    shield: getRandomInt(MIN_SHIELD, MAX_SHIELD),
    chargedAttack: 0
  };
}

io.on('connection', (socket) => {
  socket.on('createGame', (gameId) => {
    games[gameId] = { players: {}, turnOrder: [], currentTurn: 0 };
    const newPlayer = createNewPlayer();
    games[gameId].players[socket.id] = newPlayer;
    games[gameId].turnOrder.push(socket.id);
    socket.join(gameId);
  });

  socket.on('joinGame', (gameId) => {
    if (games[gameId] && Object.keys(games[gameId].players).length < 4) { // Limite de 4 joueurs
      const newPlayer = createNewPlayer();
      games[gameId].players[socket.id] = newPlayer;
      games[gameId].turnOrder.push(socket.id);
      socket.join(gameId);
      io.to(gameId).emit('updateGame', games[gameId]);
    }
  });

  socket.on('action', ({ gameId, actionType, targetId, value }) => {
    const game = games[gameId];
    const player = game.players[socket.id];
    if (game.turnOrder[game.currentTurn] !== socket.id) return; // Ce n'est pas le tour du joueur

    switch(actionType) {
      case 'attack':
        const attackPower = getRandomInt(MIN_ATTACK, MAX_ATTACK) + player.chargedAttack;
        const target = game.players[targetId];
        let damage = attackPower - target.shield;
        if (damage > 0) {
          target.lifePoints -= damage;
        }
        player.chargedAttack = 0;
        break;
      case 'shield':
        player.shield += value;
        if (player.shield > MAX_SHIELD) player.shield = MAX_SHIELD;
        break;
      case 'changeShield':
        game.players[targetId].shield = getRandomInt(MIN_SHIELD, MAX_SHIELD);
        break;
      case 'chargeAttack':
        player.chargedAttack += value;
        if (player.chargedAttack > MAX_ATTACK) player.chargedAttack = MAX_ATTACK;
        break;
      default:
        break;
    }

    // Vérifiez si un joueur est mort
    for (let id in game.players) {
      if (game.players[id].lifePoints <= 0) {
        delete game.players[id];
        game.turnOrder = game.turnOrder.filter(playerId => playerId !== id);
      }
    }

    // Passez au joueur suivant
    game.currentTurn = (game.currentTurn + 1) % game.turnOrder.length;

    io.to(gameId).emit('updateGame', game);
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
