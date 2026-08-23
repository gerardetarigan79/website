const clickAudio = new Audio('/audio/soundclick.mp3');
clickAudio.preload = 'auto';
clickAudio.volume = 1;

function playClickSound() {
  const sound = clickAudio.cloneNode(true);
  sound.volume = 1;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

window.addEventListener('click', (event) => {
  if (event.button !== 0) return;

  // OptionWheel already has its own click sound; avoid playing it twice.
  if (event.target instanceof Element && event.target.closest('.option-wheel-sidebar')) return;

  playClickSound();
});
