'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ' '


var gBoard
var gGame
var gLevel
var gTimerInterval



function onInit() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }
    gLevel = {
        SIZE: 4,
        MINES: 4
    }
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard, '.board');
    showLives();
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
        isMarked: isMarked
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
            console.log(cell.minesAroundCount);
        }
    }
}

// pseudo : function renderBoard(board, selector) - iterates through and 
// depending on the content of the Board Model will render either a mine / empty cell / 
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


// pseudo : revealCell(this)
// onClick one of the cells will reveal the contents on the current cell
// handle the different outcomes - mine ? empty ? a cell with a neighboring mine?
// revealCell(i, j) - called when cellClicked(this, i, j) happens
function onCellClicked(elCell, i, j) {
    // const cell = gBoard[i][j]
    // case mine:  revealAllMines() call gameOver() or gameLife--
    // case empty: expandShown(board, elCell, i, j)
    // case number: revealCell(i, j);
    // startTimer();
    if (!gGame.isOn) return;

    var location = { i: i, j: j };
    var cell = gBoard[i][j];

    if (!cell.isShown && !cell.isMine) {
        cell.isShown = true;
        gGame.shownCount++;
        if (cell.minesAroundCount === 0) {
            // TODO: inside expand remember to keep count of shownCount
            expandShown(gBoard, elCell, i, j);
        }
        //render dom changes to cell like style?
        // elCell.toggle('clicked');
        // gGame.shownCount++;
        elCell.classList.toggle('clicked');
        renderCell(location, cell.minesAroundCount);
        checkGameOver();
    }

    else if (!cell.isShown && cell.isMine) {
        cell.isShown = true;
        gGame.lives--;
        showLives();
        //elCell.toggle('clicked');
        elCell.classList.toggle('mine');

        renderCell(location, MINE);
        if (gGame.lives === 0) {
            revealAllMines(gBoard);
            gameOver();
            return;
        } else {
            // flip mine back if you have lives left
            setTimeout(function () {
                cell.isShown = false;
                renderBoard(gBoard, '.board');
            }, 2000);
        }
    }
}

// this function is called when a cell is right clicked and to be marked
function onCellMarked(event, elCell, i, j) {
    event.preventDefault();

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

// this is called when no cell negsCount === 0, reveal all neighboring cells
function expandShown(board, elCell, i, j) {
    console.log('expand shown called');
}

// when all cells are revealed and all mines are flagged
function checkGameOver() {
    // maybe count flagged and subtract instead of mines
    if (gGame.shownCount === (gLevel.SIZE ** 2) - gGame.markedCount) {
        gameOver();
        onInit();
    }
}

function gameOver() {
    clearInterval(gTimerInterval);
    gGame.isOn = false;
    const elBtn = document.querySelector('.btn-restart');
    elBtn.innerText = '😎';
}

function getMineHtml() {

}

function showLives() {
    const elLives = document.querySelector('.lives');
    var strHTML = '';
    for (var i = 0; i < gGame.lives; i++) {
        strHTML += '💖 ';
    }

    elLives.innerText = strHTML;
}




