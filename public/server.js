const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);

    if (clients.length === 2) {
        clients.forEach((client, index) => {
            client.send(JSON.stringify({ type: 'start', player: index === 0 ? 'X' : 'O' }));
        });
    }

    ws.on('message', (message) => {
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        clients.forEach((client) => {
            client.send(JSON.stringify({ type: 'disconnect' }));
        });
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
