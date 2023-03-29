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
    renderBoard(gBoard, '.board');
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

    board[0][1].isMine = true;
    board[1][2].isMine = true;
    board[2][3].isMine = true;
    board[0][3].isMine = true;

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
// if 0 set to EMPTY
// if mine - > continue
// for each cell 
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
                    // maybe add class? className += ' mine';
                } else {
                    cellContent = cell.minesAroundCount;
                    if (cell.minesAroundCount === 0) cellContent = EMPTY;
                }
            }
            // else cell not visible - > show unclicked cell
            else {
                className += ' cell-hidden'
            }

            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})">${cellContent}</td>`
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
    var location = {i: i, j: j};
    const cell = gBoard[i][j];

    if(!cell.isShown && !cell.isMine) {
        cell.isShown = true;
        //render dom changes to cell like style?
        // elCell.toggle('clicked');
        renderCell(location, cell.minesAroundCount);
    }

    else if(!cell.isShown && cell.isMine) {
        cell.isShown = true;
        //elCell.toggle('clicked');
        renderCell(location, MINE);
    }
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


