const DOMControls = (() => {

    this.playerCreation = document.querySelector("#player-creation");
    this.inGame = document.querySelector("#in-game");
    this.gameOver = document.querySelector("#game-over");
    this.playerOneElement = document.querySelector("#player-one");
    this.playerTwoElement = document.querySelector("#player-two");

    const showPlayerCreation = () => {
        this.playerCreation.classList.remove("hidden");
        this.inGame.classList.add("hidden");
        this.gameOver.classList.add("hidden");
    }

    const readPlayerInput = () => {
        const playerDivs = document.querySelectorAll(".player-entry");
        const playerData = [];
        playerDivs.forEach(div => {
            let name = div.querySelector(".player-name").value;
            if(name == ''){
                name = div.querySelector("h3").textContent;
            }
            let isCPU = div.querySelector(".is-cpu").checked;
            playerData.push([isCPU, name]);
        });
        return playerData;
    }

    const clearBoard = (board) => {
        while(board.hasChildNodes()){
            board.removeChild(boardElement.firstChild);
        }
    }

    const renderBoard = (boardElement, player) => {
        clearBoard(boardElement);
        if(player.isTurn){
            boardElement.classList.add("active");
            boardElement.classList.remove("idle");
        } else {
            boardElement.classList.add("idle");
            boardElement.classList.remove("active");
        }
        const board = player.gameboard.viewBoard();
        const numRows = player.gameboard.height;
        const numCols = player.gameboard.width;
        for(let row = 0; row < numRows; row++){
            for(let col = 0; col < numCols; col++){
                let tile = document.createElement("div");
                tile.dataset["row"] = row;
                tile.dataset["column"] = col;
                tile.classList.add("tile");
                if (board[row][col]){
                    if(board[row][col].isHit){
                        tile.classList.add("damaged");
                    } else {
                        if (player.isTurn){
                            tile.classList.add("ship");
                        } else {
                            tile.classList.add("unknown");
                        }
                    }
                } else if (board[row][col] === false){
                    tile.classList.add("empty");
                } else {
                    tile.classList.add("unknown");
                }
            }
        }
    }

    const renderBoards = (playerOne, playerTwo) => {
        const boardOne = this.playerOneElement.querySelector(".game-board");
        const boardTwo = this.playerTwoElement.querySelector(".game-board");
        console.log(boardOne);
        renderBoard(boardOne, playerOne);
        renderBoard(boardTwo, playerTwo);
    }

    const renderDocks = (playerOne, playerTwo, ships) => {
        let dock;
        if(playerOne.isTurn){
            dock = this.playerOneElement.querySelector(".ship-dock");
        } else {
            dock = this.playerTwoElement.querySelector(".ship-dock");
        }
        dock.textContent = ships;
    }

    const addAttackListeners = (playerOne, playerTwo, callback) => {
        let board;
        if(playerOne.isTurn){
            board = this.playerTwoElement.querySelector(".game-board");
            board.querySelectorAll(".tile.unknown").forEach(tile => {
                tile.addEventListener("onclick", (event) => {
                    callback(playerOne, playerTwo, event);
                })
            })
        } else {
            board = this.playerOneElement.querySelector(".game-board");
            board.querySelectorAll(".tile.unknown").forEach(tile => {
                tile.addEventListener("onclick", (event) => {
                    callback(playerOne, playerTwo, event);
                })
            })
        }
    }

    return {
        showPlayerCreation,
        readPlayerInput,
        clearBoard,
        renderBoard,
        renderBoards,
        renderDocks,
        addAttackListeners,
   };
})();

module.exports = DOMControls;