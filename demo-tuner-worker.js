self.onmessage = (event) => {
	const timeseries = event.data.timeseries
	const test_frequencies = event.data.test_frequencies
	const sample_rate = event.data.sample_rate
	const amplitudes = compute_correlations(timeseries, test_frequencies, sample_rate)
	self.postMessage({ "timeseries": timeseries, "frequency_amplitudes": amplitudes })
}

function compute_correlations(timeseries, test_frequencies, sample_rate) {
	const scale_factor = 2 * Math.PI / sample_rate;
	const amplitudes = test_frequencies.map(
		f => {
			const frequency = f.frequency;

			const accumulator = [ 0, 0 ];
			for (let t = 0; t < timeseries.length; t++) {
				accumulator[0] += timeseries[t] * Math.cos(scale_factor * frequency * t);
				accumulator[1] += timeseries[t] * Math.sin(scale_factor * frequency * t);
			}

			return accumulator;
		}
	)
	return amplitudes;
}
