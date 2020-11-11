ShipFactory = require("./ships");

const GameBoardFactory = (rows, columns) => {
    const grid = new Array(rows);
    for(let rowNumber = 0; rowNumber < rows; rowNumber++){
        grid[rowNumber] = new Array(columns).fill(null);
    }

    const ships = new Array();

    const placeShip = (row, column, shipSize, vertical) => {
        vertical = vertical || false; // Defaults to false
        const newShip = ShipFactory(shipSize);
        const shipIndex = ships.length;
        if (vertical) {
            if (row + shipSize > grid.length) {
                throw Error("Ship extends outside of the grid!");                
            } 
            ships.push(newShip);
            for(let rowOffset = 0; rowOffset < newShip.getLength(); rowOffset++){
                grid[row + rowOffset][column] = ({ 
                    shipIndex, 
                    shipOffset: rowOffset, 
                    isHit: false
                });
            }
        } else {
            if (column + shipSize > grid[row].length) {
                throw Error("Ship extends outside of the grid!");
            }
            ships.push(newShip);
            for(let columnOffset = 0; columnOffset < newShip.getLength(); columnOffset++){
                grid[row][column + columnOffset] = ({
                    shipIndex,
                    shipOffset: columnOffset,
                    isHit: false
                });
            }
        }
    };

    const viewBoard = () => {
        return grid.map(row => row.slice(0));
    }

    const receiveAttack = (row, column) => {
        try {
            if(grid[row][column]) {
                ships[grid[row][column].shipIndex].hit(grid[row][column].shipOffset);
                grid[row][column].isHit = true;
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

    return { viewBoard, placeShip, receiveAttack, allShipsSunk };
};

module.exports = GameBoardFactory;