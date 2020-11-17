const GameBoardFactory = require("./board");
const Player = require("./player");

const DOMControls = (() => {
    let playerOne, playerTwo;

    this.startScreen = document.querySelector("#start-up");
    this.endScreen = document.querySelector("#game-over");
    this.inGameScreen = document.querySelector("#in-game");

    const playerCreation = () => {
        this.endScreen.classList.add("hidden");
        this.inGameScreen.classList.add("hidden");
        this.startScreen.classList.remove("hidden");
    }

    const startGame = (event) => {
        // Create players from each player entry
        // Register the players so this object can easily refer to them
        // Switch screen to the game screen
        //  - Specifically the ship-placement screen
        const playerEntries = document.querySelectorAll(".player-entry");
        const players = [];
        playerEntries.forEach(entryElement => {
            const playerName = entryElement.querySelector("#player-name").text;
            const isCPU = entryElement.querySelector("#is-cpu").checked;
            players.push(new Player(isCPU, playerName));
        });
        registerPlayers(...players);

        this.inGameScreen.classList.remove("hidden");
        this.startScreen.classList.add("hidden");
    }

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
            gameOver(this.playerTwo.name, this.playerOne.name);
        } else if(this.playerTwo.gameboard.allShipsSunk()){
            gameOver(this.playerOne.name, this.playerTwo.name);
        } else {
            // Add listeners so player one attacks board two and player two attacks board one
            if(!this.playerOne.isCPU){
                setupAttackListeners(boardElementTwo, this.playerOne, this.playerTwo, callback);
            } else if (this.playerOne.isTurn){
                callback(this.playerTwo, this.playerOne);
            }
            if(!this.playerTwo.isCPU){
                setupAttackListeners(boardElementOne, this.playerTwo, this.playerOne, callback);
            } else if(this.playerTwo.isTurn){
                callback(this.playerTwo, this.playerOne);
            }
        }
    }

    // TESTING PURPOSES ONLY; DELETE THIS NEPHEW
    document.querySelector("header h1").addEventListener("click", event => gameOver("test", "loser!"));

    // Set up event listeners for the UI that doesn't change
    document.querySelector("#new-game").onclick = startGame;

    return {
        registerPlayers,
        refresh,
        renderBoard,
        setupAttackListeners,
        gameOver,
    }
})();

module.exports = DOMControls;