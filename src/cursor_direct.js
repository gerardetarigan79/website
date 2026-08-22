(() => {
  const style = document.createElement('style');
  style.id = 'direct-cursor-fix';
  style.textContent = `
    .cursor-dot, .star-trail { display: none !important; }
    .direct-cursor-dot {
      position: fixed !important;
      z-index: 2147483647 !important;
      width: 7px !important;
      height: 7px !important;
      margin: -3.5px 0 0 -3.5px !important;
      border-radius: 50% !important;
      background: #fff !important;
      box-shadow: 0 0 9px #fff, 0 0 18px rgba(106,2,151,.75) !important;
      pointer-events: none !important;
      transform: translate3d(-100px,-100px,0) !important;
      opacity: 0 !important;
      visibility: hidden !important;
      will-change: transform, opacity !important;
    }
    .direct-cursor-dot.cursor-active {
      opacity: 1 !important;
      visibility: visible !important;
    }
    @media (max-width:700px) {
      .direct-cursor-dot { display:none !important; }
    }
  `;
  document.head.appendChild(style);

  const dot = document.createElement('div');
  dot.className = 'direct-cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  const move = (event) => {
    dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  };

  const activate = () => {
    dot.classList.add('cursor-active');
  };

  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', activate, { once: true, passive: true });
  window.addEventListener('keydown', activate, { once: true, passive: true });
})();
