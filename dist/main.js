/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
;
const ShipFactory = __webpack_require__(5);
const GameBoardFactory = __webpack_require__(6);
const Player = __webpack_require__(7);

const DOMControls = __webpack_require__(8);

// There must be a better way to do this. But for now this is okay.
const executeTurn = (activePlayer, inactivePlayer, event) => {
    if(!activePlayer.isTurn){
        return;
    }
    console.log("Shooting...");
    let row;
    let column;
    let shotHit;
    if(activePlayer.isCPU){
        [row, column] = activePlayer.randomAttack(inactivePlayer.gameboard);
    } else {
        row = event.target.dataset["row"];
        column = event.target.dataset["column"];
    }
    shotHit = activePlayer.sendAttack(row, column, inactivePlayer.gameboard);
    //DOMControls.revealTile(row, column, inactivePlayer.gameboard);
    // If the attack hits, 
    if(!shotHit){
        activePlayer.toggleTurn();
        inactivePlayer.toggleTurn();
    } else if(activePlayer.isCPU){
        executeTurn(activePlayer, inactivePlayer);
    }
    DOMControls.refresh(executeTurn);
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

//DOMControls.refresh(executeTurn);



/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
;
            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_1__.default, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});

/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),
/* 3 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports
;
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ":root {\n    font-family: \"Noto Sans\", sans-serif;\n}\nhtml, body {\n    margin: 0;\n    padding: 0;\n    background-color: #242424;\n    color: #eaeaea;\n}\n\nhtml {\n    width: 100%;\n    height: 100%;\n}\n\nbody {\n    width: 100%;\n    height: 100%;\n}\n\nheader {\n    padding: 0 10%;\n}\n\nmain {\n    width: 100%;\n}\n\nmain div {\n    margin: auto;\n}\n\n/* \n    Start screen styling\n*/\n#start-up {\n    width: 60%;\n    display: flex;\n    flex-direction: column;\n    align-content: center;\n\n    text-align: center;\n}\n\n#player-creation {\n    display: flex;\n    justify-content: space-around;\n}\n\n#new-game {\n    margin: auto;\n}\n\n#game-over {\n    position: absolute;\n    top: 30%;\n    width: 40%;\n    margin: auto;\n    border-radius: 1em;\n    padding: 5em;\n\n    background-color:rgba(36, 36, 36, 0.5);\n\n    text-align: center;\n}\n\n#game-over-controls {\n    display: flex;\n    flex-direction: row;\n    justify-content: space-around;\n}\n\n#game-over-controls button {\n    font-size: 1em;\n    width: 40%;\n    height: 2em;\n    background-color: rgba(240, 240, 240, 0.5);\n    border: 2px solid rgba(200, 200, 200, 0.5);\n    border-radius: 6px;\n}\n\n#in-game {\n    display: flex;\n    flex-direction: row;\n    justify-content: space-evenly;\n}\n\n.player-container {\n    padding: 1em;\n}\n\n.game-board {\n    background-color: #242424;\n    display: grid;\n    gap: 2px;\n    place-content: center center;\n}\n\n.tile {\n    width: 64px;\n    height: 64px;\n    background-color: #244288;\n    text-align: center;\n    font-size: 18pt;\n    font-family: monospace;\n    color: white;\n}\n\n.tile.unknown {\n}\n\n.game-board .tile.unknown:hover {\n    background-color: rgba(255, 0, 0, 0.672);\n}\n\n.tile.empty {\n    background-color: #eaeaea;\n}\n\n.tile.ship {\n    background-color: #242424;\n}\n\n.tile.damaged {\n    background-color: rgba(255, 0, 0, 0.672);\n}\n\n.hidden {\n    display: none !important;\n}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),
/* 5 */
/***/ ((module) => {

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
};

module.exports = ShipFactory;


/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ShipFactory = __webpack_require__(5);
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
            let [r, c] = coordinateArray[i];
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
                if(!target.isHit){
                    ships[target.shipIndex].hit(target.shipOffset);
                    target.isHit = true;
                    return true;
                }
            } else {
                grid[row][column] = false;
                return false;
            }
        } catch (e) {
            throw e;
        }
        return false;
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


