var shell = require('shelljs')

function play(note) {

    var command = 'play -qn synth 2 pluck ' + note;
    shell.exec(command, {async: true});

}

module.exports = function (sensorTag) {

    sensorTag.enableLuxometer(function (error) {
        if (error) {
            console.log("Luxometer Error: " + error);
        }

        var checkInterval = setInterval(function () {
            sensorTag.readLuxometer(function (error, lux) {
                // success
                console.log("Luxometer (" + sensorTag.id + "): " + lux);

                if (lux < 10) {
                    play('C');
                } else {
                    return;
                }
            });
        }, 1000);

        sensorTag.on('disconnect', function () {
            clearInterval(checkInterval);
        });

    });
};