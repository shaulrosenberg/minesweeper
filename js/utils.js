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
            // change this incase
            if (board[i][j] === ' ') {
                emptyLocations.push({ i: i, j: j });
            }
        }
    }

    return emptyLocations;
}

function countMineNegs(cellPos) {
    var count = 0;

    for (var i = cellPos.i - 1; i < cellPos.i + 1; i++) {
        if(i >= board.length || i < 0 ) continue;
        for (var j = cellPos.j - 1; j < cellPos.j + 1; j++) {
            if(j >= board[0].length || j < 0) continue;
            var cell = gBoard[i][j];
            if(cell.isMine) count++;
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