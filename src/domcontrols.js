const DOMControls = (() => {

    this.turnSwitch = document.querySelector("#turn-switch");
    this.startMenu = document.querySelector("#start-menu");
    this.inGame = document.querySelector("#in-game");
    this.gameOver = document.querySelector("#game-over");
    this.playerOneElement = document.querySelector("#player-one");
    this.playerTwoElement = document.querySelector("#player-two");
    this.dockElement = document.querySelector("#ship-dock");
    //this.tileHeight = document.documentElement.clientHeight / 20;

    this.betweenTurns = false;

    const showStartMenu = () => {
        this.startMenu.classList.remove("hidden");
        this.inGame.classList.add("hidden");
        this.gameOver.classList.add("hidden");
        //this.turnSwitch.classList.add("hidden");
    }

    const showGameUI = () => {
        this.inGame.classList.remove("hidden");
        this.startMenu.classList.add("hidden");
        this.gameOver.classList.add("hidden");
        //this.turnSwitch.classList.add("hidden");
    }

    const showTurnSwitch = () => {
        const heightOffset = document.querySelector("header").clientHeight;
        const width = document.documentElement.clientWidth;
        let height = document.documentElement.clientHeight;
        height = height - heightOffset;
        //this.turnSwitch.style.position = "static";
        this.turnSwitch.style.top = heightOffset + "px";
        this.turnSwitch.style.left = 0;
        //this.turnSwitch.style.width = width + "px";
        this.turnSwitch.style.height = height + "px";
        // this.inGame.classList.add("hidden");
        // this.startMenu.classList.add("hidden");
        // this.gameOver.classList.add("hidden");
        this.turnSwitch.classList.add("show");
    }

    const hideTurnSwitch = () => {
        this.turnSwitch.classList.remove("show");
        //this.turnSwitch.classList.add("hidden");
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

    const switchSides = (playerOne, playerTwo, callback) => {
        this.betweenTurns = true;
        this.turnSwitch.classList.remove("hidden");
        let activeName, inactiveName;
        if(playerOne.isTurn){
            activeName = playerOne.name;
            inactiveName = playerTwo.name;
        } else {
            activeName = playerTwo.name;
            inactiveName = playerOne.name;
        }
        clearContainer(this.turnSwitch);
        const instructionP = document.createElement("p");
        instructionP.textContent = `Handing control to ${activeName}.`;
        const cheekyP = document.createElement("p");
        cheekyP.textContent = `No peeking, ${inactiveName}!`

        const button = document.createElement("button");
        button.textContent = "Ready";
        button.addEventListener("click", event => {
            this.betweenTurns = false;
            hideTurnSwitch();
            callback(playerOne, playerTwo);
        });

        this.turnSwitch.appendChild(instructionP);
        this.turnSwitch.appendChild(cheekyP);
        this.turnSwitch.appendChild(button);

        showTurnSwitch();
    }

    const renderPlayerNames = (playerOne, playerTwo) => {
        this.playerOneElement.querySelector(".name").textContent = playerOne.name;
        this.playerTwoElement.querySelector(".name").textContent = playerTwo.name;
    }

    const showPlayerElements = () => {
        this.playerOneElement.classList.remove("hidden");
        this.playerTwoElement.classList.remove("hidden");
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

            this.playerOneElement.classList.remove("idle");
            this.playerTwoElement.classList.add("idle");
        } else {
            this.playerOneElement.classList.remove("is-turn");
            this.playerTwoElement.classList.add("is-turn");

            this.playerOneElement.classList.add("idle");
            this.playerTwoElement.classList.remove("idle");
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

        this.playerOneElement.appendChild(boardOne);
        this.playerTwoElement.appendChild(boardTwo);

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

    const clearDockButtons = () => {
        clearContainer(document.querySelector("#ship-placement-controls"));
    }

    const renderDocks = (playerOne, playerTwo, resetCB, randomizeCB, readyCB) => {
        let ships;
        if(playerOne.isTurn){
            ships = playerOne.unplacedShips;
            grid = this.playerOneElement.querySelector(".game-board");
            this.playerOneElement.classList.remove("hidden");
            this.playerTwoElement.classList.add("hidden");
        } else {
            ships = playerTwo.unplacedShips;
            grid = this.playerTwoElement.querySelector(".game-board");
            this.playerTwoElement.classList.remove("hidden");
            this.playerOneElement.classList.add("hidden");
        }
        this.dockElement.classList.remove("hidden");
        let container = this.dockElement.querySelector("#ship-container");
        // I realized that I kept adding callbacks to these buttons, so now I create new buttons
        // every time
        let buttonContainer = this.dockElement.querySelector("#ship-placement-controls");
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
            if(readyCB(playerOne, playerTwo)){
            }
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
            let classString;
            if(coordArray.some(coordinates => !grid.validateCoordinates(...coordinates))){
                classString = "invalid-ship-placement";
            } else {
                classString = "valid-ship-placement";
            }
            let r, c;
            let tileElement;
            for(let i = 0; i < coordArray.length; i++){
                [r, c] = coordArray[i];
                tileElement = gridElement.querySelector(`[data-row="${r}"][data-column="${c}"]`)
                if(tileElement){
                    tileElement.classList.add(classString);
                }
            }
        });
        gridElement.addEventListener("dragexit", event => {
            gridElement.querySelectorAll(".invalid-ship-placement").forEach(tile => {
                tile.classList.remove("invalid-ship-placement");
            });
            gridElement.querySelectorAll(".valid-ship-placement").forEach(tile => {
                tile.classList.remove("valid-ship-placement");
            });
        });

        gridElement.addEventListener("drop", event => {
            event.preventDefault();
            // Note: I don't need to remove classes assigned from drag event handlers
            // ("(in)valid-ship-placement") when the ship is dropped on a valid tile
            // because that grid will be deleted and recreated anyway.
            if(event.target.classList.contains("valid-ship-placement")){
                const row = parseInt(event.target.dataset["row"]);
                const column = parseInt(event.target.dataset["column"]);
                const shipSize = parseInt(draggedShip.dataset["size"]);
                const horizontal = draggedShip.dataset["horizontal"] == "true";
                callback(playerOne, playerTwo, row, column, shipSize, horizontal);
            } else {
                gridElement.querySelectorAll(".invalid-ship-placement").forEach(tile => {
                    tile.classList.remove("invalid-ship-placement");
                })
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

    // Make the turn switch element automatically hide and unhide after the transitions
    // this.turnSwitch.addEventListener("transitionstart", event => {
    //     if(event.propertyName != "opacity"){
    //         return;
    //     }
    //     if(this.betweenTurns){
    //         event.target.classList.remove("hidden");
    //     }
    // });

    this.turnSwitch.addEventListener("transitionend", event => {
        if(event.propertyName != "opacity"){
            return;
        }
        // If this.betweenTurns is false that means the turnSwitch went from 100 opacity to 0,
        // and should be hidden so it is not read by screen readers and does not block user input
        if( ! this.betweenTurns){
            event.target.classList.add("hidden");
        }
    })

    return {
        showStartMenu,
        showGameUI,
        showTurnSwitch,
        hideTurnSwitch,
        showGameOver,
        switchSides,
        showPlayerElements,
        readPlayerInput,
        clearContainer,
        setBoardGrid,
        renderPlayerNames,
        renderBoard,
        renderBoards,
        renderDocks,
        clearDockButtons,
        addShipPlacementListeners,
        addAttackListeners,
        displayInstructions,
        displayWinner,
   };
})();

module.exports = DOMControls;