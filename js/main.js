'use strict'

/*******************************************************************************
 * Author:  Shaul Rosenberg
 * Version: 1.1
 ******************************************************************************/

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ' '


var gBoard
var gGame
var gLevel = { SIZE: 4, MINES: 2 };
var gTimerInterval
var gHintsEnabled



function onInit() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        clicks: 0,
        safeClicksCount: 3,
        bestScore: localStorage.getItem('score'),
        hints: 3
    }
    gHintsEnabled = false;
    clearInterval(gTimerInterval);
    gTimerInterval = 0;
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard, '.board');
    showLives();
    updateScore();
    renderSafeClicks();
    renderHints();
    restartTimer();
    document.querySelector('.btn-restart').innerText = '😃';
}

// build board - > after placing the mines randomly - > calc the cell contents by counting
// the neighboring mines for each cell? - if countNegs === 0 cell = EMPTY
// board is full of cell Objects
function buildBoard() {
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = createCell(0);
        }
    }

    // random mines placement
    for (var i = 0; i < gLevel.MINES; i++) {
        var rowIdx = getRandomIntInclusive(0, board.length - 1);
        var colIdx = getRandomIntInclusive(0, board[0].length - 1);

        board[rowIdx][colIdx].isMine = true;
    }

    // testing purposes
    // board[0][1].isMine = true;
    // board[1][2].isMine = true;
    // board[2][3].isMine = true;
    // board[0][3].isMine = true;

    return board;
}

function createCell(aroundCount, isShown = false, isMine = false, isMarked = false) {
    var cell = {
        minesAroundCount: aroundCount,
        isShown: isShown,
        isMine: isMine,
        isMarked: isMarked,
        // need this for revealing neighbors with recursion
        isVisited: false
    }

    return cell;
}

// count and then set the cell's minesAroundCount
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j];
            if (cell.isMine) continue;
            cell.minesAroundCount = countMineNegs(i, j);
        }
    }
}

/******************************************************************************/

// pseudo: depending on the content of the Board Model will render either a mine / empty cell / 
// TODO: add different colors for different negCount
function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j]
            var className = `cell cell-${i}-${j}`
            var cellContent = ' ';

            // if cell is visible render its contents
            if (cell.isShown) {
                if (cell.isMine) {
                    cellContent = MINE;
                    className += ' mine';
                } else {
                    cellContent = cell.minesAroundCount;
                    className += ' clicked';
                    if (cell.minesAroundCount === 0) cellContent = EMPTY;
                }
            }
            else if (cell.isMarked) {
                cellContent = FLAG;
            }
            // else cell not visible - > show unclicked cell
            else {
                // className += ' cell-hidden'
            }

            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(event, this, ${i}, ${j})">${cellContent}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

/******************************************************************************/

// pseudo : revealCell(this)
// onClick one of the cells will reveal the contents on the current cell
// handle the different outcomes - mine / empty / 0 > negCount
// revealCell(i, j) - called when cellClicked(this, i, j) happens
function onCellClicked(elCell, i, j) {
    // const cell = gBoard[i][j]
    // case mine:  revealAllMines() call gameOver() or gameLife--
    // case empty: expandShown(board, elCell, i, j)
    // case number: revealCell(i, j);
    // startTimer() if first click;
    if (!gGame.isOn) return;
    gGame.clicks++;

    var location = { i: i, j: j };
    var cell = gBoard[i][j];

    // newly discovered cell
    if (!cell.isShown && !cell.isMine) {
        if (isFirstClick(gBoard)) {
            startTimer();
        }
        if (gHintsEnabled) {
            handleHint(i, j);
            return;
        }
        // update cell state and gGame.shownCount
        if (cell.minesAroundCount === 0) {
            //  expandShown(gBoard, elCell, i, j);
            floodFill(gBoard, i, j);
            renderBoard(gBoard, '.board');
        }
        else {
            cell.isVisited = true;
            cell.isShown = true;
            gGame.shownCount++;
            elCell.classList.toggle('clicked');
            renderCell(location, cell.minesAroundCount);
        }

        updateScore();
        checkGameOver();
    }

    // newly discovered mine
    else if (!cell.isShown && cell.isMine) {
        if (gHintsEnabled) {
            handleHint(i, j);
            return;
        }
        if (isFirstClick(gBoard)) {
            // if first click is a mine, swap it to random non-mine location
            var locations = getEmptyLocations(gBoard);
            var newMineLocation = locations[getRandomIntInclusive(0, locations.length - 1)];
            // update MODEL
            gBoard[newMineLocation.i][newMineLocation.j].isMine = true;
            gBoard[newMineLocation.i][newMineLocation.j].minesAroundCount = 0;
            gBoard[i][j].isMine = false;
            gBoard[i][j].minesAroundCount = countMineNegs(i, j);
            // update negs for board after mine swap
            setMinesNegsCount(gBoard);
            // call clickedCell Again with same position but different content
            onCellClicked(elCell, i, j);
            return;
        }
        cell.isShown = true;
        // cell.isVisited = true;
        gGame.lives--;
        updateScore();
        showLives();
        elCell.classList.toggle('mine');

        renderCell(location, MINE);
        if (gGame.lives === 0) {
            revealAllMines(gBoard);
            gameOver('☠');
        } else if (gGame.lives > 0) {
            // flip mine back if you have lives left
            setTimeout(function () {
                cell.isShown = false;
                renderBoard(gBoard, '.board');
            }, 2000, cell);
        }
    }
}

/******************************************************************************/

// this function is called when a cell is right clicked and to be marked
function onCellMarked(e, elCell, i, j) {
    e.preventDefault();

    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return;

    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        elCell.innerText = EMPTY;
        gGame.markedCount--
    }
    else {
        gBoard[i][j].isMarked = true;
        elCell.innerText = FLAG;
        gGame.markedCount++;
        checkGameOver();
    }
}

