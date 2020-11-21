const DOMControls = (() => {

    this.startMenu = document.querySelector("#start-menu");
    this.inGame = document.querySelector("#in-game");
    this.gameOver = document.querySelector("#game-over");
    this.playerOneElement = document.querySelector("#player-one");
    this.playerTwoElement = document.querySelector("#player-two");
    //this.tileHeight = document.documentElement.clientHeight / 20;

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

    const clearContainer = (container) => {
        while(container.hasChildNodes()){
            container.removeChild(container.firstChild);
        }
    }

    const setBoardGrid = (boardElement, playerBoard) => {
        boardElement.style.gridTemplateRows = `repeat(${playerBoard.height}, 1fr)`;
        boardElement.style.gridTemplateColumns = `repeat(${playerBoard.width}, 1fr)`;
    }

    // Using version above instead
    // const setBoardGrid = (numRows, numColumns) => {
    //     document.querySelectorAll(".game-board").forEach(board => {
    //         board.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
    //         board.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
    //     })
    // }

    const renderBoard = (boardElement, player) => {
        //clearContainer(boardElement);
        setBoardGrid(boardElement, player.gameboard);
        this.tileSize = document.documentElement.clientHeight / 18;
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
                tile.style.width = this.tileSize + "px";
                tile.style.height = this.tileSize + "px";
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
        // I have to remove and create new game boards because I was stacking drag and drop
        // event listeners on the same boards multiple times.
        // This is not a pleasant way to do this, but I'm not really concerned right now.
        let boardOne = this.playerOneElement.querySelector(".game-board");
        let boardTwo = this.playerTwoElement.querySelector(".game-board");
        this.playerOneElement.removeChild(boardOne);
        this.playerTwoElement.removeChild(boardTwo);

        boardOne = document.createElement('div');
        boardTwo = document.createElement('div');
        
        boardOne.classList.add("game-board");
        boardTwo.classList.add("game-board");

        this.playerOneElement.insertBefore(boardOne, this.playerOneElement.querySelector(".ship-dock"));
        this.playerTwoElement.insertBefore(boardTwo, this.playerTwoElement.querySelector(".ship-dock"));

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
        ship.style[shortSide] = this.tileSize + "px";
        ship.style[longSide] = (this.tileSize * parseInt(ship.dataset["size"])) + "px";
    }

    const renderShips = (playerOne, playerTwo, container) => {
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
            shipElement.draggable = true;
            shipElement.dataset["size"] = ships[i];
            shipElement.dataset["horizontal"] = false;
            shipElement.classList.add("placeable-ship");
            shipElement.style.height = this.tileSize * ships[i] + 'px';
            shipElement.style.width = this.tileSize + 'px';
            shipElement.addEventListener("click", event => {
                rotateShip(event);
            });
            shipElement.addEventListener("drag", event  => {});
            shipElement.addEventListener("dragstart", event => {
                draggedShip = event.target;
            })
            //shipElement.addEventListener("ondrag");
            container.appendChild(shipElement);
        }
    }

    const renderDocks = (playerOne, playerTwo, resetCB, randomizeCB, readyCB) => {
        let dock, ships;
        if(playerOne.isTurn){
            ships = playerOne.unplacedShips;
            grid = this.playerOneElement.querySelector(".game-board");
            dock = this.playerOneElement.querySelector(".ship-dock");
            this.playerTwoElement.querySelector(".ship-dock").classList.add("idle");
        } else {
            ships = playerTwo.unplacedShips;
            grid = this.playerTwoElement.querySelector(".game-board");
            dock = this.playerTwoElement.querySelector(".ship-dock");
            this.playerOneElement.querySelector(".ship-dock").classList.add("idle");
        }
        dock.classList.remove("idle");
        container = dock.querySelector(".ship-container");
        // I realized that I kept adding callbacks to these buttons, so now I create new buttons
        // every time
        buttonContainer = dock.querySelector(".ship-placement-controls");
        clearContainer(buttonContainer);
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset"
        resetButton.classList.add("reset-ships");
        resetButton.type = "button"
        const randomizeButton = document.createElement("button");
        randomizeButton.textContent = "Randomize";
        randomizeButton.classList.add("randomize-ships");
        randomizeButton.type = "button"
        const readyButton = document.createElement("button");
        readyButton.textContent = "Ready";
        readyButton.classList.add("ready-up");
        readyButton.type = "button"

        resetButton.addEventListener("click", (event) => {
            resetCB(playerOne, playerTwo);
        })
        randomizeButton.addEventListener("click", (event) => {
            randomizeCB(playerOne, playerTwo, ships);
        })
        readyButton.addEventListener("click", (event) => {
            readyCB(playerOne, playerTwo);
        })

        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(randomizeButton);
        buttonContainer.appendChild(readyButton);


        clearContainer(container);
        renderShips(playerOne, playerTwo, container);
    }

    const addShipPlacementListeners = (playerOne, playerTwo, callback) => {
        let gridElement, grid;
        if(playerOne.isTurn){
            gridElement = this.playerOneElement.querySelector(".game-board");
            grid = playerOne.gameboard;
        } else {
            gridElement = this.playerTwoElement.querySelector(".game-board");
            grid = playerTwo.gameboard;
        }
        gridElement.addEventListener("dragover", event => event.preventDefault());
        gridElement.addEventListener("dragenter", event => {
            if(!event.target.classList.contains("tile")){
                return;
            }
            const shipSize = draggedShip.dataset["size"];
            const horizontal = draggedShip.dataset["horizontal"] == "true";
            const targetTile = event.target;
            const row = parseInt(targetTile.dataset["row"]);
            const column = parseInt(targetTile.dataset["column"]);
            const coordArray = [];
            for(let offset = 0; offset < shipSize; offset++){
                if(horizontal){
                    coordArray.push([row, column + offset]);
                } else {
                    coordArray.push([row + offset, column]);
                }
            }
            if(coordArray.some(coordinates => !grid.validateCoordinates(...coordinates))){
                targetTile.classList.add("invalid-ship-placement");
            } else {
                targetTile.classList.add("valid-ship-placement");
            }
        });
        gridElement.addEventListener("dragleave", event => {
            event.target.classList.remove("invalid-ship-placement");
            event.target.classList.remove("valid-ship-placement");
        });

        gridElement.addEventListener("drop", event => {
            if(event.target.classList.contains("valid-ship-placement")){
                const row = parseInt(event.target.dataset["row"]);
                const column = parseInt(event.target.dataset["column"]);
                const shipSize = parseInt(draggedShip.dataset["size"]);
                const horizontal = draggedShip.dataset["horizontal"] == "true";
                callback(playerOne, playerTwo, row, column, shipSize, horizontal);
            }
        });

        // gridElement.querySelectorAll(".tile.unknown").forEach(tile => {
        //     tile.addEventListener("dragover", event => event.preventDefault());
        //     tile.addEventListener("dragenter", event => {
        //         event.target.style.backgroundColor = "#ffffff";
        //     });
        // })
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

    const displayInstructions = (instructions) => {
        document.querySelector("#instructions").textContent = instructions;
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
        clearContainer,
        setBoardGrid,
        renderBoard,
        renderBoards,
        renderDocks,
        addShipPlacementListeners,
        addAttackListeners,
        displayInstructions,
        displayWinner,
   };
})();

module.exports = DOMControls;