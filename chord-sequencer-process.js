var Sequencer = require('./sequencer').Sequencer,
	sequencer = new Sequencer()
		.bpm(25)
		.sounds({
			'C': ' -n synth sin C3 sin E4 sin G3 delay 0 .01 .02 remix - fade 0 2.7 .1 norm -1',
			'G': ' -n synth sin G3 sin B4 sin D3 delay 0 .01 .02 remix - fade 0 2.7 .1 norm -1',
			'Am': ' -n synth sin A3 sin C5 sin E3 delay 0 .01 .02 remix - fade 0 2.7 .1 norm -1',
			'Em': ' -n synth sin E3 sin G4 sin B3 delay 0 .01 .02 remix - fade 0 2.7 .1 norm -1',
			'F': ' -n synth sin F3 sin A4 sin C3 delay 0 .01 .02 remix - fade 0 2.7 .1 norm -1',
			'Dm': ' -n synth sin D3 sin F4 sin A3 delay 0 .01 .02 remix - fade 0 2.7 .1 norm -1'
		});

process.on('message', function(msg) {
	if (msg.bpm) {
		sequencer.bpm(msg.bpm);
	};
	if (msg.pattern) {
		sequencer.pattern(msg.pattern);
	};
	if (msg.start) {
		sequencer.start();
	};
	if (msg.stop) {
		sequencer.stop();
	};
});