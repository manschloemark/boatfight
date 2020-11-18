import "./styles.css";
const ShipFactory = require("./ships");
const GameBoardFactory = require("./board");
const Player = require("./player");

const DOMControls = require("./domcontrols");

const ShipArray = [2, 3, 3, 4, 5];

function toggleTurns(playerOne, playerTwo){
    playerOne.toggleTurn();
    playerTwo.setTurn(playerOne.isTurn);
}

function executeTurn(playerOne, playerTwo, event){
    let attacker, board;
    if(playerOne.isTurn){
        attacker = playerOne;
        board = playerTwo.gameboard;
    } else {
        attacker = playerTwo;
        board = playerOne.gameboard;
    }

    let row, column;
    if(attacker.isCPU){
        [row, column] = attacker.randomAttack();
    } else {
        row = event.target.dataset["row"];
        column = event.target.dataset["column"];
    }
    const attackHit = attacker.sendAttack(row, column, board);

    if(attackHit){
        //Don't swap turns
    } else {
        //Swap turns
        toggleTurns(playerOne, playerTwo);
    }
    setupTurn(playerOne, playerTwo);

}

function startPlayerCreation(){
    DOMControls.showStartMenu();
}

function startNewGame(){
    const [playerOneData, playerTwoData] = DOMControls.readPlayerInput();
    const playerOne = new Player(...playerOneData);
    const playerTwo = new Player(...playerTwoData);

    const boardOne = GameBoardFactory(10, 10);
    const boardTwo = GameBoardFactory(10, 10);

    playerOne.setGameboard(boardOne);
    playerTwo.setGameboard(boardTwo);

    playerOne.setTurn((Math.random() > 0.5));
    playerTwo.setTurn(! playerOne.isTurn);

    DOMControls.showGameUI();
    shipPlacementTurn(playerOne, playerTwo);
}

function randomShipPlacement(playerOne, playerTwo, ships){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    activePlayer.randomizeShips(ships);
}

function shipPlacementTurn(playerOne, playerTwo){
    DOMControls.renderBoards(playerOne, playerTwo);
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    if(activePlayer.ready){
        // If this function is called and the player who's turn it is has already
        // ready up'd, ship placement is now complete.
        setupTurn(playerOne, playerTwo);
    } else {
        const ships = ShipArray.slice(0);
        if(activePlayer.isCPU){
            randomShipPlacement(playerOne, playerTwo, ships);
            activePlayer.setReady(true);
            finishShipPlacement(playerOne, playerTwo, ships);
        } else {
            randomShipPlacement(playerOne, playerTwo, ships);
            // Human can manually or choose to randomize ships
            //DOMControls.renderDocks(playerOne, playerTwo, playerOneShips, playerTwoShips);
            // In either case, the DOM should be updated to give the player a UI
            // so they can choose.
            // A callback will need to be passed somewhere that can handle either case.
            // randomShipPlacement will be passed to the 'randomize ships' button
            // finishShipPlacement will be passed as the callback to "Ready" when a human
            // is placing ships, so they can randomize ship placements without automatically
            // accepting it.
            activePlayer.setReady(true);
            finishShipPlacement(playerOne, playerTwo, ships);
        }
        
    }
}

function finishShipPlacement(playerOne, playerTwo, ships){
    if(ships.length == 0){
        toggleTurns(playerOne, playerTwo);
        shipPlacementTurn(playerOne, playerTwo);
    }
}

function setupTurn(playerOne, playerTwo){
    DOMControls.renderBoards(playerOne, playerTwo);
    DOMControls.addAttackListeners(playerOne, playerTwo, executeTurn);
}

// Add event listeners for the game
document.querySelector("#new-game").addEventListener("click", startNewGame);

// Make sure the page loads to the player creation screen at first
startPlayerCreation();