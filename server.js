const express = require('express');
const { type } = require('express/lib/response');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let n_ready = 0;
let indices = [10,9,8,7,6,5,4,3,2,1];

wss.on('connection', (ws) => {
    let user = null;

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        
        if (!user && parsedMessage.type === 'setPseudo') {
            user = {
                ws: ws,
                pseudo: parsedMessage.pseudo,
                index: indices.pop(),
                ready: false,
                alive: true,
                left: null,
                right: null
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
        indices.push(user.index);
        broadcastUserList();
    });

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
