const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', function (event) {
    const pseudo = prompt('Enter your pseudonym:');
    socket.send(JSON.stringify({ type: 'setPseudo', pseudo: pseudo }));
});

socket.addEventListener('message', function (event) {
    const message = JSON.parse(event.data);
    if (message.type === 'userList') {
        displayUsers(message.users);
    } else if (message.type === 'message') {
        displayMessage(`${message.pseudo}: ${message.message}`);
    } else if (message.type === 'disconnect') {
        displayMessage(`${message.pseudo} has disconnected`);
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
        userDiv.textContent = user;

        usersContainer.appendChild(userDiv);
    });
}
