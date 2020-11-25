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

const ShipArray = [2, 3, 3, 4, 5];

function toggleTurns(playerOne, playerTwo, callback, delayTransition){
    if(playerOne.isCPU || playerTwo.isCPU){
        // If either player is a CPU, don't bother with the control switch screen
        // because CPU turns are immediate and the human won't see anything secret
        playerOne.toggleTurn();
        playerTwo.setTurn(! playerOne.isTurn);
        callback(playerOne, playerTwo);
    } else {
        //Wait a half a second so players can see the result of their attacks.
        // Render the board first so the attacker can see the result of their attack
        DOMControls.renderBoards(playerOne, playerTwo);
        playerOne.toggleTurn();
        playerTwo.setTurn(! playerOne.isTurn);
        // I use a 1/4 second timeout so the user can see the boards for a little bit
        // after attacking.
        // The delay does not happen after a player clicks 'Ready' when placing their ships
        if(delayTransition){
            setTimeout( () => {
            DOMControls.switchSides(playerOne, playerTwo, callback);
            }, 150);
        } else {
            DOMControls.switchSides(playerOne, playerTwo, callback);
        }
    }
}

function executeTurn(playerOne, playerTwo, event){
    let attacker, board;
    if(playerOne.isTurn){
        attacker = playerOne;
        board = playerTwo.gameboard;
    } else {
        attacker = playerTwo;
        board = playerOne.gameboard;
    }
    let attackHit;
    if(attacker.isCPU){
        attackHit = attacker.cpuAttack(board);
    } else {
        let row = event.target.dataset["row"];
        let column = event.target.dataset["column"];
        attackHit = attacker.sendAttack(row, column, board);
    }
    

    if(!attackHit){
        toggleTurns(playerOne, playerTwo, setupTurn, true);
    } else {
        setupTurn(playerOne, playerTwo);
    }

}

function startPlayerCreation(){
    DOMControls.showStartMenu();
}

function startNewGame(){
    const [playerOneData, playerTwoData] = DOMControls.readPlayerInput();
    const playerOne = new Player(...playerOneData);
    const playerTwo = new Player(...playerTwoData);

    const boardOne = GameBoardFactory(10, 10);
    const boardTwo = GameBoardFactory(10, 10);

    // Maybe make the board size an option?
    // Instead of setting this at the start I set it each time the board is rendered.
    //DOMControls.setBoardGrid(10, 10);

    playerOne.setGameboard(boardOne);
    playerTwo.setGameboard(boardTwo);

    playerOne.setShipArray(ShipArray.slice(0));
    playerTwo.setShipArray(ShipArray.slice(0));

    playerOne.setTurn((Math.random() > 0.5));
    playerTwo.setTurn(! playerOne.isTurn);

    if(playerOne.isCPU){
        playerOne.enemyShipsRemaining = ShipArray.slice(0);
    }
    if(playerTwo.isCPU){
        playerTwo.enemyShipsRemaining = ShipArray.slice(0);
    }
    DOMControls.renderPlayerNames(playerOne, playerTwo);
    DOMControls.showGameUI();
    shipPlacementTurn(playerOne, playerTwo);
}

function resetShips(playerOne, playerTwo){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    activePlayer.clearBoard();
    shipPlacementTurn(playerOne, playerTwo);
}

function cpuShipPlacement(playerOne, playerTwo){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    activePlayer.randomizeShips();
    finishShipPlacement(playerOne, playerTwo);
}

function manualShipPlacement(playerOne, playerTwo, row, column, shipSize, horizontal) {
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    try{
        activePlayer.positionShip(row, column, shipSize, horizontal);
    } catch (e) {
        if(e.name != "RangeError" || e.name != "ShipError"){
            throw e;
        }
    }
    shipPlacementTurn(playerOne, playerTwo);
}

function randomShipPlacement(playerOne, playerTwo){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    activePlayer.randomizeShips();
    shipPlacementTurn(playerOne, playerTwo);
}

function shipPlacementTurn(playerOne, playerTwo){
    if(playerOne.isReady && playerTwo.isReady){
        DOMControls.clearDockButtons();
        DOMControls.showPlayerElements();
        setupTurn(playerOne, playerTwo);
    } else {
        let activePlayer;
        if(playerOne.isTurn){
            activePlayer = playerOne;
        } else {
            activePlayer = playerTwo;
        }
        if(activePlayer.isCPU){
            cpuShipPlacement(playerOne, playerTwo);
        } else {
            // Human can manually or choose to randomize ships
            DOMControls.displayInstructions(`${activePlayer.name} is placing ships...`);
            setupShipPlacementUI(playerOne, playerTwo);    
            // In either case, the DOM should be updated to give the player a UI
            // so they can choose.
            // A callback will need to be passed somewhere that can handle either case.
            // randomShipPlacement will be passed to the 'randomize ships' button
            // finishShipPlacement will be passed as the callback to "Ready" when a human
            // is placing ships, so they can randomize ship placements without automatically
            // accepting it.
        }
    }
}

