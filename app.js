const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const http = require('http');
const websocket = require("ws");

const statTracker = require("./models/statTracker");
const Game = require("./models/game");

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

let game = new Game();
let conId = 0;

wss.on("connection", function connection(socket) {
  const con = socket;
  con.id = conId++;
  sockets[con.id] = game;
})

server.listen(port);
