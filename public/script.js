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
        console.log(`${message.pseudo}: ${message.message}`);
    } else if (message.type === 'disconnect') {
        console.log(`${message.pseudo} has disconnected`);
    }
});

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    socket.send(JSON.stringify({ type: 'message', message: message }));
    messageInput.value = '';
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
