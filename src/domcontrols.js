const DOMControls = (() => {

    this.startMenu = document.querySelector("#start-menu");
    this.inGame = document.querySelector("#in-game");
    this.gameOver = document.querySelector("#game-over");
    this.playerOneElement = document.querySelector("#player-one");
    this.playerTwoElement = document.querySelector("#player-two");
    this.tileHeight = document.documentElement.clientHeight;
    
    const showStartMenu = () => {
        this.startMenu.classList.remove("hidden");
        this.inGame.classList.add("hidden");
        this.gameOver.classList.add("hidden");
    }

    const showGameUI = () => {
        this.inGame.classList.remove("hidden");
        this.startMenu.classList.add("hidden");
        this.gameOver.classList.add("hidden");
    }

    const showGameOver = () => {
        this.gameOver.classList.remove("hidden");
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
            board.removeChild(board.firstChild);
        }
    }

    const setBoardGrid = (numRows, numColumns) => {
        document.querySelectorAll(".game-board").forEach(board => {
            board.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
            board.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
        })
    }

    const renderBoard = (boardElement, player) => {
        clearBoard(boardElement);
        this.tileSize = document.documentElement.clientHeight / 10;
        if(player.isTurn){
            document.querySelector("#who-attacks").textContent = player.name + " is attacking";
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
                            // Ugly but gets the job done.
                            // Adds classes to damaged ships that tell where in the grid the other
                            // parts of the ship are located so I can style them differently.
                            // I suppose this wouldn't be necessary if gave GameBoard objects
                            // attributes that make it easier to tell where the rest of a ship is
                            // located.
                            try{
                                if((board[row-1][col] && player.isTurn) || board[row-1][col].isHit){
                                    tile.classList.add("up-one");
                                }
                            } catch (e) {}
                            try{
                                if((board[row+1][col] && player.isTurn) || board[row+1][col].isHit){
                                    tile.classList.add("down-one")
                                }
                            } catch (e) {}
                            try{
                                if((board[row][col+1] && player.isTurn) || board[row][col+1].isHit){
                                    tile.classList.add("right-one");
                                }
                            } catch (e) {}
                            try{
                                if((board[row][col-1] && player.isTurn) || board[row][col-1].isHit){
                                    tile.classList.add("left-one");
                                }
                            } catch (e) {}
                    } else {
                        if (player.isTurn){
                            tile.classList.add("ship");
                            // Ugly! But gets the job done, for now.
                            try{
                                if(board[row-1][col]){
                                    tile.classList.add("up-one");
                                }
                            } catch (e) {}
                            try{
                                if(board[row+1][col]){
                                    tile.classList.add("down-one")
                                }
                            } catch (e) {}
                            try{
                                if(board[row][col+1]){
                                    tile.classList.add("right-one");
                                }
                            } catch (e) {}
                            try{
                                if(board[row][col-1]){
                                    tile.classList.add("left-one");
                                }
                            } catch (e) {}
                        } else {
                            tile.classList.add("unknown");
                        }
                    }
                } else if (board[row][col] === false){
                    tile.classList.add("empty");
                } else {
                    tile.classList.add("unknown");
                }
                boardElement.appendChild(tile);
            }
        }
    }

    const renderBoards = (playerOne, playerTwo) => {
        if(playerOne.isTurn){
            this.playerOneElement.classList.add("is-turn");
            this.playerTwoElement.classList.remove("is-turn");
        } else {
            this.playerOneElement.classList.remove("is-turn");
            this.playerTwoElement.classList.add("is-turn");
        }
        const boardOne = this.playerOneElement.querySelector(".game-board");
        const boardTwo = this.playerTwoElement.querySelector(".game-board");
        renderBoard(boardOne, playerOne);
        renderBoard(boardTwo, playerTwo);
    }

    const rotateShip = (event) => {
        const ship = event.target;

        const horizontal = ship.dataset["horizontal"] == "true";
        ship.dataset["horizontal"] = ! horizontal;
        if(ship.dataset["horizontal"] == "true"){
            shortSide = "height";
            longSide = "width";
        } else {
            shortSide = "width";
            longSide = "height";
        }
        ship.style[shortSide] = "10em";
        ship.style[longSide] = (10 * parseInt(ship.dataset["size"])) + "em";
    }

    const renderShips = (playerOne, playerTwo, container, callback) => {
        let activePlayer;
        if(playerOne.isTurn){
            activePlayer = playerOne;
        } else {
            activePlayer = playerTwo;
        }

        // Draw ships in the dock
        // Add callbacks to the ships
        // I just realized how effed this is gonna be with my current grid implementation.
        const ships = activePlayer.getUnplacedShips();
        for(let i = 0; i < ships.length; i++){
            let shipElement = document.createElement("div");
            shipElement.dataset["size"] = ships[i];
            shipElement.dataset["horizontal"] = false;
            shipElement.classList.add("placeable-ship");
            shipElement.style.height = 1 * ships[i] + 'em';
            shipElement.style.width = '1em';
            shipElement.addEventListener("click", event => {
                rotateShip(event);
            });
            shipElement.addEventListener("drag", event  => {});
            //shipElement.addEventListener("ondrag");
            container.appendChild(shipElement);
        }
    }

    const renderDocks = (playerOne, playerTwo, dragNDropCB, resetCB, randomizeCB, readyCB) => {
        let dock, ships;
        if(playerOne.isTurn){
            ships = playerOne.unplacedShips;
            dock = this.playerOneElement.querySelector(".ship-dock");
            this.playerTwoElement.querySelector(".ship-dock").classList.add("idle");
        } else {
            ships = playerTwo.unplacedShips;
            dock = this.playerTwoElement.querySelector(".ship-dock");
            this.playerOneElement.querySelector(".ship-dock").classList.add("idle");
        }
        dock.classList.remove("hidden");
        container = dock.querySelector(".ship-container");

        dock.querySelector(".reset-ships").addEventListener("click", (event) => {
            resetCB(playerOne, playerTwo);
        })
        dock.querySelector(".randomize-ships").addEventListener("click", (event) => {
            randomizeCB(playerOne, playerTwo, ships);
        })
        dock.querySelector(".ready-up").addEventListener("click", (event) => {
            readyCB(playerOne, playerTwo);
        })
        // Instead of text content I'll have to make DOM elements for each ship in the array.
        // These elements should be able to be dragged on the player's board and dropped in place.
        renderShips(playerOne, playerTwo, container, dragNDropCB);
        //container.textContent = ships;
    }

    const addAttackListeners = (playerOne, playerTwo, callback) => {
        let board;
        if(playerOne.isTurn){
            board = this.playerTwoElement.querySelector(".game-board");
            board.querySelectorAll(".tile.unknown").forEach(tile => {
                tile.addEventListener("click", (event) => {
                    callback(playerOne, playerTwo, event);
                })
            })
        } else {
            board = this.playerOneElement.querySelector(".game-board");
            board.querySelectorAll(".tile.unknown").forEach(tile => {
                tile.addEventListener("click", (event) => {
                    callback(playerOne, playerTwo, event);
                })
            })
        }
    }

    const displayWinner = (winner, loser) => {
        this.gameOver.querySelector("#winner").textContent = winner.name + " wins!";
        this.gameOver.querySelector("#loser").textContent = "Sorry, " + loser.name + "...";
        this.gameOver.querySelector("#winner-stats").textContent = `${winner.name} fired ${winner.playHistory.length} shots`;
        this.gameOver.querySelector("#loser-stats").textContent = `${loser.name} fired ${loser.playHistory.length} shots`;
    }

    return {
        showStartMenu,
        showGameUI,
        showGameOver,
        readPlayerInput,
        clearBoard,
        setBoardGrid,
        renderBoard,
        renderBoards,
        renderDocks,
        addAttackListeners,
        displayWinner,
   };
})();

module.exports = DOMControls;