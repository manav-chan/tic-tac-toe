let board;
const huPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let huWins = 0;
let aiWins = 0;
let ties = 0;
let minimaxFlag = false;
const cells = document.querySelectorAll('.cell');

start();

function start() {
    const table = document.querySelector("table");
    table.removeEventListener('click', start, false);
    document.querySelector(".msg").style.display = "none";
    board = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

function retry() {
    resetScore();
    start();
}

let isAITurn = false;
function turnClick(event) {
    if (isAITurn == false && typeof board[event.target.id] === 'number') {
        turn(event.target.id, huPlayer);
        if (!checkWin(board, huPlayer) && !checkTie()) {
            isAITurn = true;
            setTimeout(() => {
                turn(bestSpot(), aiPlayer);
                isAITurn = false;
            }, 500);
        }
    }
}

function turn(cellId, player) {
    board[cellId] = player;
    const cell = document.getElementById(cellId);
    cell.innerText = player;
    cell.classList.add('fade-in');

    cell.addEventListener('animationend', () => {
        cell.classList.remove('fade-in');
    }, { once: true });

    let gameWon = checkWin(board, player);
    if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
    let plays = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === player) {
            plays.push(i);
        }
    }
    let gameWon = null;
    for (let index = 0; index < winCombos.length; index++) {
        let win = winCombos[index];
        let winFound = true;
        for (let elem of win) {
            if (!plays.includes(elem)) {
                winFound = false;
                break;
            }
        }
        if (winFound) {
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor = gameWon.player === huPlayer ? "green" : "red";
    }
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner(gameWon.player === huPlayer ? "You win!" : "You lose!");
}

function checkTie() {
    if (emptySquares(board).length === 0) {
        for (let i = 0; i < cells.length; i++) {
            // cells[i].style.backgroundColor = "neon";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!");
        return true;
    }
    return false;
}

function declareWinner(msg) {
    document.querySelector(".msg").style.display = "block";
    document.querySelector(".msg .text").innerText = msg;
    
    if (msg === "You win!") {
        huWins++;
    } else if (msg === "You lose!") {
        aiWins++;
    } else if (msg === "Tie Game!") {
        ties++;
    }
    updateScore();
    const table = document.querySelector("table");
    setTimeout(() => {
        table.addEventListener('click', start, false);
    }, 1000);
}

function updateScore() {
    document.querySelector(".score-bar .hu").innerText = huWins;
    document.querySelector(".score-bar .ai").innerText = aiWins;
    document.querySelector(".score-bar .tie").innerText = ties;
}

function resetScore() {
    huWins = 0;
    aiWins = 0;
    ties = 0;
    updateScore();
}

function toggleAi() {
    const aiBtn = document.querySelector("#aibtn");
    if (aiBtn.innerText.includes("OFF")) {
        aiBtn.innerText = "Unbeatable AI ON";
        aiBtn.style.backgroundColor = "red";
        aiBtn.style.color = "white";
        minimaxFlag = true;
    } else {
        aiBtn.innerText = "Unbeatable AI OFF";
        aiBtn.style.backgroundColor = "greenyellow";
        aiBtn.style.color = "black";
        minimaxFlag = false;
    }
}


function bestSpot() {
    if (minimaxFlag) {
        return minimax(board, aiPlayer).index;
    } else {
        let availableSpots = emptySquares(board);
        let randIdx = Math.floor(Math.random() * availableSpots.length);
        return availableSpots[randIdx];
    }
}

function emptySquares(newBoard) {
    return newBoard.filter(s => typeof s === 'number');
}

function minimax(newBoard, player, alpha = -Infinity, beta = Infinity) {
    let availableSpots = emptySquares(newBoard);
    
    // base condition
    if (checkWin(newBoard, huPlayer)) {
        return {score: -1};
    } else if (checkWin(newBoard, aiPlayer)) {
        return {score: 1};
    } else if (availableSpots.length === 0) {
        return {score: 0};
    }

    let moves = [];
    for (let i = 0; i < availableSpots.length; i++) {
        let move = {};
        move.index = newBoard[availableSpots[i]];
        newBoard[availableSpots[i]] = player;

        let result;
        if (player === aiPlayer) {
            result = minimax(newBoard, huPlayer, alpha, beta);
            move.score = result.score;
            alpha = Math.max(alpha, result.score);
        } else {
            result = minimax(newBoard, aiPlayer, alpha, beta);
            move.score = result.score;
            beta = Math.min(beta, result.score);
        }

        newBoard[availableSpots[i]] = move.index;
        moves.push(move);

        // alpha-beta pruning
        if(beta <= alpha) {
            break;
        }
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}
