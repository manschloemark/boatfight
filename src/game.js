import "./styles.css";
const ShipFactory = require("./ships");
const GameBoardFactory = require("./board");
const Player = require("./player");

const DOMControls = require("./domcontrols");

const ShipArray = [2, 3, 3, 4, 5];

function toggleTurns(playerOne, playerTwo){
    playerOne.toggleTurn();
    playerTwo.setTurn(! playerOne.isTurn);
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
    let attackHit;
    if(attacker.isCPU){
        attackHit = attacker.cpuAttack(board);
    } else {
        let row = event.target.dataset["row"];
        let column = event.target.dataset["column"];
        attackHit = attacker.sendAttack(row, column, board);
    }
    

    if(!attackHit){
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

    // Maybe make the board size an option?
    // Instead of setting this at the start I set it each time the board is rendered.
    //DOMControls.setBoardGrid(10, 10);

    playerOne.setGameboard(boardOne);
    playerTwo.setGameboard(boardTwo);

    playerOne.setShipArray(ShipArray.slice(0));
    playerTwo.setShipArray(ShipArray.slice(0));

    playerOne.setTurn((Math.random() > 0.5));
    playerTwo.setTurn(! playerOne.isTurn);

    if(playerOne.isCPU){
        playerOne.enemyShipsRemaining = ShipArray.slice(0);
    }
    if(playerTwo.isCPU){
        playerTwo.enemyShipsRemaining = ShipArray.slice(0);
    }

    DOMControls.showGameUI();
    shipPlacementTurn(playerOne, playerTwo);
}

function resetShips(playerOne, playerTwo){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    activePlayer.clearBoard();
    shipPlacementTurn(playerOne, playerTwo);
}

function cpuShipPlacement(playerOne, playerTwo){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    activePlayer.randomizeShips();
    finishShipPlacement(playerOne, playerTwo);
}

function manualShipPlacement(playerOne, playerTwo, row, column, shipSize, horizontal) {
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    try{
        activePlayer.positionShip(row, column, shipSize, horizontal);
    } catch (e) {
        if(e.name != "RangeError" || e.name != "ShipError"){
            throw e;
        }
    }
    shipPlacementTurn(playerOne, playerTwo);
}

function randomShipPlacement(playerOne, playerTwo){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    activePlayer.randomizeShips();
    shipPlacementTurn(playerOne, playerTwo);
}

function shipPlacementTurn(playerOne, playerTwo){
    if(playerOne.isReady && playerTwo.isReady){
        setupTurn(playerOne, playerTwo);
    } else {
        let activePlayer;
        if(playerOne.isTurn){
            activePlayer = playerOne;
        } else {
            activePlayer = playerTwo;
        }
        if(activePlayer.isCPU){
            cpuShipPlacement(playerOne, playerTwo);
        } else {
            // Human can manually or choose to randomize ships
            DOMControls.displayInstructions(`${activePlayer.name} is placing ships...`);
            setupShipPlacementUI(playerOne, playerTwo);    
            // In either case, the DOM should be updated to give the player a UI
            // so they can choose.
            // A callback will need to be passed somewhere that can handle either case.
            // randomShipPlacement will be passed to the 'randomize ships' button
            // finishShipPlacement will be passed as the callback to "Ready" when a human
            // is placing ships, so they can randomize ship placements without automatically
            // accepting it.
        }
    }
}

function setupShipPlacementUI(playerOne, playerTwo){
    DOMControls.renderBoards(playerOne, playerTwo);
    DOMControls.renderDocks(playerOne, playerTwo, resetShips, randomShipPlacement, finishShipPlacement);
    if(!((playerOne.isTurn && playerOne.getUnplacedShips().length == 0) || (playerTwo.isTurn && playerTwo.getUnplacedShips().length == 0))){
        DOMControls.addShipPlacementListeners(playerOne, playerTwo, manualShipPlacement);
    }
}

function finishShipPlacement(playerOne, playerTwo){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    if(activePlayer.unplacedShips.length == 0){
        activePlayer.setReady(true);
        toggleTurns(playerOne, playerTwo);
        shipPlacementTurn(playerOne, playerTwo);
    }
}

function setupTurn(playerOne, playerTwo){
    if(playerOne.gameboard.allShipsSunk()){
        gameOver(playerOne, playerTwo, false);
     } else if (playerTwo.gameboard.allShipsSunk()){
         gameOver(playerOne, playerTwo, true)
     } else {
        if((playerOne.isTurn && playerOne.isCPU) || (playerTwo.isTurn && playerTwo.isCPU)){
            // If both players are CPU, it's assumed that the human wants to watch
            // the CPU's 'simulate' a game, so the boards are drawn and the CPU's take
            // a half a second to attack.
            // In a human vs CPU battle, I assume the player doesn't care to
            // watch the CPU attack, and the board is not rendered for CPU turns.
            // if(playerOne.isCPU && playerTwo.isCPU){
            //     DOMControls.renderBoards(playerOne, playerTwo);
            //     setTimeout(() => {
            //         executeTurn(playerOne, playerTwo)
            //     }, 500);
            // } else {
            //     executeTurn(playerOne, playerTwo);
            // }
            executeTurn(playerOne, playerTwo);
        } else {
            let name;
            if(playerOne.isTurn){
                name = playerOne.name;
            } else {
                name = playerTwo.name;
            }
            DOMControls.displayInstructions(`${name} is attacking`);
            DOMControls.renderBoards(playerOne, playerTwo);
            DOMControls.addAttackListeners(playerOne, playerTwo, executeTurn);
        }
    }
}

// the parameter 'playerOneWins' is only used so I can a) keep the order of players
// consistent in gameOver's arguments without needing to call allShipsSunk again.
// So I can just check playerOneWins to determine what to do in here.
function gameOver(playerOne, playerTwo, playerOneWins){
    // Set both players isTurn to true so the renderBoards method displays all info.
    // There's no need to hide the idle players ships since the game is over.
    // There's probably a more elegant way to address this, but for now this is quick
    // and easy.
    playerOne.setTurn(true);
    playerTwo.setTurn(true);
    DOMControls.renderBoards(playerOne, playerTwo);
    if(playerOneWins){
        DOMControls.displayWinner(playerOne, playerTwo);
    } else {
        DOMControls.displayWinner(playerTwo, playerOne);
    }
    DOMControls.showGameOver();
}
// Add event listeners for the game
document.querySelector("#new-game").addEventListener("click", startNewGame);
document.querySelector("#rematch").addEventListener("click", startNewGame);
document.querySelector("#change-players").addEventListener("click", startPlayerCreation);

// Make sure the page loads to the player creation screen at first
startPlayerCreation();