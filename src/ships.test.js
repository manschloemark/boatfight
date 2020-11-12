const ShipFactory = require("./ships");
const GameBoardFactory = require("./board");


describe("Test ShipFactory and Ship objects", () => {
    test("Create a ship with given length", () => {
        const testShip = ShipFactory(3);
        expect(testShip.getLength()).toEqual(3);
    });

    test("Creating a ship without a number throws an error", () => {
        expect(() => ShipFactory()).toThrow(Error);
    });

    test("Check an unhit ship's hit map", () => {
        const unhitShip = ShipFactory(3);
        expect(unhitShip.getHitMap()).toEqual([false, false, false]);
    });

    test("Check that a ship can be hit", () => {
        const hitShip = ShipFactory(3);
        hitShip.hit(0);
        expect(hitShip.getHitMap()).toEqual([true, false, false]);
    });

    test("Ship.hit() hits the correct index in the hit map array", () => {
        const middleHit = ShipFactory(4);
        middleHit.hit(1);
        expect(middleHit.getHitMap()).toEqual([false, true, false, false]);
    });

    test("Ship.isHitAt lets you quickly check if a specific space is hit", () => {
        const frontHit = ShipFactory(3);
        frontHit.hit(0);
        expect(frontHit.isHitAt(0)).toBe(true);
    });

    test("isSunk returns false when not all spaces are hit", () => {
        const testNotSunkShip = ShipFactory(3);
        expect(testNotSunkShip.isSunk()).toBe(false);
    });

    test("Return true when every space has been hit", () => {
        const deadShip = ShipFactory(3);
        deadShip.hit(0);
        deadShip.hit(1);
        deadShip.hit(2);
        expect(deadShip.isSunk()).toBe(true);
    });
});

describe("Test GameBoard objects", () => {
    let testBoard = GameBoardFactory(2, 2);

    test("View 2D array", () => {
        expect(testBoard.viewBoard())
        .toEqual([[null, null], [null, null]]);
    });

    test("Place a one-block ship on the grid", () => {
       testBoard.placeShip(0, 0, 1);
       expect(testBoard.viewBoard())
        .toEqual([
            [{ shipIndex: 0, shipOffset: 0, isHit: false}, null],
            [null, null]]);
    });

    test("Cannot on top of an existing ship", () => {
        expect(() => testBoard.placeShip(0, 0, 1)).toThrow(Error);
    });

    test("Test allShipsSunk with one unsunk ship", () => {
        expect(testBoard.allShipsSunk()).toBe(false);
    });

    test("Receive attack throws and error when given bad coords ", () => {
        expect(() => testBoard.receiveAttack(3, 3)).toThrow(Error);
    })

    test("Missing a shot turns the value to false", () => {
        testBoard.receiveAttack(0, 1);
        expect(testBoard.viewBoard())
        .toEqual([[{ shipIndex: 0, shipOffset: 0, isHit: false }, false], [null, null]]);
    });

    test("Hitting a shot turns the objects isHit value to true", () => {
        testBoard.receiveAttack(0, 0);
        expect(testBoard.viewBoard())
        .toEqual([[{ shipIndex: 0, shipOffset: 0, isHit: true }, false], [null, null]]);
    });

    test("Test allShipsSunk with one sunken ship", () => {
        expect(testBoard.allShipsSunk()).toBe(true);
    });

    const largeTestBoard = GameBoardFactory(4, 4);

    [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]
    ]

    test("Test placing a ship with length > 1 horizontally", () => {
        largeTestBoard.placeShip(0, 0, 2, false);
        expect(largeTestBoard.viewBoard()).toEqual(
        [
            [{ shipIndex: 0, shipOffset: 0, isHit: false }, { shipIndex: 0, shipOffset: 1, isHit: false }, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null]
        ]);
    });

    test("Test placing a ship with length > 2 vertically", () => {
        largeTestBoard.placeShip(2, 0, 2, true);
        expect(largeTestBoard.viewBoard()).toEqual(
        [
            [{ shipIndex: 0, shipOffset: 0, isHit: false }, { shipIndex: 0, shipOffset: 1, isHit: false }, null, null],
            [null, null, null, null],
            [{ shipIndex: 1, shipOffset: 0, isHit: false}, null, null, null],
            [{ shipIndex: 1, shipOffset: 1, isHit: false}, null, null, null]
        ]);
    });

    test("allShipsSunk does not return true when one of multiple ships are sunken", () => {
        largeTestBoard.receiveAttack(0, 0);
        largeTestBoard.receiveAttack(0, 1);
        expect(largeTestBoard.allShipsSunk()).toBe(false);
    });

    test("allShipsSunk returns true when all ships are sunk and there is more than one ship", () => {
        largeTestBoard.receiveAttack(2, 0);
        largeTestBoard.receiveAttack(3, 0);
        expect(largeTestBoard.allShipsSunk()).toBe(true);
    });
});