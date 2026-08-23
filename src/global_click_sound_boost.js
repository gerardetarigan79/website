const audioUrl = '/audio/soundclick.mp3';
let audioContext = null;
let gainNode = null;

function getAudioGraph() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 2;
    gainNode.connect(audioContext.destination);
  }
  return { audioContext, gainNode };
}

function playClick() {
  try {
    const graph = getAudioGraph();
    if (!graph) return;
    const { audioContext, gainNode } = graph;
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    const sound = new Audio(audioUrl);
    sound.preload = 'auto';
    sound.volume = 1;
    const source = audioContext.createMediaElementSource(sound);
    source.connect(gainNode);
    sound.play().catch(() => {});
  } catch (_) {}
}

window.addEventListener('click', (event) => {
  if (event.button !== 0) return;
  if (event.target instanceof Element && event.target.closest('.option-wheel-sidebar')) return;
  playClick();
});
