const express = require('express');
const path = require('path');
const logger = require('morgan');
const http = require('http');
const websocket = require("ws");

const statTracker = require("./models/statTracker");
const Game = require("./models/game");

const Messages = require("./public/javascripts/messages");
const Constants = require("./public/javascripts/constants");
const { broadcast, constructMsg } = require("./public/javascripts/util");

const router = require('./routes/router');

if (process.argv.length < 3) {
  console.log("You need to provide a port number as an argument");
  process.exit(1);
}
const port = process.argv[2];

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

const server = http.createServer(app);
const wss = new websocket.Server({ server });
const sockets = {};

let game = new Game(statTracker.gamesInitialized++);
let conId = 0;

wss.on("connection", function connection(socket) {
  const con = socket;
  con.id = conId++;
  sockets[con.id] = game;
  
  if (!game.whitePlayer) {
    game.whitePlayer = con;
  } else {
    game.bluePlayer = con;
    game.hasStarted = true;
    game.turn = Constants.startingPlayer === Constants.colorA ? game.whitePlayer : game.bluePlayer;
    broadcast(game, JSON.stringify(Messages.MSG_START_GAME));
    game = new Game(statTracker.gamesInitialized++);
  }

  console.log(sockets);

  con.on("message", function(jsonmsg) {
    const msg = JSON.parse(jsonmsg);

    const currentGame = sockets[con.id];
    const isWhitePlayer = currentGame.whitePlayer === con ? true : false;

    if (msg.type === Messages.TYPE_DROP_DISK && currentGame.hasStarted) {
      const column = msg.data;
      const color = isWhitePlayer ? Constants.colorA : Constants.colorB;
      if (currentGame.turn !== con) return con.send(constructMsg(Messages.MSG_ERROR, "Not your turn"));
      try {
        var disk = currentGame.board.addDisk(column, color);
      } catch (e) {
        return con.send(constructMsg(Messages.MSG_ERROR, e));
      }

      broadcast(currentGame, constructMsg(Messages.MSG_UPDATE_BOARD, currentGame.board.cells));

      currentGame.turn = isWhitePlayer ? currentGame.bluePlayer : currentGame.whitePlayer;

      const winCondition = currentGame.board.checkWinCondition(disk);
      switch(winCondition) {
        case Constants.colorA:
          console.log(`${Constants.colorA} won`);
          break;
        case Constants.colorB:
          console.log(`${Constants.colorB} won`);
          break;
        case Constants.draw:
          console.log("It\'s a draw");
          break;
      }
    }
  });

  con.on("close", function(code) {

  });
})

server.listen(port);
