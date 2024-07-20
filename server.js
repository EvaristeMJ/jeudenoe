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
                life: 0,
                attack: 0,
                defense: 0,
                charge_attack: 0,
                ncharge: 0,
                charge_defense: 0
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
                startGame();
                
            }
        }
        else if (parsedMessage.type === 'changeDefense'){
            // get the target client with their pseudo
            const target = clients.find(client => client.pseudo === parsedMessage.pseudo);
            changeDefense(target);
            broadcastUserList();
            endTurn(user)
        }
        else if (parsedMessage.type === 'chargeAttack'){
            handleChargeAttack(user);
            broadcastUserList();
            endTurn(user)
        }
        else if (parsedMessage.type === 'chargeDefense'){
            handleChargeDefense(user);
            broadcastUserList();
            endTurn(user)
        }
        else if (parsedMessage.type === 'attackRight'){
            handleAttack(user,user.right);
            broadcastUserList();
            endTurn(user);
        }
        else if (parsedMessage.type === 'attackLeft'){
            handleAttack(user,user.left);
            broadcastUserList();
            endTurn(user);
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
            clients[i].defense = randomInt();
            clients[i].charge_attack = 0;
            clients[i].ncharge = 0;
            clients[i].charge_defense = 0;
            clients[i].alive = true;
            clients[i].left = clients[(i + 1) % clients.length];
            clients[i].right = clients[(i - 1) % clients.length];
        }
        // select a random player to start the game
        const first_player = clients[Math.floor(Math.random() * clients.length)];
        first_player.ws.send(JSON.stringify({type: 'startTurn'}));
        for (let i = 0; i < clients.length; i++) {
            clients[i].ws.send(JSON.stringify({type: 'message', pseudo: 'Server', message: `${first_player.pseudo} starts`}));
        }
        broadcastUserList();

    }

    function randomInt(){
        return Math.floor(Math.random() * 13)+1;
    }
    function randomLife(){
        return randomInt()+randomInt()+randomInt();
    }
    function endTurn(client){
        client.ws.send(JSON.stringify({type: 'endTurn'}));
        next_player = client.right;
        next_player.charge_defense = 0;
        broadcastUserList();
        for (let i = 0; i < clients.length; i++) {
            clients[i].ws.send(JSON.stringify({type: 'message', pseudo: 'Server', message: `${next_player.pseudo} begins his turn`}));
        }
        next_player.ws.send(JSON.stringify({type: 'startTurn'}));
    }
    function handleAttack(client,target){
        a = randomInt()+client.charge_attack;
        d = target.defense+target.charge_defense;
        if(a>d){
            target.life -= a-d;
            if(!isAlive(target)){
                handleDeath(target);
            }
            target.charge_attack = 0;
        }
        client.charge_attack = 0;
    }
    function handleChargeAttack(client){
        if (client.ncharge < 3){
            client.charge_attack += randomInt();
            client.ncharge++;
        }
    }
    function handleChargeDefense(client){
        client.charge_defense += randomInt();
    }
    function changeDefense(target){
        target.defense = randomInt();
    }
    function isAlive(client){
        return client.life > 0;
    }
    function handleDeath(client){
        client.alive = false;
        client.left.right = client.right;
        client.right.left = client.left;
        if(clients.filter(client => client.alive).length == 1){
            clients.forEach((client) => {
                if (client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(JSON.stringify({
                        type: 'message',
                        pseudo: 'Server',
                        message: `${clients.filter(client => client.alive)[0].pseudo} wins`
                    }));
                }
            });
        }
    }

    function broadcastUserList() {
                // send the list of users with their life points and their defense points to all clients
        const userList = clients.map(client => {
                    return {
                        pseudo: client.pseudo,
                        life: client.life,
                        defense: client.defense,
                        ncharge: client.ncharge,
                        has_charge_defense: client.charge_defense > 0
                    };
                });
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
