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

let game = new Game(0);
let conId = 0;

wss.on("connection", function connection(socket) {
  const con = socket;
  con.id = conId++;
  sockets[con.id] = game;
  
  if (!game.whitePlayer) {
    game.whitePlayer = con;

    con.send(constructMsg(Messages.MSG_SET_PLAYER, Constants.colorA));
  } else {
    game.bluePlayer = con;
    game.hasStarted = true;
    game.turn = Constants.startingPlayer === Constants.colorA ? game.whitePlayer : game.bluePlayer;

    con.send(constructMsg(Messages.MSG_SET_PLAYER, Constants.colorB));
    broadcast(game, constructMsg(Messages.MSG_START_GAME));

    game = new Game(++statTracker.ongoing + statTracker.total);
  }

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
          broadcast(currentGame, constructMsg(Messages.MSG_GAME_RESULT, Constants.colorA));
          statTracker.whiteWins++;
          break;
        case Constants.colorB:
          console.log(`${Constants.colorB} won`);
          broadcast(currentGame, constructMsg(Messages.MSG_GAME_RESULT, Constants.colorB));
          statTracker.blueWins++;
          break;
        case Constants.draw:
          console.log("It\'s a draw");
          broadcast(currentGame, constructMsg(Messages.MSG_GAME_RESULT, Constants.draw));
          break;
      }
      if (winCondition) {
        statTracker.total++;
        statTracker.ongoing--;
        currentGame.hasStarted = false // To make sure it is not counted again in the onclose method
        currentGame.whitePlayer.close();
        currentGame.bluePlayer.close();
      }
    }
  });

  con.on("close", function(code) {
    const currentGame = sockets[con.id];
    const isWhitePlayer = currentGame.whitePlayer === con ? true : false;
    if (isWhitePlayer) {
      currentGame.bluePlayer?.send(constructMsg(Messages.MSG_GAME_RESULT, Constants.disconnect));
      currentGame.bluePlayer?.close();
    } else if (currentGame.bluePlayer != null) {
      currentGame.whitePlayer.send(constructMsg(Messages.MSG_GAME_RESULT, Constants.disconnect));
      currentGame.whitePlayer.close();
    }
    if (currentGame.hasStarted) {
      statTracker.total++;
      statTracker.ongoing--;
      isWhitePlayer ? statTracker.blueWins++ : statTracker.whiteWins++;
      currentGame.hasStarted = false // To make sure it is not counted twice when other connection closes
    }
  });
})

server.listen(port);
