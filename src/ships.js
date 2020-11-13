function ShipFactory(length){
    // Check truthiness to catch 0 as well as undefined
    if(!(length = parseInt(length))){
        throw new Error("Invalid ship length. Must be an integer between 2 and 5");
    }

    const hitMap = new Array(length).fill(false);

    const getLength = () => { return length; };

    const getHitMap = () => { return hitMap.slice(0); };

    const hit = (index) => { hitMap[index] = true };

    const isHitAt = (index) => { return hitMap[index] }

    const isSunk = () => { return hitMap.every((value) => value == true) };

    return { getLength, getHitMap, hit, isHitAt, isSunk };
}

module.exports = ShipFactory;
