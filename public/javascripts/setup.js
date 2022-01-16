(function setup() {
  const socket = new WebSocket("ws://localhost:3000");

  // gameObj stores some values needed in the game
  const gameObj = {};
  gameObj.previousBoard = new Array(Constants.columns).fill(null, 0, Constants.columns);
  gameObj.previousBoard.forEach((val, index, arr) => arr[index] = new Array(Constants.rows).fill(null, 0, Constants.rows));
  gameObj.ongoing = false;
  gameObj.player = null;
  gameObj.whiteDisk = document.querySelector('.whiteDisk');
  gameObj.blueDisk = document.querySelector('.blueDisk');

  const columns = document.querySelectorAll(".column");
  
  // Add eventlistener to all columns;
  [...columns].forEach((val, index) => {
    val.addEventListener("click", () => {
      if (gameObj.ongoing) {
        socket.send(util.constructMsg(Messages.MSG_DROP_DISK, index));
      }
    });
  });

  socket.onopen = function () {}
  
  socket.onmessage = function (message) {
    const msg = JSON.parse(message.data);
    // May have been better to use a switch statement
    if (msg.type === Messages.TYPE_UPDATE_BOARD) {
      drawBoard(msg.data);
    } else if (msg.type === Messages.TYPE_ERROR) {
      console.error(msg.data);
    } else if (msg.type === Messages.TYPE_START_GAME) {
      gameObj.ongoing = true;
    } else if (msg.type === Messages.TYPE_SET_PLAYER) {
      gameObj.player = msg.data;
    } else if (msg.type === Messages.TYPE_GAME_RESULT) {
      if (msg.data === Constants.draw) {
        //Draw
      } else if (msg.data === gameObj.player) {
        //Won
      } else {
        //Lost
      }
    }
  }

  socket.onerror = function () {}

  socket.onclose = function () {}
  
  function drawBoard(cells) {
    // Calculate the difference between the previous board state and the new one
    let diff = cells;
    diff = diff.reduce((res, val, index) => {
        let b = val.reduce((res2, val2, index2) => {
            if (!util.objectEquals(gameObj.previousBoard[index][index2], val2)) res2.push({column: index, row: index2});
            return res2;
        }, []);
        res = [...res, ...b];
        return res;
    }, []);

    if (diff.length > 1) console.error("Board out of sync");

    gameObj.previousBoard = cells;

    for(let i = 0; i < cells.length; i++) {
      const rows = columns[i].querySelectorAll(".holedSquare");
      for(let j = 0; j < cells[i].length; j++) {
        if (!cells[i][j]) continue;
        if (rows[Constants.rows - 1 - j].firstChild) {
          // Remove all children in case the client was tempering with it
          rows[Constants.rows - 1 - j].removeChild(rows[Constants.rows - 1 - j].firstChild);
        }
        rows[Constants.rows - 1 - j].appendChild(
          // Add all the 
          cells[i][j].color === "white" ?
          gameObj.whiteDisk.cloneNode(true) :
          gameObj.blueDisk.cloneNode(true)
        );
        if (diff[0].column === i && diff[0].row === j) {
          // The new disk should get a falling animation
          rows[Constants.rows - 1 - j].firstChild.classList.add('animation');
        }
      }
    }
  }
})();