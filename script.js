// theme toggle button
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
});

// game
// defaults: hard difficulty, player is "X"
const game = {
    difficulty: 1,
    symbol: 1,
    turn: 1,
    over: false,
    timer: null,
    board: [
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
    ],
    wincon: [
        0, 0, 0, // rows 1, 2, 3
        0, 0, 0, // columns 1, 2, 3
        0, 0 // diagonal, antidiagonal
    ],
    winconLines: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ],
    scores: {win: 0, draw: 0, lose: 0}
};

// difficulty toggle buttons
// easy: 0, hard: 1, impossible: 2
const difficulties = [
    "easy",
    "hard",
    "impossible"
];
difficulties.forEach((difficulty, index) => {
    document.getElementById(`${difficulty}-button`).addEventListener("click", () => {
        game.difficulty = index;
        newGame();
    });
});

// your symbol buttons
// X: +1, O: -1
const symbols = [
    {id: "X", value: 1},
    {id: "O", value: -1}
];
symbols.forEach(({id, value}) => {
    document.getElementById(`${id}-button`).addEventListener("click", () => {
        game.symbol = value;
        newGame();
    });
});

// for button bolding
function updateButtons() {
    difficulties.forEach((name, i) => {
        document.getElementById(`${name}-button`)
            .classList.toggle("active", game.difficulty === i);
    });
    symbols.forEach(({id, value}) => {
        document.getElementById(`${id}-button`)
            .classList.toggle("active", game.symbol === value);
    });
}

// runs the game
function newGame() {
    clearTimeout(game.timer);
    // reset board, wincon
    game.board = [
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
    ]
    game.wincon = [
        0, 0, 0,
        0, 0, 0,
        0, 0
    ]
    // reset some more stuff
    game.turn = 1;
    game.over = false;
    boardDisplay.hideLine();
    boardDisplay.render();
    updateButtons();
    nextTurn();
}

// decides what happens based on whose turn it is
function nextTurn() {
    if (game.turn === game.symbol) {
        setStatus("Your turn");
    }
    else {
        setStatus("CPU is thinking...");
        game.timer = setTimeout(computerMove, 500 + Math.random() * 250);
    }
}

// called by clicking on a cell
function playerMove(space) {
    if (game.over) return;
    if (game.turn !== game.symbol) return;
    if (game.board[space] !== 0) return;
    makeMove(space, game.symbol);
    endTurn();
}

// some stuff to check after a turn happens
function endTurn() {
    boardDisplay.render();
    const result = checkResult();
    if (result !== null) {
        finishGame(result);
        return;
    }
    game.turn *= -1;
    nextTurn();
}

// post-game
function finishGame(result) {
    game.over = true;
    let key, message;
    if (result === 0) {key = "draw"; message = "It's a draw!";}
    else if (result === game.symbol) {key = "win"; message = "You win!";}
    else {key = "lose"; message = "CPU wins!";}

    if (result !== 0) {
        const lineIndex = game.wincon.findIndex(v => Math.abs(v) === 3);
        boardDisplay.showLine(lineIndex, key); 
    }

    game.scores[key]++;
    document.getElementById(`result-${key}`).textContent = game.scores[key];
    setStatus(message);
}

// computer makes a move
function computerMove() {
    const compSymbol = -game.symbol;
    let space;
    switch (game.difficulty) {
        case 0: // easy: random
            space = randomOf(openSpaces());
            break;
        case 1: // hard: wins or blocks a win if possible
            space = winSpace(compSymbol) ?? winSpace(game.symbol) ?? preferredMove();
            break;
        case 2: // impossible: optimal play
            space = bestMove(compSymbol);
            break;
    }
    makeMove(space, compSymbol);
    endTurn();
}

// returns the indices of open spaces
function openSpaces() {
    const free = [];
    for (let i = 0; i < game.board.length; i++) {
        if (game.board[i] === 0) {
            free.push(i);
        }
    }
    return free;
}

// returns the index which will result in a win for 'symbol', if possible
function winSpace(symbol) {
    const target = 2 * symbol;
    for (let i = 0; i < game.wincon.length; i++) {
        if (game.wincon[i] === target) {
            for (const space of game.winconLines[i]) {
                if (game.board[space] === 0) {
                    return space;
                }
            }
        }
    }
    return null;
}

