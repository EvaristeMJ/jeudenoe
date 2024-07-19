const express = require('express');
const { type } = require('express/lib/response');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    let user = null;

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        
        if (!user && parsedMessage.type === 'setPseudo') {

            user = {
                ws: ws,
                pseudo: parsedMessage.pseudo,
                ready: false,
                alive: true,
                left: null,
                right: null,
                life: 100,
                attack: 0,
                defense: 0,
                sattack: 0,
                sdefense: 0
            };
            clients.push(user);
            console.log(`User connected with pseudonym: ${user.pseudo}`);
            broadcastUserList();
        } else if (parsedMessage.type === 'ready') {
            console.log(`${user.pseudo} is ready`);
            user.ready = true;
            clients.forEach((client) => {
                if (client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(JSON.stringify({
                        type: 'message',
                        pseudo: 'Server',
                        message: `${user.pseudo} is ready`
                    }));
                }
            });
            if (clients.length > 1 && clients.every(client => client.ready)) {
                clients.forEach((client) => {
                    startGame()
                    if (client.ws.readyState === WebSocket.OPEN) {

                        client.ws.send(JSON.stringify({
                            type: 'message',
                            pseudo: 'Server',
                            message: 'Game starting...'
                        }));
                        client.ws.send(JSON.stringify({type: 'start'}));
                    }
                });
            }
        }
        else if (user) {
            console.log(`Received message from ${user.pseudo}: ${parsedMessage.message}`);
            clients.forEach((client) => {
                if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(JSON.stringify({
                        type: 'message',
                        pseudo: user.pseudo,
                        message: parsedMessage.message
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client.ws !== ws);
        console.log(`User disconnected: ${user ? user.pseudo : 'unknown'}`);
        broadcastUserList();
    });
    function startGame() {
        // order clients randomly
        clients.sort(() => Math.random() - 0.5);

        for (let i = 0; i < clients.length; i++) {
            clients[i].life = randomLife();
            clients[i].attack = randomInt();
            clients[i].defense = randomInt();
            clients[i].sattack = randomInt();
            clients[i].sdefense = randomInt();
            clients[i].alive = true;
            clients[i].left = clients[(i - 1) % clients.length];
            clients[i].right = clients[(i + 1) % clients.length];
        }
    }

    function randomInt(){
        return Math.floor(Math.random() * 13)+1;
    }
    function randomLife(){
        return randomInt()+randomInt()+randomInt();
    }

    function broadcastUserList() {
        const userList = clients.map(client => client.pseudo);
        clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify({
                    type: 'userList',
                    users: userList
                }));
            }
        });
    }
});


app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
