class Player {
    constructor(isCPU, name) {
        this.name = name;
        this.isTurn = null;
        this.isCPU = isCPU || false; // Defaults to false (human)
        this.playHistory = new Array();
        this.gameboard = null;
        this.isReady = false;
        this.unplacedShips = new Array();

        if(this.isCPU){
            //this.enemyShips = ShipArray.slice(0)
            this.lastHit = {
                coords: null,
                horizontal: null,
                backtracked: false,
            }
            this.enemyShipsRemaining = [5, 4, 3, 3, 2]; // Ugly to hard-code this
        }
    }

    setGameboard(board){
        this.gameboard = board;
    }

    getUnplacedShips(){
        return this.unplacedShips.slice(0);
    }

    setShipArray(ships){
        this.unplacedShips = ships;
    }

    addShips(ships){
        const newShipArray = this.getUnplacedShips().concat(ships)
        this.setShipArray(newShipArray);
    }

    positionShip(row, column, shipSize, horizontal){
        try{
            let shipIndex = this.unplacedShips.indexOf(shipSize);
            if(shipIndex == -1){
                let shipError = new Error("Player does not have ship of size " + shipSize);
                shipError.name = "ShipError";
                throw shipError;
            }
            this.gameboard.placeShip(row, column, this.unplacedShips[shipIndex], horizontal);
            this.unplacedShips.splice(shipIndex, 1);
        } catch (e) {
            throw e;
        }
    }

    randomizeShips(){
        while(this.unplacedShips.length != 0){
            try {
                let r = Math.floor(Math.random() * this.gameboard.height);
                let c = Math.floor(Math.random() * this.gameboard.width);
                let horizontal = Math.random() > 0.5;
                this.positionShip(r, c, this.unplacedShips[0], horizontal);
            } catch (e) {
                continue;
            }
        }
    }

    clearBoard(){
        this.addShips(this.gameboard.removeShips());
    }

    setReady(ready){
        this.isReady = ready;
    }

    setTurn(isTurn){
        this.isTurn = isTurn;
    }

    toggleTurn(){
        this.isTurn = !this.isTurn;
    }

    // This function ended up being uglier than I anticipated.
    // It can for sure be split up into two functions - getSmartCoords and getRandomCoords
    // If this.lastHit.coords != null, try to get coordinates from getSmartCoords.
    // getSmartCoords can generate coords based around this.lastHit.coords, but if all surrounding tiles are invalid,
    // return null.

    // If this.lastHit.coords is null OR the value returned by getSmartCoords is null, use getRandomCoords instead.
    // getRandomCoords will be the same as randomAttack but will return [row, column] instead of attacking the gameboard

    // cpuAttack will the call sendAttack with the given coordinates and will handle this.lastHit.coords and such
    // Though now that I think about it, how would I handle the horizontal flag? cpuAttack will not know if
    // coords returned from getSmartCoords are up down left or right without doing extra calculations.
    // And getSmartCoords will not know if the attack hits, so it shouldn't set the horizontal flag.

