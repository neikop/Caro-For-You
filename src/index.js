import express from 'express';
import path from 'path';
import http from 'http';
import socket from 'socket.io';

let app = express();
let server = http.createServer(app);
let io = socket(server);

app.use(express.static(path.join(__dirname, 'public')));

let port = 1858;
server.listen(port, () => {
    console.log('Listening on *:' + port);
})

var userNumber = 0;
var colorMap = {};

io.on('connection', function (socket) {
    socket.on('make code', (code) => {
        userNumber++;
        if (userNumber == 1) colorMap[code] = '#C00000'; // red
        if (userNumber == 2) colorMap[code] = '#0000C0'; // blue
        if (userNumber > 2) colorMap[code] = '#000000'; // black
    })

    socket.on('make color', (data) => {
        data.color = colorMap[data.code];
        io.emit('print message', (data));
    });

    socket.on('disconnection', () => {
        userNumber--;
    });
});