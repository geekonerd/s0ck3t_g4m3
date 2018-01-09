// create app
const express = require("express");
var app = require('express')(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server),
        ent = require('ent');

const min_players = 3;
const timeout = 30000;
var game_started = false;
var players = [];
var timeoutObj = false;
var game_locked = false;

// public files
app.use(express.static('public'));

// socket.io
io.sockets.on('connection', function (socket, nickname) {

    // start
    socket.on('start', function () {
        if (game_locked) {
            socket.emit('locked_game', game_started);
        } else {
            socket.emit('start', game_started);
        }
    });

    // create game
    socket.on('create_game', function (nickname) {
        if (!game_started) {
            game_started = ent.encode(nickname);
            players.push(ent.encode(nickname));
            timeoutObj = setTimeout(updateStatus, timeout);
            socket.emit('join_game', players);
        } else {
            socket.emit('create_game', game_started);
        }
        socket.broadcast.emit('create_game', game_started);
    });

    // join game
    socket.on('join_game', function (nickname) {
        if (-1 === players.indexOf(nickname)) {
            players.push(ent.encode(nickname));
            socket.emit('join_game', players);
            socket.broadcast.emit('refresh_game', players);
        } else {
            socket.emit('already_in_game', ent.encode(nickname));
        }
    });

    // stop game
    socket.on('stop', function (nickname) {
        if (game_started === nickname) {
            cleanStatus();
            socket.emit('stop_game');
            socket.broadcast.emit('stop_game');
        }
    });

    // clean status
    function cleanStatus() {
        game_started = false;
        players = [];
        timeoutObj = false;
        game_locked = false;
    }

    // update status
    function updateStatus() {
        if (players.length >= min_players) {
            game_locked = true;
            socket.emit('start_game', {
                ismaster: true, master: game_started, players: players});
            socket.broadcast.emit('start_game', {
                ismaster: false, master: game_started, players: players});
        } else {
            cleanStatus();
            socket.emit('end_game', min_players);
            socket.broadcast.emit('end_game', min_players);
        }
    }

});

// start server
server.listen(8080);