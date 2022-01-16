(function setup() {
  const socket = new WebSocket("ws://localhost:3000");

  const gameObj = {}; // gameObj stores some values needed in the game
  gameObj.previousBoard = new Array(Constants.columns).fill(null, 0, Constants.columns); // What did the previous board look like
  gameObj.previousBoard.forEach((val, index, arr) => arr[index] = new Array(Constants.rows).fill(null, 0, Constants.rows));
  gameObj.ongoing = false; // Has the game started
  gameObj.player = null; // What is the players color
  gameObj.board = document.querySelector('.mainBoard'); // Main board Node (the grid with holedSquares)
  gameObj.overlay = document.querySelector('.overlay'); // Overlay Node
  gameObj.playerA = document.querySelector('.player1'); // Player 1 aside node
  gameObj.playerB = document.querySelector('.player2'); // Player 2 aside node
  gameObj.whiteDisk = gameObj.playerA.querySelector('.whiteDisk'); // White disk Node
  gameObj.blueDisk = gameObj.playerB.querySelector('.blueDisk'); // Blue disk Node
  gameObj.turn = false; // Whether it is the players turn
  gameObj.timer = null; // The interval of the timer
  gameObj.timeTaken = {};
  gameObj.timeTaken[Constants.colorA] = 0;
  gameObj.timeTaken[Constants.colorB] = 0;

  const columns = document.querySelectorAll(".column");
  
  // Add eventlistener to all columns;
  [...columns].forEach((val, index) => {
    val.addEventListener("click", () => {
      if (gameObj.turn && gameObj.ongoing) { // Player should only be able to drop a disk if it his turn and the game has started (also checked server-side)
        socket.send(util.constructMsg(Messages.MSG_DROP_DISK, index));
      }
    });
  });

  socket.onopen = function () {}
  
  socket.onmessage = function (message) {
    const msg = JSON.parse(message.data);
    // It may be better to use a switch statement
    if (msg.type === Messages.TYPE_UPDATE_BOARD) {
      updateBoardHandler(msg.data);
    } 
    else if (msg.type === Messages.TYPE_ERROR) {
      console.error(msg.data);
    } 
    else if (msg.type === Messages.TYPE_START_GAME) {
      gameObj.ongoing = true;
      gameObj.overlay.querySelector('.messageBox').classList.remove("growAndShrink");
      switchTurns(gameObj.player === Constants.colorA); // Set turn
      showMessage(true, `An opponnent has been found!\nYou are playing as ${gameObj.player}`); // Draw message
      setTimeout(startGameHandler, 5000);
    } 
    else if (msg.type === Messages.TYPE_SET_PLAYER) {
      gameObj.player = msg.data;
    } 
    else if (msg.type === Messages.TYPE_GAME_RESULT) {
      clearInterval(gameObj.timer);
      if (msg.data === Constants.draw) {
        //Draw
        showMessage(true, "It's a draw :/");
      } else if (msg.data === Constants.disconnect) {
        // Won by disconnect
        showMessage(true, "You won because your opponent disconnected");
      } else if (msg.data === gameObj.player) {
        //Won
        showMessage(true, "You Won!! :)");
      } else {
        //Lost
        showMessage(true, "You Lost :(");
      }
    }
  }

  socket.onerror = function () {
    console.error("Something went wrong!");
  }

  socket.onclose = function () {
    console.warn("Connection closed...");
    gameObj.ongoing = false;
    setTimeout(() => {
      window.location.replace(window.location.origin);
    }, 5000)
  }
  
  /**
   * Draws the new board and switches turn
   * @param {Object[][]} cells 
   */
  function updateBoardHandler(cells) {
    // Calculate the difference between the previous board state and the new one
    let diff = cells;
    diff = diff.reduce((res, val, column) => {
        let b = val.reduce((res2, val2, row) => {
            if (!util.objectEquals(gameObj.previousBoard[column][row], val2)) res2.push({color: val2?.color, column: column, row: row});
            return res2;
        }, []);
        res = [...res, ...b];
        return res;
    }, []);

    if (diff.length > 1) console.error("Board out of sync"); // There should only be a one disk difference

    const newDisk = diff[0];
    switchTurns(newDisk.color !== gameObj.player); // Switch the turn based on the color of the new disk

    gameObj.previousBoard = cells;

    for(let i = 0; i < cells.length; i++) {
      const rows = columns[i].querySelectorAll(".holedSquare");
      for(let j = 0; j < cells[i].length; j++) {
        // If there is no disk in this cell, continue
        if (!cells[i][j]) continue;
        // Remove all children as a precaution
        if (rows[Constants.rows - 1 - j].firstChild) {
          rows[Constants.rows - 1 - j].removeChild(rows[Constants.rows - 1 - j].firstChild);
        }
        // Add all the disks back
        rows[Constants.rows - 1 - j].appendChild(
          cells[i][j].color === "white" ?
          gameObj.whiteDisk.cloneNode(true) :
          gameObj.blueDisk.cloneNode(true)
          // You have to clone, otherwise the same Node will just be switched places
        );
        if (newDisk.column === i && newDisk.row === j) {
          // The new disk should get a falling animation
          rows[Constants.rows - 1 - j].firstChild.classList.add('animation');
        }
      }
    }
  }

  /**
   * Switch the turn and active class based on whether it is the players turn
   * @param {Boolean} isPlayerTurn 
   */
  function switchTurns (isPlayerTurn) {
    if (isPlayerTurn) {
      gameObj.board.classList.add("active");
      gameObj.turn = true;
      gameObj.player === Constants.colorA ? gameObj.whiteDisk.classList.add("activePlayer") : gameObj.blueDisk.classList.add("activePlayer")
      gameObj.player === Constants.colorA ? gameObj.blueDisk.classList.remove("activePlayer") : gameObj.whiteDisk.classList.remove("activePlayer")
    } else {
      gameObj.board.classList.remove("active");
      gameObj.turn = false;
      gameObj.player !== Constants.colorA ? gameObj.whiteDisk.classList.add("activePlayer") : gameObj.blueDisk.classList.add("activePlayer")
      gameObj.player !== Constants.colorA ? gameObj.blueDisk.classList.remove("activePlayer") : gameObj.whiteDisk.classList.remove("activePlayer")
    }

    const color = !gameObj.turn ? 
        gameObj.player :
        gameObj.player === Constants.colorA ? Constants.colorB : Constants.colorA; 
    gameObj.timeTaken[color] = 0;
    color === Constants.colorA ? gameObj.playerA.dataset.timeTaken = 0 : gameObj.playerB.dataset.timeTaken = 0;
  }

  /**
   * Update the timer
   */
  function updateTime () {
    const ds = gameObj.board.dataset;
    ds.secondsPassed = ds?.secondsPassed !== void 0 ? parseInt(ds.secondsPassed) + 1 : 0;
    if (parseInt(ds.secondsPassed) === 60) { ds.secondsPassed = 0; }
    if (parseInt(ds.secondsPassed) < 10) { ds.secondsPassed = "0" + ds.secondsPassed; }
    if (ds.secondsPassed == 0 ) { ds.minutesPassed = ds?.minutesPassed !== void 0 ? parseInt(ds.minutesPassed) + 1 : "0"; }
  }

  function showMessage (showOverlay, msg = null) {
    const message = gameObj.overlay.querySelector(".message");
    if (showOverlay) {
      gameObj.overlay.classList.remove('hide');
    } else {
      gameObj.overlay.classList.add('hide');
    }
    if (msg) {
      message.innerText = msg;
    }
  }

  function startGameHandler() {
    let i = 0;
    gameObj.timer = setInterval(() => {
      if (i++ % 10 == 0) updateTime(); // Run every tenth call, so every second
      const color = gameObj.turn ? 
        gameObj.player :
        gameObj.player === Constants.colorA ? Constants.colorB : Constants.colorA; 
      const time = (gameObj.timeTaken[color] += .1).toFixed(1);
      if (parseFloat(time) > 30) {
        socket.close();
        showMessage(true, "You took to long, so you have been disconnected");
        setTimeout(() => {
          window.location.replace(window.location.origin);
        }, 5000);
      }
      color === Constants.colorA ? gameObj.playerA.dataset.timeTaken = time : gameObj.playerB.dataset.timeTaken = time;
    }, 100); // Start timer

    showMessage(false); // Hide overlay
  }
})();