/***/ }),
/* 7 */
/***/ ((module) => {

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


/***/ }),
/* 8 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

const GameBoardFactory = __webpack_require__(6);
const Player = __webpack_require__(7);

const DOMControls = (() => {
    let playerOne, playerTwo;

    this.startScreen = document.querySelector("#start-up");
    this.endScreen = document.querySelector("#game-over");
    this.inGameScreen = document.querySelector("#in-game");

    const playerCreation = () => {
        this.endScreen.classList.add("hidden");
        this.inGameScreen.classList.add("hidden");
        this.startScreen.classList.remove("hidden");
    }

    const startGame = (event) => {
        // Create players from each player entry
        // Register the players so this object can easily refer to them
        // Switch screen to the game screen
        //  - Specifically the ship-placement screen
        const playerEntries = document.querySelectorAll(".player-entry");
        const players = [];
        playerEntries.forEach(entryElement => {
            const playerName = entryElement.querySelector("#player-name").text;
            const isCPU = entryElement.querySelector("#is-cpu").checked;
            players.push(new Player(isCPU, playerName));
        });
        registerPlayers(...players);

        this.inGameScreen.classList.remove("hidden");
        this.startScreen.classList.add("hidden");
    }

    const registerPlayers = (pOne,pTwo) => {
        const boardOne = GameBoardFactory(10, 10);
        const boardTwo = GameBoardFactory(10, 10);
        pOne.setGameboard(boardOne);
        pTwo.setGameboard(boardTwo);
        this.playerOne = pOne;
        this.playerTwo = pTwo;
    }

    const gameOver = (winner, loser) => {
        const gameOver = document.querySelector("#game-over");

        gameOver.querySelector("#winner").textContent = `Player ${winner} won!`;
        gameOver.querySelector("#loser").textContent = `Sorry Player ${loser}...`;
        gameOver.classList.remove("hidden");
    }

    const renderBoard = (number, player) => {
        const boardElement = document.querySelector(`#player-${number} .game-board`);
        while(boardElement.hasChildNodes()){
            boardElement.removeChild(boardElement.firstChild);
        }
        boardElement.style.gridTemplateRows = `repeat(${player.gameboard.height}, 1fr)`;
        boardElement.style.gridTemplateColumns = `repeat(${player.gameboard.width}, 1fr)`;
        const board = player.gameboard.viewBoard();
        for(let r = 0; r < player.gameboard.height; r++){
            for(let c = 0; c < player.gameboard.width; c++){
                let tile = document.createElement("div");
                tile.dataset["row"] = r;
                tile.dataset["column"] = c;
                tile.classList.add("tile");
                if(board[r][c]){
                    if(board[r][c].isHit){
                        tile.classList.add("damaged");
                    } else {
                        tile.classList.add("unknown");
                    }
                } else if (board[r][c] === false){
                    tile.classList.add("empty");
                } else {
                    tile.classList.add("unknown");
                }
                boardElement.appendChild(tile);
            }
        }
        return boardElement;
    }

    const revealTile = (row, column, board) => {
        return
    }

    const setupAttackListeners = (boardElement, attacker, defender, callback) => {
        boardElement.querySelectorAll(".unknown").forEach(tile => {
            tile.addEventListener("click", event => callback(attacker, defender, event));
        });
    }

    const refresh = (callback) => {
        // Initialize the board for each player
        const boardElementOne = renderBoard("one", this.playerOne);
        const boardElementTwo = renderBoard("two", this.playerTwo);

        if(this.playerOne.gameboard.allShipsSunk()){
            gameOver("two", "one");
        } else if(this.playerTwo.gameboard.allShipsSunk()){
            gameOver("one", "two");
        } else {
            // Add listeners so player one attacks board two and player two attacks board one
            setupAttackListeners(boardElementTwo, this.playerOne, this.playerTwo, callback);
            if(!this.playerTwo.isCPU){
                setupAttackListeners(boardElementOne, this.playerTwo, this.playerOne, callback);
            } else if(this.playerTwo.isTurn){
                callback(this.playerTwo, this.playerOne);
            }
        }
    }

    // TESTING PURPOSES ONLY; DELETE THIS NEPHEW
    document.querySelector("header h1").addEventListener("click", event => gameOver("test", "loser!"));

    // Set up event listeners for the UI that doesn't change
    document.querySelector("#new-game").onclick = startGame;

    return {
        registerPlayers,
        refresh,
        renderBoard,
        setupAttackListeners,
        gameOver,
    }
})();

module.exports = DOMControls;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__(0);
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;