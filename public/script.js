// script.js
document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const statusDisplay = document.getElementById("status");
    const restartButton = document.getElementById("restart");

    let gameActive = false;
    let currentPlayer = "X";
    let playerSymbol = "";
    let gameState = ["", "", "", "", "", "", "", "", ""];

    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
            case 'start':
                gameActive = true;
                playerSymbol = message.player;
                currentPlayer = 'X';
                statusDisplay.innerHTML = playerSymbol === 'X' ? "It's your turn" : "Waiting for opponent";
                break;
            case 'move':
                gameState[message.index] = message.player;
                cells[message.index].innerHTML = message.player;
                currentPlayer = message.player === 'X' ? 'O' : 'X';
                statusDisplay.innerHTML = currentPlayer === playerSymbol ? "It's your turn" : "Waiting for opponent";
                handleResultValidation();
                break;
            case 'disconnect':
                gameActive = false;
                statusDisplay.innerHTML = 'Opponent disconnected';
                break;
        }
    });

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const winningMessage = () => `Player ${currentPlayer} has won!`;
    const drawMessage = () => `Game ended in a draw!`;
    const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = currentPlayer;
        socket.send(JSON.stringify({ type: 'move', index: clickedCellIndex, player: currentPlayer }));
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.innerHTML = currentPlayerTurn();
    }

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.innerHTML = winningMessage();
            gameActive = false;
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.innerHTML = drawMessage();
            gameActive = false;
            return;
        }

        handlePlayerChange();
    }

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive || currentPlayer !== playerSymbol) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }

    function handleRestartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.innerHTML = currentPlayerTurn();
        cells.forEach(cell => cell.innerHTML = "");
    }

    cells.forEach(cell => cell.addEventListener("click", handleCellClick));
    restartButton.addEventListener("click", handleRestartGame);
});
