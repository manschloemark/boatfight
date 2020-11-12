ShipFactory = require("./ships");

const GameBoardFactory = (rows, columns) => {
    const height = rows;
    const width = columns;
    const grid = new Array(rows);
    for(let rowNumber = 0; rowNumber < rows; rowNumber++){
        grid[rowNumber] = new Array(columns).fill(null);
    }

    const ships = new Array();

    // Given the parameters for placing a ship, generate an array of [row, column] values
    // that the ship will be placed on
    const getCoordinateArray = (row, column, shipSize, horizontal) => {
        let coordinates = new Array();
        if(horizontal){
            for(let i = 0; i < shipSize; i++){
                coordinates.push([row, column + i]);
            }
        } else {
            for(let j = 0; j < shipSize; j++){
                coordinates.push([row + j, column]);
            }
        }

        return  coordinates;
    }

    // Returns false if a ship exists at or around these coordinates
    const validateCoordinates = (row, column) => {
        // Return false if given coordinates are not inside of the grid
        if(row < 0 || row >= grid.length || column < 0 || column >= grid[row].length){
            return false;
        }
        // Return false if there is a ship at the given tile or any tiles touching it
        for(let r = row - 1; r <= row + 1; r++){
            for(let c = column - 1; c <= column + 1; c++){
                // If coordinates are inside the grid AND a ship exists at the coordinates
                // If the coordinates are outside the grid you can continue.
                if(r >= 0 && r < grid.length && c >= 0 && c < grid[r].length && grid[r][c]){
                    return false;
                }
            }
        }
        return true;
    }

    // Might refactor, see comment at bottom
    const placeShip = (row, column, shipSize, horizontal) => {
        horizontal = horizontal || false; // Defaults to false (vertical)    
        const coordinateArray = getCoordinateArray(row, column, shipSize, horizontal);
        // Check each coordinate to ensure the ship can be placed
        if(coordinateArray.some(coordinates => !validateCoordinates(...coordinates))){
            throw new Error("Could not place ship. Ships cannot be within one tile of existing ships.")
        }
        const newShip = ShipFactory(shipSize);
        const shipIndex = ships.length;
        ships.push(newShip);
        for(let i = 0; i < coordinateArray.length; i++){
            [r, c] = coordinateArray[i];
            // This is still something I'm not sure about.
            // It feels wasteful, but at the same time, it's way easier than
            // storing the ship object itself at every tile the ship spans
            grid[r][c] = {
                shipIndex,
                shipOffset: i,
                isHit: false
            };
        };
    };

    const viewBoard = () => {
        return grid.map(row => row.slice(0));
    }

    const receiveAttack = (row, column) => {
        try {
            const target = grid[row][column]
            if(target) {
                ships[target.shipIndex].hit(target.shipOffset);
                target.isHit = true;
            } else {
                grid[row][column] = false;
            }
        } catch (e) {
            throw e;
        }
    }

    const allShipsSunk = () => {
        return ships.every(ship => ship.isSunk());
    }

    return { width, height, viewBoard, placeShip, receiveAttack, allShipsSunk };
};


/*  I think my method of validating a ship's placement is a little wasteful

    First I create an Array or [row, column] pairs based on the given start coordinates,
    the length of the ship, and the horizontal flag.

    I then pass each pair of coordinates in the array to a method called validateCoordinates.
    This method checks:
        1. that the coordinates are inside of the grid.
        2. the the coordinates and every coordinate surrounding are falsey.

    If either of these checks fail, it returns false.
    It returns true if the given coordinates are able to receive a ship.

    It works, and I'm happy enough with the code for this, but I think it would have been
    better to just mark invalid locations with some specific value.

    Alternative implementation:
        - When a ship is placed, set every tile sourrounding the ship to false.
        - When a ship is being placed, check every tile to make sure it does not contain a ship or false.
            (I'd have to think of better placeholder values, but I get the idea)
    It would most certainly be more efficient because you only access surrounding tiles after a ship is
    placed, not when attempting to place a ship.
    Though my current implementation probably uses less memory.

    In either method you want to check to make sure you can actually place the boat before you start placing
    the boat objects anywhere

    Either way, it's not a huge deal. Ships have a max length of 5, so you're only ever checking 
    5 + (5 * 9) = 50 locations. Not too bad considering the speed of computers.
*/

module.exports = GameBoardFactory;