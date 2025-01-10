let currentMode = "easy";
let board = Array(9).fill(null);
let currentPlayer = "X"; // Starts with "X"

// Start a new game
function startNewGame(mode) {
  currentMode = mode;
  board = Array(9).fill(null);
  currentPlayer = "X"; // Reset to "X" at the start
  document.getElementById("current-player").textContent = `Current Player: X`;
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken");
  });
}

// Restart game using the current mode
function restartGame() {
  startNewGame(currentMode);
}

// Handle game over
function handleGameOver(winner) {
  const winMessage = winner === "draw" ? "It's a draw!" : ` ${winner} wins!`;
  document.getElementById("win-message").textContent = winMessage;
  const winModal = document.getElementById("win-modal");
  winModal.style.display = "block";
  setTimeout(() => {
    winModal.style.display = "none";
    restartGame(); // Automatically restart the game
  }, 3000); // Hide after 3 seconds
}

// Add event listeners to all cells (avoiding duplicates)
document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = parseInt(cell.dataset.cell);
    if (!board[index]) {
      if (currentMode === "friend") {
        // Play with Friend mode
        makeMove(index, currentPlayer);
        const winner = checkWinner();
        if (winner) {
          handleGameOver(winner);
          return;
        }
        currentPlayer = currentPlayer === "X" ? "O" : "X"; // Switch players
        document.getElementById(
          "current-player"
        ).textContent = `Current Player: ${currentPlayer}`;
      } else {
        // AI Modes
        makeMove(index, "X");
        const winner = checkWinner();
        if (winner) {
          handleGameOver(winner);
          return;
        }
        fetch("/make-move", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ board, mode: currentMode }),
        })
          .then((res) => res.json())
          .then((data) => {
            board = data.board;
            updateBoard();
            const winner = checkWinner();
            if (winner) {
              handleGameOver(winner);
            }
          });
      }
    }
  });
});

// Make a move
function makeMove(index, player) {
  if (!board[index]) {
    board[index] = player;
    const cell = document.querySelector(`[data-cell="${index}"]`);
    cell.textContent = player;
    cell.classList.add("taken");
  }
}

// Update the board after AI move
function updateBoard() {
  board.forEach((mark, i) => {
    const cell = document.querySelector(`[data-cell="${i}"]`);
    cell.textContent = mark;
    if (mark) cell.classList.add("taken");
  });
}

// Check for winner or draw
function checkWinner() {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.includes(null) ? null : "Draw";
}

// Close the modal when the user clicks anywhere on the page
document.addEventListener("click", function (event) {
  const modal = document.getElementById("win-modal");
  if (modal.style.display === "flex") {
    closeModal();
  }
});

// Prevent modal from closing when clicking inside the modal content
document
  .querySelector(".modal-content")
  .addEventListener("click", function (event) {
    event.stopPropagation();
  });

// Close the modal when the user clicks anywhere outside of it
window.onclick = function (event) {
  const modal = document.getElementById("win-modal");
  if (event.target == modal) {
    modal.style.display = "none";
    startNewGame(currentMode);
  }
};
