import random 
from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)
@app.route('/')
def home():
    return render_template('index.html')

import random

@app.route('/make-move', methods=['POST'])
def make_move():
    data = request.json
    board = data['board']
    mode = data['mode']
    current_player = data.get('currentPlayer', 'X') # Default to 'X'

    if mode == 'play_with_friend':
        # In "Play with Friend" mode, the move is handled by the frontend and alternates between 'X' and 'O'
        return jsonify({'board': board, 'next_player': 'O' if current_player == 'X' else 'X'})
    if mode == 'easy':
        move = random.choice([i for i, cell in enumerate(board) if cell is None])
    elif mode == 'average':
        move = get_average_move(board)
    elif mode == 'impossible':
        move = get_best_move(board)
    else:
        return jsonify({'board': board})

    board[move] = 'O'
    return jsonify({'board': board})


def get_average_move(board):
    """ Simple blocking logic or random move """
    # If the opponent is about to win, block their move
    for i in range(len(board)):
        if board[i] is None:
            board[i] = 'X'  # Temporarily make a move as opponent
            if check_winner(board) == 'X':  # Check if opponent would win
                board[i] = None  # Undo the move
                return i  # Block this move
            board[i] = None  # Undo the move

    # Otherwise, pick a random available move
    return random.choice([i for i, cell in enumerate(board) if cell is None])


def get_best_move(board):
    """ Use Minimax algorithm to find the best move """
    best_score = float('-inf')
    best_move = None

    for i in range(len(board)):
        if board[i] is None:
            board[i] = 'O'  # Make a tentative move as the agent
            score = minimax(board, False)  # Call minimax as minimizing player
            board[i] = None  # Undo the move
            if score > best_score:
                best_score = score
                best_move = i

    return best_move


def minimax(board, is_maximizing):
    """ Minimax algorithm implementation """
    winner = check_winner(board)
    if winner == 'O':  # Agent wins
        return 1
    elif winner == 'X':  # Opponent wins
        return -1
    elif all(cell is not None for cell in board):  # Draw
        return 0

    if is_maximizing:
        best_score = float('-inf')
        for i in range(len(board)):
            if board[i] is None:
                board[i] = 'O'
                score = minimax(board, False)
                board[i] = None
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = float('inf')
        for i in range(len(board)):
            if board[i] is None:
                board[i] = 'X'
                score = minimax(board, True)
                board[i] = None
                best_score = min(score, best_score)
        return best_score


def check_winner(board):
    """ Check for winner or draw """
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]              # Diagonals
    ]

    for combo in winning_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] and board[combo[0]] is not None:
            return board[combo[0]]  # Return 'X' or 'O' for the winner

    return None  # No winner yet




if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if no PORT is set
    app.run(host="0.0.0.0", port=port)
