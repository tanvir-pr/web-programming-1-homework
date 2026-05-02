/**
 * Tic-tac-toe mini-app for SPA homework (React + useState + createElement).
 * Classic React introductory pattern (board array + turn).
 */
(function (global) {
  var ReactRef = global.React;
  if (!ReactRef) return;
  var e = ReactRef.createElement;
  var useState = ReactRef.useState;

  var LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function calculateWinner(board) {
    for (var i = 0; i < LINES.length; i++) {
      var a = LINES[i][0];
      var b = LINES[i][1];
      var c = LINES[i][2];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  function TicTacToeApp() {
    var _board = useState(function () {
      return Array(9).fill(null);
    });
    var board = _board[0];
    var setBoard = _board[1];
    var _xIsNext = useState(true);
    var xIsNext = _xIsNext[0];
    var setXIsNext = _xIsNext[1];

    var win = calculateWinner(board);
    var full = board.every(Boolean);
    var status = win
      ? "Winner: " + win
      : full
        ? "Draw"
        : "Next player: " + (xIsNext ? "X" : "O");

    function clickCell(index) {
      if (win || board[index]) return;
      var next = board.slice();
      next[index] = xIsNext ? "X" : "O";
      setBoard(next);
      setXIsNext(!xIsNext);
    }

    function resetGame() {
      setBoard(Array(9).fill(null));
      setXIsNext(true);
    }

    var cells = [];
    for (var idx = 0; idx < 9; idx++) {
      cells.push(
        e(
          "button",
          {
            key: idx,
            type: "button",
            className: "ttt-cell",
            onClick: function (i) {
              clickCell(i);
            }.bind(null, idx),
          },
          board[idx] || ""
        )
      );
    }

    return e(
      "div",
      { className: "ttt-app" },
      e("p", { className: "ttt-status", "aria-live": "polite" }, status),
      e("div", { className: "ttt-board" }, cells),
      e(
        "button",
        {
          type: "button",
          className: "btn btn-secondary ttt-reset",
          onClick: resetGame,
        },
        "New game"
      )
    );
  }

  global.HomeworkTicTacToeApp = TicTacToeApp;
})(typeof window !== "undefined" ? window : globalThis);
