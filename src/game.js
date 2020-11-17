import "./styles.css";
const ShipFactory = require("./ships");
const GameBoardFactory = require("./board");
const Player = require("./player");

const DOMControls = require("./domcontrols");

function initializeMatch(event) {
    const players = DOMControls.getPlayerInputs()
                                .map(playerInfo => new Player(...playerInfo));

    players.forEach(player => player.setGameboard(GameBoardFactory(10, 10)));
    initShipPlacement(...players);
}

function initShipPlacement(playerOne, playerTwo){
    
}

// There must be a better way to do this. But for now this is okay.
const executeTurn = (activePlayer, inactivePlayer, event) => {
    if(!activePlayer.isTurn){
        return;
    }
    console.log("Shooting...");
    let row;
    let column;
    let shotHit;
    if(activePlayer.isCPU){
        [row, column] = activePlayer.randomAttack(inactivePlayer.gameboard);
    } else {
        row = event.target.dataset["row"];
        column = event.target.dataset["column"];
    }
    shotHit = activePlayer.sendAttack(row, column, inactivePlayer.gameboard);
    //DOMControls.revealTile(row, column, inactivePlayer.gameboard);
    // If the attack hits, 
    if(!shotHit){
        activePlayer.toggleTurn();
        inactivePlayer.toggleTurn();
    } else if(activePlayer.isCPU){
        executeTurn(activePlayer, inactivePlayer);
    }
    DOMControls.refresh(executeTurn);
}

DOMControls.init();


// Set up event listeners
document.querySelector("#new-game").addEventListener("click", initializeMatch)