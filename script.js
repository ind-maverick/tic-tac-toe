const board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const difficultySelect = document.getElementById('difficulty');
const xWinsSpan = document.getElementById('x-wins');
const oWinsSpan = document.getElementById('o-wins');
const drawsSpan = document.getElementById('draws');
const resetScoresBtn = document.getElementById('reset-scores');

// Load scores from localStorage
let scores = JSON.parse(localStorage.getItem('ticTacToeScores')) || {
    x: 0,
    o: 0,
    draws: 0
};

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('touchstart', handleCellClick, { passive: true }); // For touch devices
});
restartBtn.addEventListener('click', restartGame);
resetScoresBtn.addEventListener('click', resetScores);
difficultySelect.addEventListener('change', restartGame);

// Initialize scoreboard
updateScoreboard();

function handleCellClick(e) {
    e.preventDefault(); // Prevent default touch behavior
    const index = e.target.dataset.index;
    if (board[index] === '' && currentPlayer === 'X') {
        board[index] = 'X';
        e.target.textContent = 'X';
        if (checkWin('X')) {
            status.textContent = 'Player X wins!';
            scores.x++;
            updateScoreboard();
            disableBoard();
            return;
        }
        if (isBoardFull()) {
            status.textContent = 'Draw!';
            scores.draws++;
            updateScoreboard();
            disableBoard();
            return;
        }
        currentPlayer = 'O';
        status.textContent = "AI O's turn";
        setTimeout(aiMove, 500);
    }
}

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark')? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

function aiMove() {
    const difficulty = difficultySelect.value;
    let move;

    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = Math.random() < 0.5 ? getRandomMove() : minimax(board, 'O').index;
    } else {
        move = minimax(board, 'O').index;
    }

    board[move] = 'O';
    cells[move].textContent = 'O';
    if (checkWin('O')) {
        status.textContent = 'AI O wins!';
        scores.o++;
        updateScoreboard();
        disableBoard();
        return;
    }
    if (isBoardFull()) {
        status.textContent = 'Draw!';
        scores.draws++;
        updateScoreboard();
        disableBoard();
        return;
    }
    currentPlayer = 'X';
    status.textContent = "Player X's turn";
}

function getRandomMove() {
    const availSpots = board.reduce((acc, val, idx) => {
        if (val === '') acc.push(idx);
        return acc;
    }, []);
    return availSpots[Math.floor(Math.random() * availSpots.length)];
}

function checkWin(player) {
    return winningCombinations.some(combo => {
        return combo.every(index => board[index] === player);
    });
}

function isBoardFull() {
    return board.every(cell => cell !== '');
}

function disableBoard() {
    cells.forEach(cell => cell.style.cursor = 'not-allowed');
    cells.forEach(cell => {
        cell.removeEventListener('click', handleCellClick);
        cell.removeEventListener('touchstart', handleCellClick);
    });
}

function restartGame() {
    board.fill('');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('touchstart', handleCellClick, { passive: true });
    });
    currentPlayer = 'X';
    status.textContent = "Player X's turn";
}

function updateScoreboard() {
    xWinsSpan.textContent = scores.x;
    oWinsSpan.textContent = scores.o;
    drawsSpan.textContent = scores.draws;
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

function resetScores() {
    scores = { x: 0, o: 0, draws: 0 };
    updateScoreboard();
}

function minimax(newBoard, player) {
    const availSpots = newBoard.reduce((acc, val, idx) => {
        if (val === '') acc.push(idx);
        return acc;
    }, []);

    if (checkWin('X')) return { score: -10 };
    if (checkWin('O')) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
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