/*jslint node: true, nomen: true, unparam: true, es5: true */

'use strict';
var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var url = require('url')
var shell = require('shelljs')
var SensorTag = require('sensortag')


var fork = require('child_process').fork,
    sequencerProcess = fork(__dirname + '/sequencer-process.js'),
    arpeggiatorProcess = fork(__dirname + '/arpeggiator-process.js'),
    
    port = 3000,
    chords = {
        'C': ['C3', 'E4', 'G3'],
        'Dm': ['D3', 'F4', 'A3'],
        'Em': ['E3', 'G4', 'B3'],
        'F': ['F3', 'A4', 'C3'],
        'G': ['G3', 'B4', 'D3'],
        'Am': ['A3', 'C5', 'E3']
    },
    pattern = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ],
    pageCounter = 0,
    pages = ['/synth.html', '/chords.html', '/drums.html'];

app.use('/static', express.static(__dirname + '/node_modules'));
app.use('/torsk.css', express.static(__dirname + '/torsk.css'));
app.use('/torsk.js', express.static(__dirname + '/torsk.js'));

app.get('/', function (req, res) {
    var page = pages[pageCounter];

    pageCounter = (pageCounter + 1) % 3;
    res.sendFile(__dirname + page);
});

app.get('/synth', function (req, res) {
    res.sendFile(__dirname + '/synth.html');
});

app.get('/chords', function (req, res) {
    res.sendFile(__dirname + '/chords.html');
});

app.get('/drums', function (req, res) {
    res.sendFile(__dirname + '/drums.html');
});

app.get('/sequence', function (req, res) {
    res.sendFile(__dirname + '/sequence.html');
});

io.on('connection', function (socket){
    console.log('a user connected');

    socket.on('play', function (msg) {
        var command = 'play -qn synth 2 pluck ' + msg;

        shell.exec(command, {async: true});
    });

    socket.on('chord', function (msg) {
        var chord = chords[msg],
            command = 'play -qn synth sin ' + chord[0] + ' sin ' + chord[1] + ' sin ' + chord[2] + ' delay 0 .01 .02 remix - fade 0 2.7 .1 norm -1';

        shell.exec(command, {async: true});
    });

    socket.on('playSequence', function (msg) {
        var p = msg;

        arpeggiatorProcess.send({
            pattern: p,
            start: true
        });
    });

    socket.on('stopSequence', function () {
        arpeggiatorProcess.send({
            stop: true
        });
    });

    socket.on('playDrumSequence', function (msg) {
        var p = msg;

        sequencerProcess.send({
            pattern: p,
            start: true
        });
    });

    socket.on('stopDrumSequence', function (msg) {
        sequencerProcess.send({
            stop: true
        });
    });

    socket.on('disconnect', function() {
        console.log('a user disconnected');
    });
});

app.get('/stop', function (req, res) {
    sequencerProcess.send({
        stop: true
    });
    res.status(200).send('Stopping sequencer');
});

http.listen(port, function () {
    console.log('Synth started at http://localhost:' + port + '/');
});

var hasTag = false;

function onDiscoverTag(sensorTag) {
  console.log("Found sensor tag!" + sensorTag);
  if (sensorTag.id !== '123cff34af9b48d3a25ab6b59c39894e')
    return;
  console.log("Connecting");

  sensorTag.connectAndSetUp(function(error) {
    if (error) {
        console.log("Failed to set up sensor tag. :(")
    }
    else {
        console.log("Connected to sensor tag!");

        var checkInterval = null;

        sensorTag.enableLuxometer(function(error) {
            if (error) {
                console.log("Luxometer Error: " + error);
            }

            checkInterval = setInterval(function() {
                sensorTag.readLuxometer(function(error, lux) {
                    // success
                    console.log("Luxometer (" + sensorTag.id + "): " + lux);
                    if (lux < 10) {
                      sequencerProcess.send({
                          pattern: [['kick'], ['snare'], ['kick'], ['kick'], ['snare'], [], [], []],
                          start: true
                      });
                    }
                    else {
                      sequencerProcess.send({
                          stop: true
                      });
                    }
                });
            }, 1000)
        });

        sensorTag.on('disconnect', function() {
            clearInterval(checkInterval);
        });
    }
  });
}

SensorTag.discoverAll(onDiscoverTag);
