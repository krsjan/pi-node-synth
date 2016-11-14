
var fork = require('child_process').fork;
var sequencerProcess = fork('./sequencer-process.js');

module.exports = function (sensorTag) {
    var checkInterval = setInterval(function () {
        sensorTag.readLuxometer(function (error, lux) {
            // success
            if (lux < 10) {
                console.log("Play the drums!");
                sequencerProcess.send({
                    pattern: [['kick'], ['snare'], ['kick'], ['kick'], ['snare'], [], [], []],
                    start: true
                });
            }
            else {
                console.log("No drums for you! >:(");
                sequencerProcess.send({
                    stop: true
                });
            }

        });
    }, 1000);

    sensorTag.on('disconnect', function () {
        clearInterval(checkInterval);
    });
};
