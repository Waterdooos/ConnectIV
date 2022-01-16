const Board = require("./board");

class Game {
  constructor(id) {
    this.id = id;
    this.board = new Board();
    this.whitePlayer = null;
    this.bluePlayer = null;
    this.hasStarted = false;
    this.turn = null;
  }
}

module.exports = Game;