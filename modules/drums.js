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
        }, 1000);

        sensorTag.on('disconnect', function () {
            clearInterval(checkInterval);
        });

    })
};
