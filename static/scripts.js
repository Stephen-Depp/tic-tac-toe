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

// Handle game over logic for both win and draw
function handleGameOver(winner) {
  const winMessage = winner === "draw" ? "It's a draw!" : `${winner} wins!`;
  document.getElementById("win-message").textContent = winMessage;

  const winModal = document.getElementById("win-modal");
  winModal.style.display = "block"; // Display the modal

  // Automatically restart game after 3 seconds
  setTimeout(() => {
    winModal.style.display = "none";
    restartGame(); // Restart game after showing result
  }, 3000);
}

// Update game status message
function displayMessage(message) {
  const status = document.querySelector(".status");
  status.innerText = message; // Update status text
  status.classList.add("highlight"); // Optional: Add class for styling
}

// Check for winner or draw
function checkWinner() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Check for a win
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Return "X" or "O" for the winner
    }
  }

  // Check for a draw
  if (board.every((cell) => cell !== null)) {
    return "draw"; // Return "draw" if all cells are filled
  }

  return null; // No winner or draw yet
}

// Handle game state logic after each move
function handleGameState() {
  const winner = checkWinner(); // Check the current game state

  if (winner) {
    if (winner === "draw") {
      displayMessage("It's a draw!"); // Show draw message
    } else {
      displayMessage(`${winner} wins!`); // Show winning message
    }
    handleGameOver(winner); // Handle modal and reset game
    return true; // Stop further moves once game is over
  }

  return false; // Game continues
}

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

// Handle cell click event
document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = parseInt(cell.dataset.cell);
    if (!board[index]) {
      if (currentMode === "friend") {
        makeMove(index, currentPlayer); // Make a move in Friend mode
        if (!handleGameState()) {
          // Switch players if game continues
          currentPlayer = currentPlayer === "X" ? "O" : "X";
          document.getElementById(
            "current-player"
          ).textContent = `Current Player: ${currentPlayer}`;
        }
      } else {
        // AI Modes
        makeMove(index, "X");
        if (handleGameState()) return; // Stop if game over

        // Send AI move request
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
            updateBoard(); // Update board after AI move
            handleGameState(); // Check game status after AI's move
          });
      }
    }
  });
});

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

// Start a new game with a chosen mode
startNewGame("easy"); // You can set default mode to "easy" or "friend"