// returns the symbol (-1, +1) who won, if applicable
function winner() {
    if (game.wincon.includes(3)) {
        return 1;
    }
    else if (game.wincon.includes(-3)) {
        return -1;
    }
    else {
        return null;
    }
}

function checkResult() {
    const w = winner();
    if (w !== null) return w;
    if (openSpaces().length === 0) return 0;
    return null;
}

function randomOf(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const corners = [0, 2, 6, 8];
const sides = [1, 3, 5, 7];

function preferredMove() {
    const open = openSpaces();
    return (game.board[4] === 0 ? 4 : null)
        ?? randomOf(open.filter(s => corners.includes(s)))
        ?? randomOf(open.filter(s => sides.includes(s))) 
        // center > corners > sides
}

// impossible mode logic begins here --------------------

// returns the symbol that has three in a row, else 0
function boardWinner(board) {
    for (const [a, b, c] of game.winconLines) {
        const sum = board[a] + board[b] + board[c];
        if (Math.abs(sum) === 3) return sum / 3;
    }
    return 0;
}

// scoring criteria 
function minimax(board, turn, me, depth) {
    const w = boardWinner(board);
    if (w !== 0) return w === me ? 10 - depth : depth - 10;
    if (!board.includes(0)) return 0;
    const scores = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === 0) {
            board[i] = turn;
            scores.push(minimax(board, -turn, me, depth + 1));
            board[i] = 0;
        }
    }
    return turn === me ? Math.max(...scores) : Math.min(...scores);
}

// picks any of the equally best moves
function bestMove(me) {
    const board = [...game.board];
    let best = -Infinity;
    let moves = [];
    for (const i of openSpaces()) {
        board[i] = me;
        const score = minimax(board, -me, me, 1);
        board[i] = 0;
        if (score > best) {
            best = score;
            moves = [i];
        }
        else if (score === best) {
            moves.push(i)
        }
    }
    return (moves.includes(4) ? 4 : null)
        ?? randomOf(moves.filter(s => corners.includes(s)))
        ?? randomOf(moves.filter(s => sides.includes(s)));
}

// impossible mode logic ends here --------------------

// makes a move
function makeMove(space, symbol) {
    game.board[space] = symbol; // updates board
    game.winconLines.forEach((line, i) => {
        if (line.includes(space)) game.wincon[i] += symbol;
    }); // updates wincon(s)
}

// board display
const svgNS = "http://www.w3.org/2000/svg";

const boardDisplay = {
    boardElement: document.querySelector(".board"),
    cells: [],
    overlay: null,
    strokeLine: null,

    create() {
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("button");
            cell.classList.add("cell");
            cell.addEventListener("click", () => playerMove(i));
            this.boardElement.appendChild(cell);
            this.cells.push(cell);
        }
        // overlay for the winning line
        this.overlay = document.createElementNS(svgNS, "svg");
        this.overlay.classList.add("line-overlay");
        this.strokeLine = document.createElementNS(svgNS, "line");
        this.overlay.appendChild(this.strokeLine);
        this.boardElement.appendChild(this.overlay);
    },

    render() {
        this.cells.forEach((cell, i) => {
            const v = game.board[i];
            cell.textContent = v === 1 ? "X" : v === -1 ? "O" : "";
        });
    },

    // lineIndex = index into winconLines, kind = "win" or "lose"
    showLine(lineIndex, kind) {
        const line = game.winconLines[lineIndex];
        const start = this.cells[line[0]];
        const end = this.cells[line[2]];
        const w = this.boardElement.clientWidth;
        const h = this.boardElement.clientHeight;
        const pct = (value, total) => (value / total * 100) + "%";

        this.strokeLine.setAttribute("x1", pct(start.offsetLeft + start.offsetWidth / 2, w));
        this.strokeLine.setAttribute("y1", pct(start.offsetTop + start.offsetHeight / 2, h));
        this.strokeLine.setAttribute("x2", pct(end.offsetLeft + end.offsetWidth / 2, w));
        this.strokeLine.setAttribute("y2", pct(end.offsetTop + end.offsetHeight / 2, h));
        this.strokeLine.setAttribute("class", kind);
        this.overlay.classList.add("visible");
    },

    hideLine() {
        this.overlay.classList.remove("visible");
    }
};

boardDisplay.create();

function setStatus(text) {
    document.getElementById("status-text").textContent = text;
}

// (re)start the game

document.getElementById("restart-button").addEventListener("click", newGame);

newGame();