(function setup() {
  const socket = new WebSocket("ws://localhost:3000");
  socket.onopen = function () {}
  socket.onmessage = function (message) {
    console.log(message);
    const msg = JSON.parse(message.data);
    if (msg.type === Messages.TYPE_UPDATE_BOARD) {
      console.log(msg.data);
      drawBoard(msg.data);
    }
    if (msg.type === Messages.TYPE_ERROR) {
      console.error(msg.data);
    }
  }
  socket.onerror = function () {}
  socket.onclose = function () {}

  const columns = document.querySelectorAll(".column");
  
  [...columns].forEach((val, index) => {
    val.addEventListener("click", () => socket.send(util.constructMsg(Messages.MSG_DROP_DISK, index)));
  });
  
  function drawBoard(cells) {
    for(let i = 0; i < cells.length; i++) {
      const rows = columns[i].querySelectorAll(".holedSquare");
      for(let j = 0; j < cells[i].length; j++) {
        if (!cells[i][j]) continue;
        if (rows[Constants.rows - 1 - j].firstChild) {
          rows[Constants.rows - 1 - j].removeChild(rows[Constants.rows - 1 - j].firstChild);
        }
        rows[Constants.rows - 1 - j].appendChild(
          cells[i][j].color === "white" ?
          document.querySelector('.whiteDisk').cloneNode(true) :
          document.querySelector('.blueDisk').cloneNode(true)
        );
      }
    }
  }
})();