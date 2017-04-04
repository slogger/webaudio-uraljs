(function() {
  'use strict'
  let audio = document.createElement('audio')
  audio.src = 'sounds/tag-audio-demo.mp3'

  let btnMute = document.getElementById('tag-audio-demo--mute')
  let playMute = document.getElementById('tag-audio-demo--play')
  let pauseMute = document.getElementById('tag-audio-demo--pause')

  btnMute.addEventListener('click', e => {
      audio.muted = !audio.muted
  })
  playMute.addEventListener('click', e => {
      audio.play()
  })
  pauseMute.addEventListener('click', e => {
      audio.pause()
  })
}())
