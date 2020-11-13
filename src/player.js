class Player {
    constructor(isCPU) {
        this.currentTurn = null;
        this.isCPU = isCPU || false; // Defaults to false (human)
        this.playHistory = new Array();
        this.gameboard = null;
    }

    setGameboard(board){
        this.gameboard = board;
    }

    randomizeShips(){
        while(this.unplacedShips.length > 0){
            try {
                let r = Math.floor(Math.random(this.gameboard.height));
                let c = Math.floor(Math.random(this.gameboard.width));
                let horizontal = Math.random() > 0.5;
                this.gameboard.placeShip(r, c, this.unplacedShips[0], horizontal);
            } catch (e) {
                console.log("Error randomly placing ship, continuing...", e);
                continue;
            }
        }
    }

    // Not sure if I need this...
    setTurn(isTurn){
        this.currentTurn = isTurn;
    }

    randomAttack(){
        // Use this.gameboard for width and height because a player's
        // board will be the same size as the opponent's.
        let row = Math.floor(Math.random() * this.gameboard.height);
        let column = Math.floor(Math.random() * this.gameboard.width);
        while (this.playHistory.includes([row, column])){
            row = Math.floor(Math.random() * this.gameboard.height);
            column = Math.floow(Math.random() * this.gameboard.width);
        }

        this.sendAttack(row, column);
    }

    sendAttack(row, column){
        this.playHistory.push([row, column]);
        return [row, column];
    }
}

module.exports = Player;
