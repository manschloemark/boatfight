const DOMControls = (() => {
    let playerOne, playerTwo;
    const registerPlayers = (pOne,pTwo) => {
        this.playerOne = pOne;
        this.playerTwo = pTwo;
    }

    const gameOver = (winner, loser) => {
        const gameOver = document.querySelector("#game-over");

        gameOver.querySelector("#winner").textContent = `Player ${winner} won!`;
        gameOver.querySelector("#loser").textContent = `Sorry Player ${loser}...`;
        gameOver.classList.remove("hidden");
    }

    const renderBoard = (number, player) => {
        const boardElement = document.querySelector(`#player-${number} .game-board`);
        while(boardElement.hasChildNodes()){
            boardElement.removeChild(boardElement.firstChild);
        }
        boardElement.style.gridTemplateRows = `repeat(${player.gameboard.height}, 1fr)`;
        boardElement.style.gridTemplateColumns = `repeat(${player.gameboard.width}, 1fr)`;
        const board = player.gameboard.viewBoard();
        for(let r = 0; r < player.gameboard.height; r++){
            for(let c = 0; c < player.gameboard.width; c++){
                let tile = document.createElement("div");
                tile.dataset["row"] = r;
                tile.dataset["column"] = c;
                tile.classList.add("tile");
                if(board[r][c]){
                    if(board[r][c].isHit){
                        tile.classList.add("damaged");
                    } else {
                        tile.classList.add("unknown");
                    }
                } else if (board[r][c] === false){
                    tile.classList.add("empty");
                } else {
                    tile.classList.add("unknown");
                }
                boardElement.appendChild(tile);
            }
        }
        return boardElement;
    }

    const revealTile = (row, column, board) => {
        return
    }

    const setupAttackListeners = (boardElement, attacker, defender, callback) => {
        boardElement.querySelectorAll(".unknown").forEach(tile => {
            tile.addEventListener("click", event => callback(attacker, defender, event));
        });
    }

    const refresh = (callback) => {
        // Initialize the board for each player
        const boardElementOne = renderBoard("one", this.playerOne);
        const boardElementTwo = renderBoard("two", this.playerTwo);

        if(this.playerOne.gameboard.allShipsSunk()){
            gameOver("two", "one");
        } else if(this.playerTwo.gameboard.allShipsSunk()){
            gameOver("one", "two");
        } else {
            // Add listeners so player one attacks board two and player two attacks board one
            setupAttackListeners(boardElementTwo, this.playerOne, this.playerTwo, callback);
            if(!this.playerTwo.isCPU){
                setupAttackListeners(boardElementOne, this.playerTwo, this.playerOne, callback);
            } else if(this.playerTwo.isTurn){
                callback(this.playerTwo, this.playerOne);
            }
        }
    }

    // TESTING PURPOSES ONLY; DELETE THIS NEPHEW
    document.querySelector("header h1").addEventListener("click", event => gameOver("test", "loser!"));

    return {
        registerPlayers,
        refresh,
        renderBoard,
        setupAttackListeners,
        gameOver,
    }
})();

module.exports = DOMControls;