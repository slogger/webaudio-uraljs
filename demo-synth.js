let context = new AudioContext()
let onoffGain = context.createGain()
let lowPassFilter = context.createBiquadFilter()
lowPassFilter.type = 'lowpass'
lowPassFilter.frequency.value = 440
onoffGain.gain.value = 0
onoffGain.connect(lowPassFilter)
lowPassFilter.connect(context.destination)

let oscillators = []
let amGain = []
let numOsc = 4

oscillators.push(null)
amGain.push(null)

let oscillatorTypes = [
  "sine",
  "square",
  "sawtooth",
  "triangle"
]

for (let index = 0; index < numOsc; index++) {
      oscillators.push(context.createOscillator())
      amGain.push(context.createGain())

      oscillators[index + 1].type = oscillatorTypes[index]
      oscillators[index + 1].connect(amGain[index + 1])
      oscillators[index + 1].start()
 }

const toggleStartStop = start => {
  if (start) {
    onoffGain.gain.value = 0.5
  } else {
    onoffGain.gain.value = 0
  }
}

const changeFilterFreg = element => {
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
  // Get back to the frequency value between min and max.
  lowPassFilter.frequency.value = maxValue * multiplier;
  // element.nextElementSibling.innerHTML  = maxValue * multiplier + "Hz"
}

const changeFilterQuality = element => {
  lowPassFilter.Q.value = element.value * 30;
}

const freqChanged = element => {
  let val = parseFloat(element.value)
  oscillators[element.dataset.oscindex].frequency.value = val
  element.nextElementSibling.innerHTML = val + "Hz"
}

const selectionChanged = element => {
  let thisOsc = oscillators[element.dataset.oscindex]
  let thisGain = amGain[element.dataset.oscindex]
  let selectedVal = element.options[element.selectedIndex].value
  thisOsc.disconnect()
  thisGain.disconnect()
  thisOsc.connect(thisGain)
  if (selectedVal > 0 && selectedVal <= numOsc){
    let dest = amGain[selectedVal].gain
    thisGain.connect(dest)
  } else if (selectedVal == 5) {
    thisGain.connect(onoffGain)
  }
}
