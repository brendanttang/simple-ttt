// sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// theme toggle button
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
});

// game
// defaults: hard difficulty, player is "X"
const game = {
    difficulty: 1,
    symbol: 1,
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
    ]
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
    "X",
    "O"
];
symbols.forEach((symbol, index) => {
    document.getElementById(`${symbol}-button`).addEventListener("click", () => {
        game.symbol = index;
        newGame();
    });
});

// runs the game
async function newGame() {
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
    // computer plays first move, if needed
    if (game.symbol == -1) {
        computerMove();
    }
    // begin taking turns, user first
    while (true) {
        // [TEMP] update status text: user turn
        // [TEMP] wait until the user goes
        // [TEMP] update status text: cpu turn
        await sleep(500 + Math.random() * 250)
        computerMove(); // computer plays a move, if possible
    }
}

// computer makes a move
function computerMove() {
    const openLength = openSpaces().length;
    const compSymbol = -1 * game.symbol;
    switch (game.difficulty) {
        case 0: // easy difficulty will make random moves
            makeMove(openLength * Math.random(), compSymbol);
            break;
        case 1: // hard difficulty will make or block a winning move, if possible
            if (winSpace(compSymbol) != null) { // valid win
                makeMove(winSpace(compSymbol), compSymbol)
            }
            else if (winSpace(game.symbol) != null) { // valid block
                makeMove(winSpace(game.symbol), compSymbol)
            }
            else { // random move
                makeMove(openLength * Math.random(), compSymbol);
            }
            break;
        /* case 2: // impossible difficulty will play optimally 
            if (winSpace(compSymbol) != null) { // WIN
                makeMove(winSpace(compSymbol), compSymbol)
            }
            else if (winSpace(game.symbol) != null) { // BLOCK
                makeMove(winSpace(game.symbol), compSymbol)
            }
            else if () { // FORK
                // [TEMP] a fork can be made if two intersecting winconLines are both equal to symbol, and their shared space is OPEN. this space is what must be played to create a fork
            }
            else if () { // BLOCK FORK

            }
            else if () { // CENTER

            }
            else if () { // OPPOSITE CORNER

            }
            else if () { // EMPTY CORNER

            }
            else if () { // EMPTY SIDE

            }
            break; */ 
    }
}

// returns the indices of open spaces
function openSpaces() {
    freeSpaces = [];
    for (const index of game.board) {
        if (game.board[index] == 0) {
            freeSpaces.push(index);
        }
    }
    return freeSpaces;
}

// returns the index which will result in a win for 'symbol', if possible
function winSpace(symbol) {
    const almostWincon = 2 * symbol;
    for (const index of game.wincon) {
        if (game.wincon[index] == almostWincon) {
            for (const space of game.winconLines[index]) {
                if (openSpaces().includes(space)) {
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

// makes a move
function makeMove(space, symbol) {
    game.board[space] = symbol; // updates board
}

// run the game immediately when open
newGame();

// board display
const boardDisplay = {
    boarde: document.querySelector(".board"),
    create () {
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("button");
            cell.classList.add("cell");
            cell.id = i;
            this.boarde.appendChild(cell);
        }
    }
}

boardDisplay.create();