/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
let nextPlayer = 2;
let board = []; // array of rows, each row is array of cells  (board[y][x])
const htmlBoard = document.querySelector('#board');

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  for (let y = 0; y < HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WIDTH; x++) {
      const cell = null;
      row.push(cell);
    }
    board.push(row);
  }
 }
/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  // create table row for the top of the columns
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);
  // create a cell for each column
  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }

  // create table rows for all other spots
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    // each row gets cells for each column with celly-x id 
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `cell${y}-${x}`);
      row.append(cell);
    }
    // prepend instead of append to play bottom up 
    htmlBoard.prepend(row);
    htmlBoard.prepend(top);
  }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  const y = board.findIndex((row) => row[x] === null)
  return y !== -1 ? y : null; 
}


/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  const newPiece = document.createElement('div');
  newPiece.classList.add('piece');
  newPiece.classList.add(`player${currPlayer}`);
  const td = document.querySelector(`#cell${y}-${x}`);
  // calculate the proper location for the new piece
  const newTop = calculateNewTop(y);
  // add to parent element... needed for animation? only getting "inherit" to work
  td.style.top = newTop;
  newPiece.style.animationDuration = calculateNewTime(y);
  td.append(newPiece);
}

// unhappy with this... Couldn't do animation with pure CSS... needed to calculate dynamically 
// guess and check on values
const FIRST_TOP = 356;
const DELTA_TOP = 54; 
const calculateNewTop = y => `${FIRST_TOP - DELTA_TOP * y}px`

// change time based on where the piece is going. Prevents pieces from slowing as they stack
const FIRST_TIME = 0.5;
const DELTA_TIME = 0.05; 
const calculateNewTime = y => `${FIRST_TIME - DELTA_TIME * y}s`;

/** endGame: announce game end and start over */

function endGame(msg) {
  setTimeout(() => {
    // say who won
    alert(msg);
    startOver();
   }, FIRST_TIME * 1000);

}

// startOver: clear boards, reset player, and create fresh boards 
function startOver() {
  // clear boards
  htmlBoard.innerHTML = '';
  board = [];
  // reset active player
  currPlayer = 1;
  nextPlayer = 2;
  // create fresh boards
  makeBoard();
  makeHtmlBoard();
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  // get x from ID of clicked cell
  const x = +evt.target.id;

  // get next spot in column (if none, ignore click)
  const y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  placeInTable(y, x);
  board[y][x] = currPlayer;

  // check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  if (board.every((row) => row.every((cell) => cell !== null))) {
    return endGame("It's a tie!");
  }

  // switch players
  [currPlayer, nextPlayer] = [nextPlayer, currPlayer]; 
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // check each piece individually to see if there are four in a row
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      // current piece and 3 pieces to the right
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      // current piece and 3 pieces up
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      // current piece and 3 pieces down right
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      // current piece and 3 pieces down left
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();
