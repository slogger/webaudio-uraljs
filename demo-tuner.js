let C2 = 65.41; // C2 note, in Hz.
let notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
let test_frequencies = []
for (let i = 0; i < 30; i++) {
    let note_frequency = C2 * Math.pow(2, i / 12)
    let note_name = notes[i % 12];
    let note = {
        "frequency": note_frequency,
        "name": note_name,
        "color": "#4d9068"
    };
    let just_above = {
        "frequency": note_frequency * Math.pow(2, 1 / 48),
        "name": note_name,
        "color": "#904d4d"
    };
    let just_below = {
        "frequency": note_frequency * Math.pow(2, -1 / 48),
        "name": note_name,
        "color": "#a9b33a"
    };
    test_frequencies = test_frequencies.concat([just_below, note, just_above])
}

const initialize = () => {
    navigator.getUserMedia = navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia
    navigator.getUserMedia({
        "audio": true
    }, use_stream, () => {})
}

window.addEventListener("load", initialize);
let correlation_worker = new Worker("demo-tuner-worker.js");
correlation_worker.addEventListener("message", interpret_correlation_result);



function use_stream(stream) {
    let audio_context = new AudioContext();
    let microphone = audio_context.createMediaStreamSource(stream);
    window.source = microphone; // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=934512
    let script_processor = audio_context.createScriptProcessor(1024, 1, 1);
    script_processor.connect(audio_context.destination);
    microphone.connect(script_processor);
    let buffer = [];
    let sample_length_milliseconds = 100;
    let recording = true;
    // Need to leak this function into the global namespace so it doesn't get
    // prematurely garbage-collected.
    // http://lists.w3.org/Archives/Public/public-audio/2013JanMar/0304.html
    window.capture_audio = function(event) {
        if (!recording)
            return;
        buffer = buffer.concat(Array.prototype.slice.call(event.inputBuffer.getChannelData(0)));
        // Stop recording after sample_length_milliseconds.
        if (buffer.length > sample_length_milliseconds * audio_context.sampleRate / 1000) {
            recording = false;
            correlation_worker.postMessage({
                "timeseries": buffer,
                "test_frequencies": test_frequencies,
                "sample_rate": audio_context.sampleRate
            });
            buffer = [];
            setTimeout(function() {
                recording = true;
            }, 250);
        }
    };
    script_processor.onaudioprocess = window.capture_audio;
}

function interpret_correlation_result(event) {
    let timeseries = event.data.timeseries;
    let frequency_amplitudes = event.data.frequency_amplitudes;
    // Compute the (squared) magnitudes of the complex amplitudes for each
    // test frequency.
    let magnitudes = frequency_amplitudes.map(function(z) {
        return z[0] * z[0] + z[1] * z[1];
    });
    // Find the maximum in the list of magnitudes.
    let maximum_index = -1;
    let maximum_magnitude = 0;
    for (let i = 0; i < magnitudes.length; i++) {
        if (magnitudes[i] <= maximum_magnitude)
            continue;
        maximum_index = i;
        maximum_magnitude = magnitudes[i];
    }
    // Compute the average magnitude. We'll only pay attention to frequencies
    // with magnitudes significantly above average.
    let average = magnitudes.reduce(function(a, b) {
        return a + b;
    }, 0) / magnitudes.length;
    let confidence = maximum_magnitude / average;
    let confidence_threshold = 10; // empirical, arbitrary.
    if (confidence > confidence_threshold) {
        let dominant_frequency = test_frequencies[maximum_index];
        document.getElementById("note-name").textContent = dominant_frequency.name;
        document.getElementById("note-name").style.background = dominant_frequency.color;
    }
}
