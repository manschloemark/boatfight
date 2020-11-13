import "./styles.css";
const ShipFactory = require("./ships");
const GameBoardFactory = require("./board");
const Player = require("./player");

const DOMControls = require("./domcontrols");

// There must be a better way to do this. But for now this is okay.
const executeTurn = (activePlayer, inactivePlayer, event) => {
    console.log("Shooting...");
    let result;
    let row;
    let column;
    if(activePlayer.isCPU){
        [row, column] = activePlayer.randomAttack(inactivePlayer.gameboard);
        result = activePlayer.sendAttack(row, column, inactivePlayer.gameboard);
    } else {
        row = event.target.dataset["row"];
        column = event.target.dataset["column"];

        result = activePlayer.sendAttack(row, column, inactivePlayer.gameboard);
    }
    DOMControls.revealTile(row, column, inactivePlayer.gameboard);
    // If the attack hits, 
    if(!result){
        activePlayer.toggleTurn();
        inactivePlayer.toggleTurn();
        DOMControls.display(inactivePlayer, activePlayer, executeTurn);
    }
}

const playerOneShips = [5, 4, 3, 3, 2];
const boardOne = GameBoardFactory(10, 10);
const playerOne = new Player();
playerOne.setGameboard(boardOne);

const playerTwoShips = [5, 4, 3, 3, 2];
const boardTwo = GameBoardFactory(10, 10);
const playerTwo = new Player(true);
playerTwo.setGameboard(boardTwo);

// TEMP
// Randomly set ships for both players
playerOne.randomizeShips(playerOneShips);
playerTwo.randomizeShips(playerTwoShips);
// Maybe make this random later
playerOne.setTurn(true);
playerTwo.setTurn(false);

DOMControls.init(playerOne, playerTwo, executeTurn);

