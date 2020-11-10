const Ships = require("./ships");
const ShipFactory = Ships.ShipFactory;

describe("Test ShipFactory and Ship objects", () => {
    test("Create a ship with given length", () => {
        const testShip = ShipFactory(3);
        console.log(testShip);
        expect(testShip.length).toEqual(3);
    });

    test("Creating a ship without a number throws an error", () => {
        expect(() => ShipFactory()).toThrow(Error);
    });

    test("Check if a ship has sunk", () => {
        const testNotSunkShip = ShipFactory(3);
        expect(testNotSunkShip.isSunk()).toBe(false);
    });
    /*
    test("Check where a ship has been hit", () => {
        const unhitShip = new ShipFactory(3);
        expect(unhitShip.)
    }*/
});