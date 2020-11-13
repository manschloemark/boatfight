const DOMControls = (() => {
    const turnIndicator = document.querySelector("#turn-indicator");


    // SO now I have two nearly identical functions. I'll fix this later.
    const initBoard = (player) => {
        const active = player.isTurn;
        const gameboard = player.gameboard;
        if(active){
            var boardElement = document.querySelector("#active .game-board");
        } else {
            var boardElement = document.querySelector("#inactive .game-board");
        }
        boardElement.style.gridTemplateRows = `repeat(${gameboard.height}, 10%)`;
        boardElement.style.gridTemplateColumns = `repeat(${gameboard.width}, 10%)`;
        console.log(boardElement);
        const board = gameboard.viewBoard();
        for(let r = 0; r < gameboard.height; r++){
            for(let c = 0; c < gameboard.width; c++){
                let tile = document.createElement("div");
                tile.classList.add(`r${r}c${c}`);
                tile.dataset["row"] = r;
                tile.dataset["column"] = c;
                tile.classList.add("tile");
                if(board[r][c] == null){
                    tile.classList.add("unknown");

                } else if (board[r][c] == false){
                    tile.classList.add("empty");
                } else {
                    let shipData = board[r][c];
                    if(active){
                        tile.classList.add("ship");
                    }
                    if(shipData.isHit){
                        tile.classList.add("damaged");
                    } else if (!active) {
                        tile.classList.add("unknown");
                    }
                }
                boardElement.appendChild(tile);
            }
        }
    };

    const updateBoard = (player) => {
        const active = player.isTurn;
        const gameboard = player.gameboard;
        let boardElement;
        let activeString;
        if(active){
            boardElement = document.querySelector("#active .game-board");
            activeString = "active";
        } else {
            boardElement = document.querySelector("#inactive .game-board");
            activeString = "inactive";
        }
        const board = gameboard.viewBoard();
        for(let r = 0; r < gameboard.height; r++){
            for(let c = 0; c < gameboard.width; c++){
                let tile = document.querySelector(`#${activeString} .game-board .r${r}c${c}`);
                tile.dataset["row"] = r;
                tile.dataset["column"] = c;
                tile.classList.add("tile");
                if(board[r][c] == null){
                    tile.classList.add("unknown");

                } else if (board[r][c] == false){
                    tile.classList.add("empty");
                } else {
                    let shipData = board[r][c];
                    if(active){
                        tile.classList.add("ship");
                    }
                    if(shipData.isHit){
                        tile.classList.add("damaged");
                    } else if (!active) {
                        tile.classList.add("unknown");
                    }
                }
                boardElement.appendChild(tile);
            }
        }
    }

    const revealTile = (row, column, gameboard) => {
        const tile = document.querySelector(`#inactive .game-board .r${row}c${column}`);
        // Quickly convert this to boolean because it can only be empty or damage
        const hit = !!gameboard.viewBoard()[row][column];

        if(hit){
            tile.classList.add("damaged");
        } else {
            tile.classList.add("empty");
        }
    }

    const displayPlayerUI = (player) => {
        if(player.isTurn){
            var shipInfo = document.querySelector("#active .ship-dock");
            shipInfo.textContent = "Your board";
        } else {
            var shipInfo = document.querySelector("#inactive .ship-dock");
            shipInfo.textContent = "Opponent board";
        }
    }

    const setupEventListeners = (activePlayer, inactivePlayer, callback) => {
        document.querySelectorAll("#inactive .game-board .unknown").forEach(element => {
            element.addEventListener("click", (event) => callback(activePlayer, inactivePlayer, event));
        });
    }

    const init = (activePlayer, inactivePlayer, callback) => {
        initBoard(activePlayer);
        initBoard(inactivePlayer);
        displayPlayerUI(activePlayer);
        displayPlayerUI(inactivePlayer);
        if(activePlayer.isCPU){
            callback(activePlayer, inactivePlayer);
        } else {
            setupEventListeners(activePlayer, inactivePlayer, callback);
        }
    };

    const display = (activePlayer, inactivePlayer, callback) => {
        if(activePlayer.gameboard.allShipsSunk() || inactivePlayer.gameboard.allShipsSunk()){
            // Update this to do stuff in the DOM
            console.log("gg");
            alert("Game over");
        } else {
            if(activePlayer.isCPU){
                callback(activePlayer, inactivePlayer);
            }
            updateBoard(activePlayer);
            updateBoard(inactivePlayer);
            displayPlayerUI(activePlayer);
            displayPlayerUI(inactivePlayer);
            setupEventListeners(activePlayer, inactivePlayer, callback);
        }
    };

    return { 
        init,
        display,
        initBoard,
        updateBoard,
        revealTile,
        displayPlayerUI,
        setupEventListeners,
    }
})();

module.exports = DOMControls;