function setupShipPlacementUI(playerOne, playerTwo){
    DOMControls.renderBoards(playerOne, playerTwo);
    DOMControls.renderDocks(playerOne, playerTwo, resetShips, randomShipPlacement, finishShipPlacement);
    if(!((playerOne.isTurn && playerOne.getUnplacedShips().length == 0) || (playerTwo.isTurn && playerTwo.getUnplacedShips().length == 0))){
        DOMControls.addShipPlacementListeners(playerOne, playerTwo, manualShipPlacement);
    }
}

function finishShipPlacement(playerOne, playerTwo){
    let activePlayer;
    if(playerOne.isTurn){
        activePlayer = playerOne;
    } else {
        activePlayer = playerTwo;
    }
    if(activePlayer.unplacedShips.length == 0){
        activePlayer.setReady(true);
        toggleTurns(playerOne, playerTwo, shipPlacementTurn, false);
        //shipPlacementTurn(playerOne, playerTwo);
        return true;
    }
    return false;
}

function startBattlePhase(playerOne, playerTwo){
}

function setupTurn(playerOne, playerTwo){
    if(playerOne.gameboard.allShipsSunk()){
        gameOver(playerOne, playerTwo, false);
     } else if (playerTwo.gameboard.allShipsSunk()){
         gameOver(playerOne, playerTwo, true)
     } else {
        if((playerOne.isTurn && playerOne.isCPU) || (playerTwo.isTurn && playerTwo.isCPU)){
            // If both players are CPU, it's assumed that the human wants to watch
            // the CPU's 'simulate' a game, so the boards are drawn and the CPU's take
            // a half a second to attack.
            // In a human vs CPU battle, I assume the player doesn't care to
            // watch the CPU attack, and the board is not rendered for CPU turns.
            if(playerOne.isCPU && playerTwo.isCPU){
                DOMControls.renderBoards(playerOne, playerTwo);
                setTimeout(() => {
                    executeTurn(playerOne, playerTwo)
                }, 150);
            } else {
                executeTurn(playerOne, playerTwo);
            }
            //executeTurn(playerOne, playerTwo);
        } else {
            let name;
            if(playerOne.isTurn){
                name = playerOne.name;
            } else {
                name = playerTwo.name;
            }
            DOMControls.displayInstructions(`${name} is attacking`);
            DOMControls.renderBoards(playerOne, playerTwo);
            DOMControls.addAttackListeners(playerOne, playerTwo, executeTurn);
        }
    }
}

// the parameter 'playerOneWins' is only used so I can a) keep the order of players
// consistent in gameOver's arguments without needing to call allShipsSunk again.
// So I can just check playerOneWins to determine what to do in here.
function gameOver(playerOne, playerTwo, playerOneWins){
    // Set both players isTurn to true so the renderBoards method displays all info.
    // There's no need to hide the idle players ships since the game is over.
    // There's probably a more elegant way to address this, but for now this is quick
    // and easy.
    playerOne.setTurn(true);
    playerTwo.setTurn(true);
    DOMControls.renderBoards(playerOne, playerTwo);
    if(playerOneWins){
        DOMControls.displayWinner(playerOne, playerTwo);
    } else {
        DOMControls.displayWinner(playerTwo, playerOne);
    }
    DOMControls.showGameOver();
}
// Add event listeners for the game
document.querySelector("#new-game").addEventListener("click", startNewGame);
document.querySelector("#rematch").addEventListener("click", startNewGame);
document.querySelector("#change-players").addEventListener("click", startPlayerCreation);

