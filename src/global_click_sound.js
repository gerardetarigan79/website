const clickAudio = new Audio('/audio/soundclick.mp3');
clickAudio.preload = 'auto';

let audioContext = null;
let gainNode = null;

function getAudioGraph() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 5;
    gainNode.connect(audioContext.destination);
  }
  return { audioContext, gainNode };
}

function playClickSound() {
  try {
    const { audioContext, gainNode } = getAudioGraph();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});

    const sound = clickAudio.cloneNode(true);
    sound.volume = 1;
    const source = audioContext.createMediaElementSource(sound);
    source.connect(gainNode);
    sound.currentTime = 0;
    sound.play().catch(() => {});
  } catch (_) {
    // Gracefully ignore browsers that block or don't support Web Audio.
  }
}

window.addEventListener('click', (event) => {
  if (event.button !== 0) return;

  // OptionWheel already has its own click sound; avoid playing it twice.
  if (event.target instanceof Element && event.target.closest('.option-wheel-sidebar')) return;

  playClickSound();
});
