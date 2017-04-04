const filters = {
	'hue': 0,
	'blur': 0
}

const MIDI = {
	// loop through inputs iterator and assign onMessage handler
	setup: (midi) => {
		console.log('[DemoMidi] We have MIDI!', midi)

		if(!midi.inputs.size) {
			console.warn('[DemoMidi] No MIDI devices connected')
			return
		}

		let inputs = midi.inputs.values()

		for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
			input.value.onmidimessage = MIDI.onMessage
		}
	},

	// on MIDI message received
	onMessage: (message) => {
		// console.log(message)
		let [type, note, value] = message.data

		// pitch bend control, set hue rotate value
		if(type === 224) {
			filters.hue = value

		// modulation control, set blur value
		} else if(type === 176 && note === 1) {
			filters.blur = value / 25;
		}

		uraljsLogo.style['-webkit-filter'] = `hue-rotate(${filters.hue}deg) blur(${filters.blur}px)`;
	},

	error: () => {
		console.log('[DemoMidi] There was an error requesting MIDI access');
	}
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DemoMidi] init')
	if (!navigator.requestMIDIAccess) {
		console.warn('[DemoMidi] Your browser does not support Web MIDI :(');
		return;
	}

	navigator.requestMIDIAccess().then(MIDI.setup, MIDI.error);
});
