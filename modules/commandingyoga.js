var shell = require('shelljs')

var fork = require('child_process').fork;
var sequencerProcess = fork('./sequencer-process.js');

module.exports = function (sensorTag) {
    var lastCoordinate = {x: 0, y: 0, z: 0};
    
    sensorTag.enableGyroscope(function(error) {
        if (error)
          console.log("Accelerometer Error: " + error);
    });

    var checkInterval = setInterval(function() {
        sensorTag.readGyroscope(function(error, x, y, z) {
            // console.log("Read accelerometer (" + (lastCoordinate.x - x) + ", " + (lastCoordinate.y - y) + ", " + (lastCoordinate.z - z) + ")");

            var stuffToSay = [];
            var weight = 0.5;
            var threshold = 15;

            if (lastCoordinate.x * weight - x * weight < -threshold) {
                stuffToSay.push("Up");
            }
            if (lastCoordinate.x * weight - x * weight > threshold) {
                stuffToSay.push("Down");
            }
            if (lastCoordinate.y * weight - y * weight < -threshold) { 
                stuffToSay.push("Backward");
            }
            if (lastCoordinate.y * weight - y * weight > threshold) {
                stuffToSay.push("Forward");
            }
            if (lastCoordinate.z * weight - z * weight < -threshold) {
                stuffToSay.push("Right");
            }
            if (lastCoordinate.z * weight - z * weight > threshold) {
                stuffToSay.push("Left");
            }

            var phrases = [
              "Stop it",
              "Not cool",
              "Please stop it",
              "No",
              "Slower",
              "Be nice",
              "Be gentle",
              "What the fuck are you doing",
              "Oh yes",
            ];

            if (stuffToSay.length == 1) {
                // shell.exec("say " + stuffToSay, { async: true });
            }
            else if (stuffToSay.length == 3) {
              shell.exec("say " + (phrases[Math.floor(Math.random() * phrases.length)]));
            }

            lastCoordinate = {
              x: x * weight + lastCoordinate.x * weight, 
              y: y * weight + lastCoordinate.y * weight,
              z: z * weight * lastCoordinate.z * weight
            };
        });

        // sensorTag.readLuxometer(function(error, lux) { console.log("Read (" + sensorTag.id + ") " + lux); });
    }, 500);

    sensorTag.on('disconnect', function () {
        clearInterval(checkInterval);
    });
};
