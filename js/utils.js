'use strict'

function renderBoard(mat, selector) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getEmptyLocations(board) {
    var emptyLocations = [];

    for (var i = 1; i < board.length; i++) {
        for (var j = 1; j < board[0].length; j++) {
            // find another place to put the mine
            // and re render board
            if (!board[i][j].isMine) {
                emptyLocations.push({ i: i, j: j });
            }
        }
    }

    return emptyLocations;
}

// for state changes
function countMineNegs(board, rowIdx, colIdx) {
    var count = 0;

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i >= board.length || i < 0) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue;
            if (j >= board[0].length || j < 0) continue;
            var cell = board[i][j];
            if (cell.isMine) count++;
        }
    }

    return count;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}


function updateNegs(rowIdx, colIdx, state) {
    
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            gBoard[i][j].isShown = state;
        }
    }

    renderBoard(gBoard, '.board');
}