// Make sure the page loads to the player creation screen at first
startPlayerCreation();

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
___CSS_LOADER_EXPORT___.push([module.id, ":root {\n    font-family: \"Noto Sans\", sans-serif;\n    font-size: 16pt;\n\n    --bgcolor: #242424;\n    --lightbgcolor: #484848;\n    --bgcontrast: #eaeaea;\n    --active-board-background: #006020;\n    --inactive-board-background: #a00000;\n}\n\nhtml, body {\n    margin: 0;\n    padding: 0;\n    background-color: #242424;\n    color: #eaeaea;\n}\n\nhtml {\n    width: 100%;\n    height: 100%;\n}\n\nbody {\n    width: 100%;\n    height: 100%;\n}\n\nheader {\n    padding: 0 10%;\n}\n\n#header-title {\n    font-size: 1.4em;\n    font-weight: bold;\n    margin: 0;\n    padding: 1em 0;\n}\n\nmain {\n    width: 100%;\n}\n\nmain div {\n    margin: auto;\n}\n\nbutton {\n    font-size: 1em;\n    height: 2em;\n    background-color: rgba(240, 240, 240, 0.8);\n    color: black;\n    border: 2px solid rgba(200, 200, 200, 0.9);\n    border-radius: 6px;\n}\n/* \n    Start screen styling\n*/\n#start-menu {\n    width: 60%;\n    display: flex;\n    flex-direction: column;\n    align-content: center;\n\n    text-align: center;\n}\n\n#player-creation {\n    margin: 0;\n    display: flex;\n    justify-content: space-evenly;\n}\n\n.player-entry {\n    display: grid;\n    grid-template-areas: \"player-number player-number\"\n                         \"name-label name-entry\"\n                         \"cpu-label cpu-checkbox\";\n\n    gap: 1em;\n    border-radius: 8px;\n    background-color: #484848;\n    padding: 0 1em 1em 1em;\n}\n\n.player-number {\n    grid-area: player-number;\n}\n\n.name-label {\n    grid-area: name-label;\n\n    text-align: left;\n}\n\n.player-name {\n    grid-area: name-entry;\n\n    background-color: #eaeaea;\n    color: #242424;\n    font-size: 0.9em;\n    border-radius: 8px;\n    padding: 0 0.4em;\n}\n\n.is-cpu-label {\n    grid-area: cpu-label;\n\n    text-align: left;\n}\n\n.is-cpu {\n    grid-area: cpu-checkbox;\n    width: min-content;\n    background-color: #eaeaea;\n}\n\n#new-game {\n    width: 10%;\n    min-width: min-content;\n    margin: 1em auto;\n    font-size: 1.2em;\n}\n\n#game-over {\n    position: absolute;\n    top: 30%;\n    width: 40%;\n    padding: 2%;\n    left: 28%;\n    border-radius: 1em;\n    background-color:rgba(36, 36, 36, 0.5);\n    text-align: center;\n}\n\n#game-over-controls {\n    display: flex;\n    flex-direction: row;\n    justify-content: space-around;\n}\n\n#game-over-controls button {\n    width: 40%;\n}\n\n\n/* Battle styles - game boards, ships, docks */\n\n#in-game {\n    display: flex;\n    flex-direction: column;\n}\n\n.player-container {\n    margin-top: 0;\n}\n\n.player-header {\n    display: flex;\n}\n\n#player-one .player-header {\n    flex-direction: row;\n}\n\n#player-two .player-header {\n    flex-direction: row-reverse;\n}\n\n#player-one .name {\n    text-align: left;\n}\n\n#player-two .name {\n    text-align: right;\n}\n\n.name {\n    font-size: 1.2em;\n    margin: 0 1em;\n    max-width: 200px;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    /* flex-grow: 1; */\n}\n\n.name:hover {\n    overflow: visible;\n    cursor: default;\n}\n\n.turn-indicator {\n    margin: auto 0;\n    height: 1em;\n    width: 1em;\n    border-radius: 100%;\n\n    /* border: 2px solid #242424; */\n    background-image: radial-gradient(circle at top 30% left 40%, rgba(255, 255, 255, 0.5) 0, transparent 40%, rgba(0, 0, 0, 0.8) 90%);\n}\n\n.player-container.idle .turn-indicator {\n    background-color: #aa2424;\n    box-shadow: 0 0 12px 2px #aa2424;\n}\n\n.player-container.is-turn .turn-indicator {\n    background-color: #24aa24;\n    box-shadow: 0 0 12px 2px #24aa24;\n}\n\n#player-flex-box{\n    display: flex;\n    flex-direction: row;\n    justify-content: space-evenly;\n    flex-wrap: wrap;\n    width: 100%;\n    margin: auto;\n}\n\n#instructions{\n    text-align: center;\n}\n\n.player-container {\n    padding: 0 1em 1em 1em;\n    background-color: var(--lightbgcolor);\n    border-radius: 16px;\n}\n\n.player-container.is-turn {\n    /* box-shadow: 0 0 12px 8px var(--active-board-background); */\n}\n\n.player-container.idle {\n    /* box-shadow: 0 0 12px 8px var(--inactive-board-background); */\n}\n\n.game-board {\n    display: grid;\n    /* gap: 2px; */\n    max-width: min-content;\n    place-content: center center;\n}\n\n.tile {\n    /* width: 64px;\n    height: 64px; */\n    background-color: #244288;\n    text-align: center;\n    font-size: 18pt;\n    font-family: monospace;\n    border: 1px solid var(--bgcolor);\n}\n\n.game-board .tile.unknown:hover {\n    background-color: #eaed4e;\n    cursor: pointer;\n}\n\n.tile.empty {\n    background-color: var(--bgcontrast);\n}\n\n.tile.ship {\n    background-color: #696969;\n    /* border: 1px solid #696969; */\n}\n\n.tile.damaged {\n    background-color: #a00000;\n    /* border: 1px solid #a00000; */\n}\n\n.tile.up-one {\n    border-top: 1px dashed var(--bgcolor);\n}\n\n.tile.down-one {\n    border-bottom: 1px dashed var(--bgcolor);\n}\n\n.tile.right-one {\n    border-right: 1px dashed var(--bgcolor);\n}\n\n.tile.left-one {\n    border-left: 1px dashed var(--bgcolor);\n}\n\n.tile.valid-ship-placement {\n    background-color: #24aa24;\n}\n\n.tile.invalid-ship-placement {\n    background-color: #aa2424;\n}\n\n#ship-dock {\n    display: flex;\n    flex-direction: column;\n    background-color: var(--lightbgcolor);\n    min-width: 600px;\n    min-height: 600px;\n    max-width: 600px;\n    border-radius: 16px;\n}\n\n#ship-dock.inactive *{\n    display: none;\n}\n\n#ship-container {\n    box-shadow: 0 2px 8px black inset;\n    background-color: #306230;\n    margin: 1em;\n    flex-grow: 1;\n    display: flex;\n    flex-direction: row;\n    justify-content: space-evenly;\n    align-content: baseline;\n    flex-wrap: wrap;\n}\n\n#ship-placement-controls {\n    margin: 0 auto 1em auto;\n    display: flex;\n    flex-direction: row;\n    justify-content: space-around;\n\n    width: 80%;\n}\n\n#ship-placement-controls button {\n    width: 32%;\n    min-width: min-content;\n    margin: 1em 0;\n}\n\n.placeable-ship {\n    margin: 1em 0.5em;\n    background-color: #696969;\n    box-shadow: 0 0 2px #fafaea;\n    transform: scale(0.85, 0.85);\n}\n\n#turn-switch {\n    position: absolute;\n    opacity: 0;\n    width: 100%;\n    transition: opacity 0.75s;\n    background-color: var(--bgcolor);\n    text-align: center;\n    z-index: 999;\n}\n\n#turn-switch.show {\n    opacity: 100;\n}\n\n#turn-switch :first-child {\n    padding-top: 10%;\n}\n\n.hidden {\n    display: none !important;\n}", ""]);
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
    let ships;
    let grid;

    const init = () => {
        ships = new Array();
        grid = new Array(height);
        for(let rowNumber = 0; rowNumber < height; rowNumber++){
            grid[rowNumber] = new Array(width).fill(null);
        }
    }

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
            throw new RangeError("Could not place ship. Ships cannot be within one tile of existing ships.")
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

    const removeShips = () => {
        removedShips = ships.slice(0).map(ship => ship.getLength());
        init();
        return removedShips;
    }

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

    init();

    return {
        width, 
        height,
        viewBoard,
        validateCoordinates,
        placeShip,
        removeShips,
        receiveAttack,
        allShipsSunk,
    };
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
        this.isReady = false;
        this.unplacedShips = new Array();

        if(this.isCPU){
            //this.enemyShips = ShipArray.slice(0)
            this.lastHit = {
                coords: null,
                horizontal: null,
                backtracked: false,
            }
            this.enemyShipsRemaining = null; // Ugly to hard-code this
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
                let shipError = new Error(this.name + " does not have ship of size " + shipSize);
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
        const recoveredShips = this.gameboard.removeShips();
        this.addShips(recoveredShips);
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
            if(this.enemyShipsRemaining.slice(-1) == this.lastHit.coords.length){
                this.lastHit.backtracked = true;
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
                        this.lastHit.backtracked = true;
                        if(this.lastHit.coords.includes([row, backTrackColumn].join(' '))){
                            backTrackColumn = parseInt(this.lastHit.coords.slice(-1)[0].split(' ')[1]) - 1;
                        } else {
                            backTrackColumn = parseInt(this.lastHit.coords.slice(-1)[0].split(' ')[1]) + 1;
                        }
                        // If the opposite side's tile is already attacked, this ship is sunk, so you want to move on
                        if(backTrackColumn >= 0 && backTrackColumn < gameboard.width && !this.playHistory.includes([row, backTrackColumn].join(""))){
                            attackHit = this.sendAttack(row, backTrackColumn, gameboard);
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
                        this.lastHit.backtracked = true;
                        let backTrackRow = row - 1;
                        if(this.lastHit.coords.includes([backTrackRow, column].join(' '))){
                            backTrackRow = parseInt(this.lastHit.coords.slice(-1)[0].split(' ')[0]) - 1;
                        } else {
                            backTrackRow =parseInt(this.lastHit.coords.slice(-1)[0].split(' ')[0]) + 1;
                        }
                        if(backTrackRow >= 0 && backTrackRow < gameboard.height && 
                                !this.playHistory.includes([backTrackRow, column].join(""))){
                            attackHit = this.sendAttack(backTrackRow, column, gameboard);
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
                this.enemyShipsRemaining.splice(this.enemyShipsRemaining.indexOf(this.lastHit.coords.length), 1);
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


/***/ }),
/* 8 */
/***/ (function(module) {

const DOMControls = (() => {

    this.turnSwitch = document.querySelector("#turn-switch");
    this.startMenu = document.querySelector("#start-menu");
    this.inGame = document.querySelector("#in-game");
    this.gameOver = document.querySelector("#game-over");
    this.playerOneElement = document.querySelector("#player-one");
    this.playerTwoElement = document.querySelector("#player-two");
    this.dockElement = document.querySelector("#ship-dock");
    //this.tileHeight = document.documentElement.clientHeight / 20;

    this.betweenTurns = false;

    const showStartMenu = () => {
        this.startMenu.classList.remove("hidden");
        this.inGame.classList.add("hidden");
        this.gameOver.classList.add("hidden");
        //this.turnSwitch.classList.add("hidden");
    }

    const showGameUI = () => {
        this.inGame.classList.remove("hidden");
        this.startMenu.classList.add("hidden");
        this.gameOver.classList.add("hidden");
        //this.turnSwitch.classList.add("hidden");
    }

    const showTurnSwitch = () => {
        const heightOffset = document.querySelector("header").clientHeight;
        const width = document.documentElement.clientWidth;
        let height = document.documentElement.clientHeight;
        height = height - heightOffset;
        //this.turnSwitch.style.position = "static";
        this.turnSwitch.style.top = heightOffset + "px";
        this.turnSwitch.style.left = 0;
        //this.turnSwitch.style.width = width + "px";
        this.turnSwitch.style.height = height + "px";
        // this.inGame.classList.add("hidden");
        // this.startMenu.classList.add("hidden");
        // this.gameOver.classList.add("hidden");
        this.turnSwitch.classList.add("show");
    }

    const hideTurnSwitch = () => {
        this.turnSwitch.classList.remove("show");
        //this.turnSwitch.classList.add("hidden");
    }

    const showGameOver = () => {
        this.gameOver.classList.remove("hidden");
    }

    const readPlayerInput = () => {
        const playerDivs = document.querySelectorAll(".player-entry");
        const playerData = [];
        playerDivs.forEach(div => {
            let name = div.querySelector(".player-name").value;
            if(name == ''){
                name = div.querySelector("h3").textContent;
            }
            let isCPU = div.querySelector(".is-cpu").checked;
            playerData.push([isCPU, name]);
        });
        return playerData;
    }

    const switchSides = (playerOne, playerTwo, callback) => {
        this.betweenTurns = true;
        this.turnSwitch.classList.remove("hidden");
        let activeName, inactiveName;
        if(playerOne.isTurn){
            activeName = playerOne.name;
            inactiveName = playerTwo.name;
        } else {
            activeName = playerTwo.name;
            inactiveName = playerOne.name;
        }
        clearContainer(this.turnSwitch);
        const instructionP = document.createElement("p");
        instructionP.textContent = `Handing control to ${activeName}.`;
        const cheekyP = document.createElement("p");
        cheekyP.textContent = `No peeking, ${inactiveName}!`

        const button = document.createElement("button");
        button.textContent = "Ready";
        button.addEventListener("click", event => {
            this.betweenTurns = false;
            hideTurnSwitch();
            callback(playerOne, playerTwo);
        });

        this.turnSwitch.appendChild(instructionP);
        this.turnSwitch.appendChild(cheekyP);
        this.turnSwitch.appendChild(button);

        showTurnSwitch();
    }

    const renderPlayerNames = (playerOne, playerTwo) => {
        this.playerOneElement.querySelector(".name").textContent = playerOne.name;
        this.playerTwoElement.querySelector(".name").textContent = playerTwo.name;
    }

    const showPlayerElements = () => {
        this.playerOneElement.classList.remove("hidden");
        this.playerTwoElement.classList.remove("hidden");
    }

    const clearContainer = (container) => {
        while(container.hasChildNodes()){
            container.removeChild(container.firstChild);
        }
    }

    const setBoardGrid = (boardElement, playerBoard) => {
        boardElement.style.gridTemplateRows = `repeat(${playerBoard.height}, 1fr)`;
        boardElement.style.gridTemplateColumns = `repeat(${playerBoard.width}, 1fr)`;
    }

    // Using version above instead
    // const setBoardGrid = (numRows, numColumns) => {
    //     document.querySelectorAll(".game-board").forEach(board => {
    //         board.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
    //         board.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
    //     })
    // }

    const renderBoard = (boardElement, player) => {
        //clearContainer(boardElement);
        setBoardGrid(boardElement, player.gameboard);
        this.tileSize = document.documentElement.clientHeight / 18;
        if(player.isTurn){
            boardElement.classList.add("active");
            boardElement.classList.remove("idle");
        } else {
            boardElement.classList.add("idle");
            boardElement.classList.remove("active");
        }
        const board = player.gameboard.viewBoard();
        const numRows = player.gameboard.height;
        const numCols = player.gameboard.width;
        for(let row = 0; row < numRows; row++){
            for(let col = 0; col < numCols; col++){
                let tile = document.createElement("div");
                tile.style.width = this.tileSize + "px";
                tile.style.height = this.tileSize + "px";
                tile.dataset["row"] = row;
                tile.dataset["column"] = col;
                tile.classList.add("tile");
                if (board[row][col]){
                    if(board[row][col].isHit){
                        tile.classList.add("damaged");
                            // Ugly but gets the job done.
                            // Adds classes to damaged ships that tell where in the grid the other
                            // parts of the ship are located so I can style them differently.
                            // I suppose this wouldn't be necessary if gave GameBoard objects
                            // attributes that make it easier to tell where the rest of a ship is
                            // located.
                            try{
                                if((board[row-1][col] && player.isTurn) || board[row-1][col].isHit){
                                    tile.classList.add("up-one");
                                }
                            } catch (e) {}
                            try{
                                if((board[row+1][col] && player.isTurn) || board[row+1][col].isHit){
                                    tile.classList.add("down-one")
                                }
                            } catch (e) {}
                            try{
                                if((board[row][col+1] && player.isTurn) || board[row][col+1].isHit){
                                    tile.classList.add("right-one");
                                }
                            } catch (e) {}
                            try{
                                if((board[row][col-1] && player.isTurn) || board[row][col-1].isHit){
                                    tile.classList.add("left-one");
                                }
                            } catch (e) {}
                    } else {
                        if (player.isTurn){
                            tile.classList.add("ship");
                            // Ugly! But gets the job done, for now.
                            try{
                                if(board[row-1][col]){
                                    tile.classList.add("up-one");
                                }
                            } catch (e) {}
                            try{
                                if(board[row+1][col]){
                                    tile.classList.add("down-one")
                                }
                            } catch (e) {}
                            try{
                                if(board[row][col+1]){
                                    tile.classList.add("right-one");
                                }
                            } catch (e) {}
                            try{
                                if(board[row][col-1]){
                                    tile.classList.add("left-one");
                                }
                            } catch (e) {}
                        } else {
                            tile.classList.add("unknown");
                        }
                    }
                } else if (board[row][col] === false){
                    tile.classList.add("empty");
                } else {
                    tile.classList.add("unknown");
                }
                boardElement.appendChild(tile);
            }
        }
    }

    const renderBoards = (playerOne, playerTwo) => {
        if(playerOne.isTurn){
            this.playerOneElement.classList.add("is-turn");
            this.playerTwoElement.classList.remove("is-turn");

            this.playerOneElement.classList.remove("idle");
            this.playerTwoElement.classList.add("idle");
        } else {
            this.playerOneElement.classList.remove("is-turn");
            this.playerTwoElement.classList.add("is-turn");

            this.playerOneElement.classList.add("idle");
            this.playerTwoElement.classList.remove("idle");
        }
        // I have to remove and create new game boards because I was stacking drag and drop
        // event listeners on the same boards multiple times.
        // This is not a pleasant way to do this, but I'm not really concerned right now.
        let boardOne = this.playerOneElement.querySelector(".game-board");
        let boardTwo = this.playerTwoElement.querySelector(".game-board");
        this.playerOneElement.removeChild(boardOne);
        this.playerTwoElement.removeChild(boardTwo);

        boardOne = document.createElement('div');
        boardTwo = document.createElement('div');
        
        boardOne.classList.add("game-board");
        boardTwo.classList.add("game-board");

        this.playerOneElement.appendChild(boardOne);
        this.playerTwoElement.appendChild(boardTwo);

        renderBoard(boardOne, playerOne);
        renderBoard(boardTwo, playerTwo);
    }

    const rotateShip = (event) => {
        const ship = event.target;

        const horizontal = ship.dataset["horizontal"] == "true";
        ship.dataset["horizontal"] = ! horizontal;
        if(ship.dataset["horizontal"] == "true"){
            shortSide = "height";
            longSide = "width";
        } else {
            shortSide = "width";
            longSide = "height";
        }
        ship.style[shortSide] = this.tileSize + "px";
        ship.style[longSide] = (this.tileSize * parseInt(ship.dataset["size"])) + "px";
    }

    const renderShips = (playerOne, playerTwo, container) => {
        let activePlayer;
        if(playerOne.isTurn){
            activePlayer = playerOne;
        } else {
            activePlayer = playerTwo;
        }

        // Draw ships in the dock
        // Add callbacks to the ships
        // I just realized how effed this is gonna be with my current grid implementation.
        const ships = activePlayer.getUnplacedShips();
        for(let i = 0; i < ships.length; i++){
            let shipElement = document.createElement("div");
            shipElement.draggable = true;
            shipElement.dataset["size"] = ships[i];
            shipElement.dataset["horizontal"] = false;
            shipElement.classList.add("placeable-ship");
            shipElement.style.height = this.tileSize * ships[i] + 'px';
            shipElement.style.width = this.tileSize + 'px';
            shipElement.addEventListener("click", event => {
                rotateShip(event);
            });
            shipElement.addEventListener("drag", event  => {});
            shipElement.addEventListener("dragstart", event => {
                draggedShip = event.target;
            })
            //shipElement.addEventListener("ondrag");
            container.appendChild(shipElement);
        }
    }

    const clearDockButtons = () => {
        clearContainer(document.querySelector("#ship-placement-controls"));
        this.dockElement.classList.add("hidden");
    }

    const renderDocks = (playerOne, playerTwo, resetCB, randomizeCB, readyCB) => {
        let ships;
        if(playerOne.isTurn){
            ships = playerOne.unplacedShips;
            grid = this.playerOneElement.querySelector(".game-board");
            this.playerOneElement.classList.remove("hidden");
            this.playerTwoElement.classList.add("hidden");
        } else {
            ships = playerTwo.unplacedShips;
            grid = this.playerTwoElement.querySelector(".game-board");
            this.playerTwoElement.classList.remove("hidden");
            this.playerOneElement.classList.add("hidden");
        }
        this.dockElement.classList.remove("hidden");
        let container = this.dockElement.querySelector("#ship-container");
        // I realized that I kept adding callbacks to these buttons, so now I create new buttons
        // every time
        let buttonContainer = this.dockElement.querySelector("#ship-placement-controls");
        clearContainer(buttonContainer);
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset"
        resetButton.classList.add("reset-ships");
        resetButton.type = "button"
        const randomizeButton = document.createElement("button");
        randomizeButton.textContent = "Randomize";
        randomizeButton.classList.add("randomize-ships");
        randomizeButton.type = "button"
        const readyButton = document.createElement("button");
        readyButton.textContent = "Ready";
        readyButton.classList.add("ready-up");
        readyButton.type = "button"

        resetButton.addEventListener("click", (event) => {
            resetCB(playerOne, playerTwo);
        })
        randomizeButton.addEventListener("click", (event) => {
            randomizeCB(playerOne, playerTwo, ships);
        })
        readyButton.addEventListener("click", (event) => {
            if(readyCB(playerOne, playerTwo)){
            }
        })

        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(randomizeButton);
        buttonContainer.appendChild(readyButton);


        clearContainer(container);
        renderShips(playerOne, playerTwo, container);
    }

    const addShipPlacementListeners = (playerOne, playerTwo, callback) => {
        let gridElement, grid;
        if(playerOne.isTurn){
            gridElement = this.playerOneElement.querySelector(".game-board");
            grid = playerOne.gameboard;
        } else {
            gridElement = this.playerTwoElement.querySelector(".game-board");
            grid = playerTwo.gameboard;
        }
        gridElement.addEventListener("dragover", event => event.preventDefault());
        gridElement.addEventListener("dragenter", event => {
            if(!event.target.classList.contains("tile")){
                return;
            }
            const shipSize = draggedShip.dataset["size"];
            const horizontal = draggedShip.dataset["horizontal"] == "true";
            const targetTile = event.target;
            const row = parseInt(targetTile.dataset["row"]);
            const column = parseInt(targetTile.dataset["column"]);
            const coordArray = [];
            for(let offset = 0; offset < shipSize; offset++){
                if(horizontal){
                    coordArray.push([row, column + offset]);
                } else {
                    coordArray.push([row + offset, column]);
                }
            }
            let classString;
            if(coordArray.some(coordinates => !grid.validateCoordinates(...coordinates))){
                classString = "invalid-ship-placement";
            } else {
                classString = "valid-ship-placement";
            }
            let r, c;
            let tileElement;
            for(let i = 0; i < coordArray.length; i++){
                [r, c] = coordArray[i];
                tileElement = gridElement.querySelector(`[data-row="${r}"][data-column="${c}"]`)
                if(tileElement){
                    tileElement.classList.add(classString);
                }
            }
        });
        gridElement.addEventListener("dragexit", event => {
            gridElement.querySelectorAll(".invalid-ship-placement").forEach(tile => {
                tile.classList.remove("invalid-ship-placement");
            });
            gridElement.querySelectorAll(".valid-ship-placement").forEach(tile => {
                tile.classList.remove("valid-ship-placement");
            });
        });

        gridElement.addEventListener("drop", event => {
            event.preventDefault();
            // Note: I don't need to remove classes assigned from drag event handlers
            // ("(in)valid-ship-placement") when the ship is dropped on a valid tile
            // because that grid will be deleted and recreated anyway.
            if(event.target.classList.contains("valid-ship-placement")){
                const row = parseInt(event.target.dataset["row"]);
                const column = parseInt(event.target.dataset["column"]);
                const shipSize = parseInt(draggedShip.dataset["size"]);
                const horizontal = draggedShip.dataset["horizontal"] == "true";
                callback(playerOne, playerTwo, row, column, shipSize, horizontal);
            } else {
                gridElement.querySelectorAll(".invalid-ship-placement").forEach(tile => {
                    tile.classList.remove("invalid-ship-placement");
                })
            }
        });

        // gridElement.querySelectorAll(".tile.unknown").forEach(tile => {
        //     tile.addEventListener("dragover", event => event.preventDefault());
        //     tile.addEventListener("dragenter", event => {
        //         event.target.style.backgroundColor = "#ffffff";
        //     });
        // })
    }

    const addAttackListeners = (playerOne, playerTwo, callback) => {
        let board;
        if(playerOne.isTurn){
            board = this.playerTwoElement.querySelector(".game-board");
            board.querySelectorAll(".tile.unknown").forEach(tile => {
                tile.addEventListener("click", (event) => {
                    callback(playerOne, playerTwo, event);
                })
            })
        } else {
            board = this.playerOneElement.querySelector(".game-board");
            board.querySelectorAll(".tile.unknown").forEach(tile => {
                tile.addEventListener("click", (event) => {
                    callback(playerOne, playerTwo, event);
                })
            })
        }
    }

    const displayInstructions = (instructions) => {
        document.querySelector("#instructions").textContent = instructions;
    }

    const displayWinner = (winner, loser) => {
        this.gameOver.querySelector("#winner").textContent = winner.name + " wins!";
        this.gameOver.querySelector("#loser").textContent = "Sorry, " + loser.name + "...";
        this.gameOver.querySelector("#winner-stats").textContent = `${winner.name} fired ${winner.playHistory.length} shots`;
        this.gameOver.querySelector("#loser-stats").textContent = `${loser.name} fired ${loser.playHistory.length} shots`;
    }

    // Make the turn switch element automatically hide and unhide after the transitions
    // this.turnSwitch.addEventListener("transitionstart", event => {
    //     if(event.propertyName != "opacity"){
    //         return;
    //     }
    //     if(this.betweenTurns){
    //         event.target.classList.remove("hidden");
    //     }
    // });

    this.turnSwitch.addEventListener("transitionend", event => {
        if(event.propertyName != "opacity"){
            return;
        }
        // If this.betweenTurns is false that means the turnSwitch went from 100 opacity to 0,
        // and should be hidden so it is not read by screen readers and does not block user input
        if( ! this.betweenTurns){
            event.target.classList.add("hidden");
        }
    })

    return {
        showStartMenu,
        showGameUI,
        showTurnSwitch,
        hideTurnSwitch,
        showGameOver,
        switchSides,
        showPlayerElements,
        readPlayerInput,
        clearContainer,
        setBoardGrid,
        renderPlayerNames,
        renderBoard,
        renderBoards,
        renderDocks,
        clearDockButtons,
        addShipPlacementListeners,
        addAttackListeners,
        displayInstructions,
        displayWinner,
   };
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