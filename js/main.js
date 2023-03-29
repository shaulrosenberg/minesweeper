'use strict'

const MINE = '💣'
const EMPTY = ' '


var gBoard
var gGame
var gLevel
var gTimerInterval


function onInit() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel = {
        SIZE: 4,
        MINES: 2
    }
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
}

// build board - > after placing the mines randomly - > calc the cell contents by counting
// the neighboring mines for each cell? - if countNegs === 0 cell = EMPTY
// board is full of cell Objects
function buildBoard() {
    var board = []

    for(var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for(var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = createCell(0);
        }
    }
}

function createCell(aroundCount, isShown = false, isMine = false, isMarked = false) {
    var cell = {
        minesAroundCount: aroundCount,
        isShown: false,
        isMine: false,
        isMarked: true
    }

    return cell;
}

// count and then set the cell's minesAroundCount
// if 0 set to EMPTY
// if mine - > continue
// for each cell 
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j];
            if (cell.isMine) continue;
            cell.minesAroundCount = countMineNegs({i: i, j: j});
        }
    }
}

// pseudo : function renderBoard(board, selector) - iterates through and 
// depending on the content of the Board Model will render either a mine / empty cell / 
function renderBoard(board, selector) {

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
}

// this function is called when a cell is right clicked and to be marked
// TODO: hide context-menu when right clicked and mark with flag
function onCellMarked(elCell) {

}


// revealAllMines() - in case we step on a mine
function revealAllMines(board) {

}

// this is called when no cell negsCount === 0, reveal all neighboring cells
function expandShown(board, elCell, i, j) {

}

// when all cells are revealed and all mines are flagged
function checkGameOver() {

}


