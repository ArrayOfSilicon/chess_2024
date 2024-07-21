const { createServer } = require("http");
const { Server } = require("socket.io");
const functions = require("./functions");
const express = require('express');


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

const httpServer = createServer(app);
const configOptions = {
  cors: {
    origin: "*",
  },
};
const io = new Server(httpServer, configOptions);
const CURRENT_CONNECTIONS = {};
let W_MATCH_DURATION_10 = [];
let W_MATCH_DURATION_15 = [];
let W_MATCH_DURATION_20 = [];
let CURRENT_MATCHES = [];

function wait_for_match(duration, socket) {
  switch (duration) {
    case 10:
      if (W_MATCH_DURATION_10.length > 0) {
        const opponent = W_MATCH_DURATION_10[0];
        let objectId = socket.id + "=>" + opponent.id;
        console.log(objectId);
        CURRENT_MATCHES.push({
          [objectId]: {
            player1: socket,
            player2: opponent,
          },
        });
        socket.emit('MATCH_START')
        opponent.socket.emit('MATCH_START')
        W_MATCH_DURATION_10.shift();
      } else {
        W_MATCH_DURATION_10.push({
          id: socket.id,
          socket: socket,
        });
      }
      break;
    case 15:
      if (W_MATCH_DURATION_15.length > 0) {
        const opponent = W_MATCH_DURATION_15[0];
        opponent.socket.emit("MATCH_START");
        W_MATCH_DURATION_15.shift();
      } else {
        W_MATCH_DURATION_15.push({
          id: socket.id,
          socket: socket,
        });
      }
      break;
    case 20:
      if (W_MATCH_DURATION_20.length > 0) {
        const opponent = W_MATCH_DURATION_20[0];
        opponent.socket.emit("MATCH_START");
        W_MATCH_DURATION_20.shift();
      } else {
        W_MATCH_DURATION_20.push({
          id: socket.id,
          socket: socket,
        });
      }
      break;
    default:
      break;
  }
}

function disconnectAndRemoveSocket(socket) {
  delete CURRENT_CONNECTIONS[socket.id];

  W_MATCH_DURATION_10 = W_MATCH_DURATION_10.filter((el) => el.id !== socket.id);

  W_MATCH_DURATION_15 = W_MATCH_DURATION_15.filter((el) => el.id !== socket.id);

  W_MATCH_DURATION_20 = W_MATCH_DURATION_20.filter((el) => el.id !== socket.id);
}

io.on("connection", (socket) => {
  CURRENT_CONNECTIONS[socket.id] = socket;
  functions.FireTotalPlayers(Object.keys(CURRENT_CONNECTIONS).length, io);
  socket.on("MATCH_REQUEST", (duration) => {
    wait_for_match(duration, socket);
  });
  socket.on("disconnect", () => {
    disconnectAndRemoveSocket(socket);
    functions.FireTotalPlayers(Object.keys(CURRENT_CONNECTIONS).length, io);
  });
});

httpServer.listen(3000);
