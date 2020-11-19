class Player {
    constructor(isCPU, name) {
        this.name = name;
        this.isTurn = null;
        this.isCPU = isCPU || false; // Defaults to false (human)
        this.playHistory = new Array();
        this.gameboard = null;
        this.ready = false;

        if(this.isCPU){
            //this.enemyShips = ShipArray.slice(0)
            this.lastHit = {
                coords: null,
                //direction: null
            }
        }
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

    setReady(ready){
        this.ready = ready;
    }

    setTurn(isTurn){
        this.isTurn = isTurn;
    }

    toggleTurn(){
        this.isTurn = !this.isTurn;
    }

    randomAttack(gameboard){
        let row, column;
        if(this.lastHit.coords){
            [row, column] = this.lastHit.coords;
            if(!(row == 0 || this.playHistory.includes([row - 1, column].join("")))){
                row -= 1;
            } else if(!(row + 1 == gameboard.height || this.playHistory.includes([row + 1, column].join("")))){
                row += 1
            } else if(!(column == 0 || this.playHistory.includes([row, column - 1].join("")))){
                column -= 1;
            } else if(!(column + 1 == gameboard.height || this.playHistory.includes([row, column + 1].join("")))){
                column += 1;
            } else {
            // For now, if you make it through the 4 previous checks without
            // hitting something, just move on.
                this.lastHit.coords = null;
                row = Math.floor(Math.random() * gameboard.height);
                column = Math.floor(Math.random() * gameboard.width);
            }
        } else {
            row = Math.floor(Math.random() * gameboard.height);
            column = Math.floor(Math.random() * gameboard.width);
        }
        while (this.playHistory.includes([row, column].join(""))){
            row = Math.floor(Math.random() * gameboard.height);
            column = Math.floor(Math.random() * gameboard.width);
        }
        const hit =  this.sendAttack(row, column, gameboard);
        if(hit){
            this.lastHit.coords = [row, column];
        }

        return hit;
    }

    sendAttack(row, column, targetBoard){
        this.playHistory.push([row, column].join(""));
        return targetBoard.receiveAttack(row, column);
    }
}

module.exports = Player;
