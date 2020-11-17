class Player {
    constructor(isCPU, name) {
        this.name = name;
        this.isTurn = null;
        this.isCPU = isCPU || false; // Defaults to false (human)
        this.playHistory = new Array();
        this.gameboard = null;
    }

    setGameboard(board){
        this.gameboard = board;
    }

    randomizeShips(unplacedShips){
        while(unplacedShips.length != 0){
            try {
                let r = Math.floor(Math.random() * this.gameboard.height);
                let c = Math.floor(Math.random() * this.gameboard.width);
                let horizontal = Math.random() > 0.5;
                this.gameboard.placeShip(r, c, unplacedShips[0], horizontal);
                unplacedShips.shift();
            } catch (e) {
                console.log("Random ship placement failed");
                continue;
            }
        }
    }

    setTurn(isTurn){
        this.isTurn = isTurn;
    }

    toggleTurn(){
        this.isTurn = !this.isTurn;
    }

    randomAttack(gameboard){
        // Use this.gameboard for width and height because a player's
        // board will be the same size as the opponent's.
        let row = Math.floor(Math.random() * gameboard.height);
        let column = Math.floor(Math.random() * gameboard.width);
        while (this.playHistory.includes([row, column].join(""))){
            row = Math.floor(Math.random() * gameboard.height);
            column = Math.floor(Math.random() * gameboard.width);
        }

        return [row, column];
    }

    sendAttack(row, column, targetBoard){
        this.playHistory.push([row, column].join(""));
        return targetBoard.receiveAttack(row, column);
    }
}

module.exports = Player;