    // One solution is indeed setting the horizontal flag in getSmartCoords, and then having cpuAttack change it to
    // null if the attack missed, but leaving it alone if it is a hit. That would work, but it feels weird and can't be
    // a good idea.
    cpuAttack(gameboard){
        let row, column;
        let attackHit = null;
        if(this.lastHit.coords != null){
            if(this.enemyShipsRemaining[0] == this.lastHit.coords.length){
                this.enemyShipsRemaining.shift();
            } else {
                [row, column] = this.lastHit.coords[0].split(' ');
                row = parseInt(row);
                column = parseInt(column);
                if(this.lastHit.horizontal || this.lastHit.horizontal === null){
                    // Try attacking the left if you haven't already
                    if(!(column == 0 || this.playHistory.includes([row, column - 1].join("")))){
                        attackHit = this.sendAttack(row, column - 1, gameboard);
                        if(attackHit){
                            this.lastHit.coords.unshift([row, column - 1].join(' '));
                            this.lastHit.horizontal = true;
                        }
                    // otherwise try attacking to the right if you haven't already
                    } else if(!(column + 1 == gameboard.height || this.playHistory.includes([row, column + 1].join("")))){
                        attackHit = this.sendAttack(row, column + 1, gameboard);
                        if(attackHit){
                            this.lastHit.coords.unshift([row, column + 1].join(' '));
                            this.lastHit.horizontal = true;
                        }
                    } else if(this.lastHit.horizontal && this.lastHit.backtracked === false){
                        // This branch handles the event where you KNOW the current ship is horizontal
                        // and you have reached a dead end.
                        // Here backTrackColumn is used to find the next end that is still in the grid and has not been
                        // attacked.
                        // First checks left, then checks right.

                        // This is pretty darn ugly, but it guarantees that the CPU will finish every ship it starts
                        // attacking.

                        // However, it also guarantees it will always fire an extra shot for every ship.
                        let backTrackColumn = column - 1;
                        // If the tile to the left of the current tile was a hit, that means your most recent shot
                        // was to the right and was a miss.
                        // So you want to access this.lastHit.coords to find the first shot from the sequence and shoot to
                        // the left.
                        // If the tile to the left is not in lastHit.coords at all, that means you want to check all the way
                        // to the right
                        if(this.lastHit.coords.includes([row, backTrackColumn].join(' '))){
                            backTrackColumn = parseInt(this.lastHit.coords.slice(-1)[0].split(' ')[1]) - 1;
                        } else {
                            backTrackColumn = parseInt(this.lastHit.coords.slice(-1)[0].split(' ')[1]) + 1;
                        }
                        // If the opposite side's tile is already attacked, this ship is sunk, so you want to move on
                        if(backTrackColumn >= 0 && backTrackColumn < gameboard.width && !this.playHistory.includes([row, backTrackColumn].join(""))){
                            attackHit = this.sendAttack(row, backTrackColumn, gameboard);
                            this.lastHit.backtracked = true;
                            if(attackHit){
                                this.lastHit.coords.push([row, backTrackColumn].join(' '));
                                this.lastHit.coords.reverse();
                            }
                        }
                    }
                }
                // If the current target is not horizontally placed AND you have not fired an attack yet
                if(!this.lastHit.horizontal && attackHit === null){
                    // Try attacking above if you haven't already
                    if(!(row == 0 || this.playHistory.includes([row - 1, column].join("")))){
                        attackHit = this.sendAttack(row - 1, column, gameboard);
                        if(attackHit){
                            this.lastHit.coords.unshift([row - 1, column].join(' '));
                            this.lastHit.horizontal = false;
                        }
                    // otherwise try attacking below if you haven't already
                    } else if(!(row + 1 == gameboard.height || this.playHistory.includes([row + 1, column].join("")))){
                        attackHit = this.sendAttack(row + 1, column, gameboard);
                        if(attackHit){
                            this.lastHit.coords.unshift([row + 1, column].join(' '));
                            this.lastHit.horizontal = false;
                        }
                    } else if(this.lastHit.horizontal === false && this.lastHit.backtracked === false){
                        // If you cannot attack directly above or below, try attacking the opposite end of the current line.
                        // If it is a miss, then you know that the ship targeted by lastHit is fully sunk.
                        let backTrackRow = row - 1;
                        if(this.lastHit.coords.includes([backTrackRow, column].join(' '))){
                            backTrackRow = parseInt(this.lastHit.coords.slice(-1)[0].split(' ')[0]) - 1;
                        } else {
                            backTrackRow =parseInt(this.lastHit.coords.slice(-1)[0].split(' ')[0]) + 1;
                        }
                        if(backTrackRow >= 0 && backTrackRow < gameboard.height && 
                                !this.playHistory.includes([backTrackRow, column].join(""))){
                            attackHit = this.sendAttack(backTrackRow, column, gameboard);
                            this.lastHit.backtracked = true;
                            if(attackHit){
                                this.lastHit.coords.push([backTrackRow, column].join(' '));
                                this.lastHit.coords.reverse();
                            }
                        }
                    }
                }
            }
        }
            // If you made it through the code above and attackHit is still null, attack randomly.
        if(attackHit === null){
            if(this.lastHit.backtracked){
                this.enemyShipsRemaining.splice(this.enemyShipsRemaining.indexOf(this.lastHit.coords.length));
            }
            // For now, if you make it through the 4 previous and can't take a shot, that means you have already
            // shot all of the surrounding tiles.
            // Reset lastHit
            this.lastHit.coords = null;
            this.lastHit.horizontal = null;
            this.lastHit.backtracked = false;
            attackHit = this.randomAttack(gameboard);
        }
        return attackHit;
    }

    randomAttack(gameboard){
        let row = Math.floor(Math.random() * gameboard.height);
        let column = Math.floor(Math.random() * gameboard.width);
        while (this.playHistory.includes([row, column].join(""))){
            row = Math.floor(Math.random() * gameboard.height);
            column = Math.floor(Math.random() * gameboard.width);
        }
        const attackHit = this.sendAttack(row, column, gameboard);
        if(attackHit){
            this.lastHit.coords = [[row, column].join(" ")];
        }
        return attackHit;
    }

    sendAttack(row, column, targetBoard){
        this.playHistory.push([row, column].join(""));
        return targetBoard.receiveAttack(row, column);
    }
}

module.exports = Player;