/******************************************************************************/

// revealAllMines() - in case we step on a mine and no more lives left
function revealAllMines(board) {
    const table = document.querySelector('table');

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                renderCell({ i: i, j: j }, MINE);
                table.querySelector(`.cell-${i}-${j}`).classList.add('mine');
            }
        }
    }
}

/******************************************************************************/

// this is called when no cell negsCount === 0, reveal all neighboring cells
// using floodFill instead
function expandShown(board, elCell, i, j) {
    for (var k = i - 1; k <= i + 1; k++) {
        if (k >= board.length || k < 0) continue;
        for (var m = j - 1; m <= j + 1; m++) {
            if (m === j && k === i) continue;
            if (m < 0 || m >= board[0].length) continue;
            if (!board[k][m].isVisited) gGame.shownCount++;
            board[k][m].isShown = true;
            board[k][m].isVisited = true;
        }
    }
    renderBoard(gBoard, '.board');
}

/******************************************************************************/

// when all cells are revealed and all mines are flagged
function checkGameOver() {
    // TODO: add condition to fix (marked === showncount)
    if (gGame.shownCount === (gLevel.SIZE ** 2) - gGame.markedCount &&
        (gGame.markedCount === gLevel.MINES)) {
        if (gGame.clicks < gGame.bestScore) {
            localStorage.setItem('score', gGame.clicks);
        }

        gameOver('😎');
        setTimeout(onInit, 2000);
    }
}

function gameOver(msg) {
    clearInterval(gTimerInterval);
    gGame.isOn = false;
    const elBtn = document.querySelector('.btn-restart');
    elBtn.innerText = msg;
}

/******************************************************************************/

function showLives() {
    const elLives = document.querySelector('.lives');
    var strHTML = '';
    for (var i = 0; i < gGame.lives; i++) {
        strHTML += '💖 ';
    }

    elLives.innerText = strHTML;
}

/******************************************************************************/

function onSafeClick() {
    if (gGame.safeClicksCount === 0 || !gGame.isOn) return;

    var i = getRandomIntInclusive(0, gBoard.length - 1);
    var j = getRandomIntInclusive(0, gBoard[0].length - 1);

    if (gBoard[i][j].isMine || gBoard[i][j].isShown) {
        onSafeClick();
        return;
    }

    const elCell = document.querySelector(`.cell-${i}-${j}`);
    elCell.classList.toggle('selected');

    gGame.safeClicksCount--;
    renderSafeClicks();

    setTimeout(function () {
        elCell.classList.toggle('selected');
    }, 2000, elCell);
}

function renderSafeClicks() {
    const elSafeCount = document.querySelector('.safe-click h6');
    elSafeCount.innerText = `${gGame.safeClicksCount} clicks available`;
}

/******************************************************************************/

function onChangeLevel(boardSize, mineCount) {
    gLevel.SIZE = boardSize;
    gLevel.MINES = mineCount;
    onInit();
}

/******************************************************************************/

function isFirstClick(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isShown) return false;
        }
    }

    return true;
}

/******************************************************************************/

function renderHints() {
    var elHints = document.querySelector('.hints');
    var strHTML = '';
    for (var i = 0; i < gGame.hints; i++) {
        strHTML += `<span onclick="onHint(this)">💡 </span>`;
    }

    elHints.innerHTML = strHTML;
}

function onHint(elHint) {
    if (!gGame.isOn || gGame.hints === 0) return;
    gGame.hints--;
    elHint.style.backgroundColor = 'yellow';
    gHintsEnabled = true;
}

function handleHint(i, j) {
    // show cell and neighbors for 1 second and then hide them
    updateNegs(i, j, true)
    setTimeout(function () {
        updateNegs(i, j, false);
    }, 1000, i, j);
    gHintsEnabled = false;
    renderHints();
}

/******************************************************************************/

function updateScore() {
    const elScore = document.querySelector('.score');
    const elBestScore = document.querySelector('.best-score');
    if (gGame.bestScore === null) {
        gGame.bestScore = Infinity;
        elBestScore.innerHTML = `Best Score: <br> No Score Yet...`;
    }

    else if (gGame.bestScore < Infinity) {
        elBestScore.innerHTML = `Best Score: <br> ${gGame.bestScore}`;
    }

    elScore.innerText = gGame.clicks;
}

/******************************************************************************/

function startTimer() {
    // don't start the timer again if a game is already in progress
    if(gTimerInterval) return;
    var startTime = Date.now()
    const elTimer = document.querySelector('.timer')
    gTimerInterval = setInterval(() => {
        gGame.secsPassed = Date.now() - startTime
        elTimer.innerText = Math.floor(gGame.secsPassed / 1000);
    }, 1000, elTimer);
}

function restartTimer() {
    const elTimer = document.querySelector('.timer')
    elTimer.innerText = '0'
}

/******************************************************************************/

// i did not invent this algorithm 🤣 - only adapted it to my game 
function floodFill(board, i, j) {
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length ||
        board[i][j].isVisited || board[i][j].isMine) {
        return;
    }

    // on the edges
    if (board[i][j].minesAroundCount > 0) {
        board[i][j].isVisited = true;
        board[i][j].isShown = true;
        gGame.shownCount++;
        return;
    }

    // visit cell
    board[i][j].isVisited = true;
    board[i][j].isShown = true;
    gGame.shownCount++;

    // recursively flood fill in all neighboring cells
    floodFill(board, i - 1, j);
    floodFill(board, i + 1, j);
    floodFill(board, i, j - 1);
    floodFill(board, i, j + 1);
}
