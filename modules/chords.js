module.exports = function(tag){
    var shell = require('shelljs');
    var lastX = 0;
    var lastY = 0;
    var lastZ = 0;

    var chords = {
        'C': ['C3', 'E4', 'G3'],
        'Dm': ['D3', 'F4', 'A3'],
        'Em': ['E3', 'G4', 'B3'],
        'F': ['F3', 'A4', 'C3'],
        'G': ['G3', 'B4', 'D3'],
        'Am': ['A3', 'C5', 'E3']
    };

    var currentChord = "";


    tag.connectAndSetup(enableAccelerometer);

    function enableAccelerometer(){
        tag.enableAccelerometer(function(){
            tag.notifyAccelerometer(listenAccelerometer());
        });
        tag.setAccelerometerPeriod(1000);
    }

    function listenAccelerometer(){
        tag.on("accelerometerChange", function(x, y, z){
            console.log("Change!");
            if(diffMoreThan5(lastX, x)){
                currentChord = "C";
            }

            if(diffMoreThan5(lastY, y)){
                currentChord = "Em";
            }

            if(diffMoreThan5(lastZ, z)){
                currentChord = "Am";
            }
            playSong();
            updateLastVals(x,y,z);
        });
    }

    function playSong(){
        var chord = chords[currentChord],
            command = 'play -qn synth sin ' + chord[0] + ' sin ' + chord[1] + ' sin ' + chord[2] + ' delay 0 .01 .02 remix - fade 0 1.7 .1 norm -1';

        shell.exec(command, {async: true});
    }

    function updateLastVals(x, y, z){
        lastX = x;
        lastY = y;
        lastZ = z;
    }

    function diffMoreThan5(oldVal, newVal){
        var diff = Math.abs(oldVal - newVal);
        if(diff > 2)
            console.log(diff);
        return diff > 2;
    }
};

