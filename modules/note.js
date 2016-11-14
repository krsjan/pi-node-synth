const shell = require('shelljs')

const PERIOD = 500;

var notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function play(x, y, z) {

    x = Math.abs(x) * 2000;
    y = Math.abs(y) * 2000;
    z = Math.abs(z) * 1000;

    var command = 'play -n synth 3 sine ' + x + ' sine ' + y + ' sine ' + z + ' brownnoise';
    shell.exec(command, {async: true});

}

function run(sensorTag) {

    sensorTag.enableAccelerometer(function (error) {
        if (error) {
            console.log("Accelerometer Error :", error);
        }
    });

    sensorTag.setAccelerometerPeriod(PERIOD, function (error) {
        console.log("Accelerometer Error :", error);
    });

    setInterval(function () {

        sensorTag.readAccelerometer(function (error, x, y, z) {
            if (error) {
                console.error(error);
            }

            play(x, y, z);

        });

    }, PERIOD);

    sensorTag.on('disconnect', function () {
        clearInterval(checkInterval);
    });

}


module.exports = function (sensorTag) {
    run(sensorTag);
};