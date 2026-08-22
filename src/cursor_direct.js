(() => {
  const style = document.createElement('style');
  style.id = 'direct-cursor-fix';
  style.textContent = `
    .cursor-dot, .star-trail { display: none !important; }
    .direct-cursor-dot {
      position: fixed !important;
      z-index: 2147483647 !important;
      width: 7px;
      height: 7px;
      margin: -3.5px 0 0 -3.5px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 9px #fff, 0 0 18px rgba(106,2,151,.75);
      pointer-events: none !important;
      transform: translate3d(-100px,-100px,0);
      will-change: transform;
      display: block !important;
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

  window.addEventListener('pointermove', move, { passive: true });
})();
