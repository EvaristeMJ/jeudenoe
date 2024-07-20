const socket = new WebSocket('ws://localhost:3000');
let active = false;
let game = false;

socket.addEventListener('open', function (event) {
    //const pseudo = prompt('Enter your pseudonym:');
    socket.send(JSON.stringify({ type: 'setPseudo', pseudo: Math.floor(5*Math.random()).toString(36) }));
});

socket.addEventListener('message', function (event) {
    const message = JSON.parse(event.data);
    if (message.type === 'userList') {
        displayUsers(message.users);
    } else if (message.type === 'message') {
        displayMessage(`${message.pseudo}: ${message.message}`);
    } else if (message.type === 'disconnect') {
        displayMessage(`${message.pseudo} has disconnected`);
    } else if (message.type === 'start') {
        game = true;
    } else if (message.type === 'startTurn') {
        active = true;
    }
    else if (message.type === 'endTurn') {
        active = false;
    }
});
document.getElementById('message').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    socket.send(JSON.stringify({ type: 'message', message: message }));
    messageInput.value = '';
    displayMessage(`You: ${message}`);
}

let messages = [];

function displayMessage(message) {
    messages.push(message);
    if (messages.length > 20) {
        messages.shift(); // Remove the oldest message if there are more than 20
    }

    const chatContainer = document.getElementById('chat');
    chatContainer.innerHTML = ''; // Clear the chat container
    messages.forEach((msg) => {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = msg;
        chatContainer.appendChild(messageDiv);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
}

function handleReady(){
    const readyButton = document.getElementById('ready');
    readyButton.disabled = true;
    socket.send(JSON.stringify({ type: 'ready' }));
}

function displayUsers(users) {
    const usersContainer = document.getElementById('users');
    usersContainer.innerHTML = '';
    const radius = 140;
    const centerX = 150;
    const centerY = 150;

    users.forEach((user, index) => {
        const angle = (index / users.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const userDiv = document.createElement('div');
        userDiv.classList.add('user');
        userDiv.style.left = `${x}px`;
        userDiv.style.top = `${y}px`;
        userDiv.textContent = user.pseudo;
        if (game){
            // display life points and defense points
            const lifeDiv = document.createElement('div');
            lifeDiv.textContent = `Life: ${user.life}`;
            userDiv.appendChild(lifeDiv);
            const defenseDiv = document.createElement('div');
            defenseDiv.textContent = `Defense: ${user.defense}`;
            userDiv.appendChild(defenseDiv);
            // display button to change defense points on each user
            const defenseButton = document.createElement('button');
            defenseButton.textContent = 'Change Defense';
            defenseButton.addEventListener('click', () => {
                socket.send(JSON.stringify({ type: 'changeDefense', pseudo: user.pseudo }));
            });
            userDiv.appendChild(defenseButton);
            // display the number of charge attack by iterating a symbol for each charge
            const chargeAttackDiv = document.createElement('div');
            chargeAttackDiv.textContent = '';
            for (let i = 0; i < user.charge_attack; i++){
                chargeAttackDiv.textContent += '⚡';
            }
            userDiv.appendChild(chargeAttackDiv);
            // display the number of charge defense
            const chargeDefenseDiv = document.createElement('div');
            chargeDefenseDiv.textContent = '';
            if (user.has_charge_defense){
                chargeDefenseDiv.textContent = '🛡️';
            }
            userDiv.appendChild(chargeDefenseDiv);
            // button to charge attack
            const chargeAttackButton = document.createElement('button');
            chargeAttackButton.textContent = 'Charge Attack';
            chargeAttackButton.addEventListener('click', chargeAttack);
            userDiv.appendChild(chargeAttackButton);
            // button to charge defense
            const chargeDefenseButton = document.createElement('button');
            chargeDefenseButton.textContent = 'Charge Defense';
            chargeDefenseButton.addEventListener('click', ()=> chargeDefense(user.pseudo));
            userDiv.appendChild(chargeDefenseButton);
        }

        usersContainer.appendChild(userDiv);
    });

}

function attackRight(){
    if (!active){
        console.log('not active');
        return;
    }
    socket.send(JSON.stringify({ type: 'attackRight' }));
}
function attackLeft(){
    if (!active){
        console.log('not active');
        return;
    }
    socket.send(JSON.stringify({ type: 'attackLeft' }));
}
function chargeAttack(){
    if (!active){
        console.log('not active');
        return;
    }
    socket.send(JSON.stringify({ type: 'chargeAttack' }));
}
function chargeDefense(target){
    if (!active){
        console.log('not active');
        return;
    }
    socket.send(JSON.stringify({ type: 'chargeDefense' , pseudo: target.pseudo}));
}

