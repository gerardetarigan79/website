function addF1SeasonCompletionLabel() {
  document.querySelectorAll('.f1-points .bar').forEach((bar) => {
    if (bar.querySelector('.f1-season-completion-label')) return;

    const label = document.createElement('span');
    label.className = 'f1-season-completion-label';
    label.textContent = 'F1 season completion';
    Object.assign(label.style, {
      position: 'absolute',
      left: 'calc(100% + 10px)',
      top: '50%',
      transform: 'translateY(-50%)',
      whiteSpace: 'nowrap',
      fontSize: '8px',
      fontWeight: '600',
      letterSpacing: '0.04em',
      color: '#8f8f98',
      opacity: '0.9',
      pointerEvents: 'none'
    });

    if (getComputedStyle(bar).position === 'static') bar.style.position = 'relative';
    bar.style.overflow = 'visible';
    bar.appendChild(label);
  });
}

const observer = new MutationObserver(addF1SeasonCompletionLabel);
observer.observe(document.body, { childList: true, subtree: true });
addF1SeasonCompletionLabel();
