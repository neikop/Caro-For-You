const express = require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socket(server);

app.use('/', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 1858;
server.listen(port, () => {
    console.log('Server is running on: ' + port);
});

let users = [];
let names = {};
let status = {};

const initGame = {
    history: [{
        squares: Array(9).fill(null),
        lastMove: -1
    }],
    stepNumber: 0,
    startGame: false,
    endGame: false,
    xIsNext: true,
    xPlayer: 0,
    oPlayer: 0
};
let Game = Object.assign({}, initGame);

io.on('connection', (socket) => {

    socket.on('join', () => {
        socket.emit('update-game', Game);
    })

    socket.on('login', (player) => {
        socket.username = player.username;

        users.push(socket.id);
        names[socket.id] = player.username;
        status[socket.id] = false;
        io.emit('update-user', { users, names, status });

        socket.emit('welcome');
        socket.broadcast.emit('someone-joined', player.username);
    });

    socket.on('disconnect', () => {
        const index = users.indexOf(socket.id);
        if (index >= 0) users.splice(index, 1);
        delete names[socket.id];
        delete status[socket.id];
        io.emit('update-user', { users, names, status });

        if (users.size === 0
            || socket.id === Game.xPlayer
            || socket.id === Game.oPlayer) {
            Game = Object.assign({}, initGame);
            io.emit('update-game', Game);
        }

        if (socket.username) {
            socket.broadcast.emit('someone-left', socket.username);
        }
    });

    socket.on('message', (message) => {
        socket.broadcast.emit('message', message);
    });

    socket.on('change-ready', (isReady) => {
        status[socket.id] = isReady;
        io.emit('update-user', { users, names, status });
    });

    socket.on('change-start', (startGame) => {
        Game = Object.assign({}, initGame);
        Game.startGame = startGame;
        Game.xPlayer = socket.id;
        users.forEach((usercode) => {
            if (status[usercode] && usercode !== socket.id) {
                Game.oPlayer = usercode;
            }
        });
        io.emit('update-game', Game);
    });

    socket.on('click-square', (game) => {
        Game.history = game.history;
        Game.stepNumber = game.stepNumber;
        Game.startGame = game.startGame;
        Game.endGame = game.endGame;
        Game.xIsNext = game.xIsNext;
        socket.broadcast.emit('update-game', Game);
    });

    socket.on('jump-to', (game) => {
        Game.stepNumber = game.stepNumber;
        Game.startGame = game.startGame;
        Game.endGame = game.endGame;
        Game.xIsNext = game.xIsNext;
        socket.broadcast.emit('update-game', Game);
    });

});