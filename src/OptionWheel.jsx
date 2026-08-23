import React, { useRef, useState, useCallback, useEffect } from 'react';
import './OptionWheel.css';

const DEFAULT_ITEMS = ['Ambient', 'House', 'Techno', 'Jazz', 'Lo-Fi', 'Synthwave', 'Trance', 'Funk', 'Disco', 'Hip-Hop', 'Chillwave', 'Drum & Bass'];

const OptionWheel = ({
  items = DEFAULT_ITEMS, defaultSelected = 3, onChange, textColor = '#a6a6a6', activeColor = '#ffffff', side = 'left', fontSize = 3,
  spacing = 1.4, curve = 1, tilt = 6, blur = 2, fade = 0.25, minOpacity = 0.05, smoothing = 200, inset = 80,
  loop = false, draggable = true, soundUrl = '', soundVolume = 0.5, className = ''
}) => {
  const rootRef = useRef(null), itemRefs = useRef([]), posRef = useRef(defaultSelected), targetRef = useRef(defaultSelected);
  const rafRef = useRef(null), lastRef = useRef(0), cfgRef = useRef({}), onChangeRef = useRef(onChange), selectedRef = useRef(defaultSelected);
  const wheelVelocityRef = useRef(0), wheelFrameRef = useRef(null), dragRef = useRef(null), dragMovedRef = useRef(false);
  const audioRef = useRef(null), audioUrlRef = useRef(''), lastTickRef = useRef(0), pageSyncLockRef = useRef(0), pageSyncRafRef = useRef(null);
  const pageIndexRef = useRef(defaultSelected);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected), [isDragging, setIsDragging] = useState(false);

  const remPx = typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;
  onChangeRef.current = onChange;
  cfgRef.current = { count: items.length, items, rowH: Math.max(fontSize * spacing * remPx, 1), curve, tilt, blur, fade, minOpacity, side, loop, smoothing, draggable, soundUrl, soundVolume };

  const runFrame = useCallback(now => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05); lastRef.current = now;
    const cfg = cfgRef.current, tau = Math.max(cfg.smoothing, 1) / 1000, k = 1 - Math.exp(-dt / tau);
    const target = targetRef.current, cur = posRef.current;
    let next = cur + (target - cur) * k; if (Math.abs(target - next) < 0.001) next = target; posRef.current = next;
    const els = itemRefs.current, n = cfg.count, mirror = cfg.side === 'right' ? -1 : 1, tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;
    for (let i = 0; i < n; i++) {
      const el = els[i]; if (!el) continue;
      let d = i - next;
      if (cfg.loop && n > 1) { d = ((d % n) + n) % n; if (d > n / 2) d -= n; }
      const dist = Math.abs(d); let x = 0, y = d * cfg.rowH, rot = 0;
      if (R > 0) { const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad)); y = R * Math.sin(ang); x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve; rot = (mirror * ang * 180) / Math.PI; }
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
    }
    rafRef.current = Math.abs(target - next) < 0.001 ? null : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); lastRef.current = performance.now(); rafRef.current = requestAnimationFrame(runFrame); }, [runFrame]);

  const playTick = useCallback(() => {
    const { soundUrl, soundVolume } = cfgRef.current; if (!soundUrl) return;
    const now = performance.now(); if (now - lastTickRef.current < 55) return; lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== soundUrl) { audioRef.current = new Audio(soundUrl); audioRef.current.preload = 'auto'; audioUrlRef.current = soundUrl; }
    audioRef.current.volume = Math.min(Math.max(soundVolume, 0), 1); audioRef.current.currentTime = 0; audioRef.current.play()?.catch(() => {});
  }, []);

  const applyTarget = useCallback((value, snap = false, source = 'user') => {
    const cfg = cfgRef.current; if (!cfg.count) return;
    let v = value; if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0)); if (snap) v = Math.round(v);
    targetRef.current = v;
    const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
    if (idx !== selectedRef.current) {
      selectedRef.current = idx; setSelectedIndex(idx); if (source !== 'scroll') onChangeRef.current?.(idx, cfg.items[idx]); playTick();
    }
    startLoop();
  }, [startLoop, playTick]);

  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const onWheel = e => {
      e.preventDefault();
      const cfg = cfgRef.current, delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      wheelVelocityRef.current += Math.max(-1.25, Math.min(1.25, delta / Math.max(cfg.rowH, 1)));
      wheelVelocityRef.current = Math.max(-2.5, Math.min(2.5, wheelVelocityRef.current));
      const consume = () => {
        const velocity = wheelVelocityRef.current;
        if (Math.abs(velocity) < 0.002) { wheelFrameRef.current = null; return; }
        wheelVelocityRef.current *= 0.78;
        applyTarget(targetRef.current + velocity * 0.055, false, 'user');
        wheelFrameRef.current = requestAnimationFrame(consume);
      };
      if (wheelFrameRef.current == null) wheelFrameRef.current = requestAnimationFrame(consume);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); if (wheelFrameRef.current != null) cancelAnimationFrame(wheelFrameRef.current); };
  }, [applyTarget]);

  useEffect(() => {
    if (!items.length) return;
    let ticking = false;
    const syncToPage = () => {
      ticking = false;
      if (performance.now() < pageSyncLockRef.current) return;
      const center = window.innerHeight * 0.38;
      let best = pageIndexRef.current;
      let bestTop = -Infinity;
      // Use a directional section threshold instead of nearest-distance selection.
      // This prevents the selected item from bouncing between two sections while a
      // smooth page scroll is settling around their boundary.
      items.forEach((item, index) => {
        const id = String(item).trim().toLowerCase().replace(/\s+/g, '-');
        const section = document.getElementById(id);
        if (!section) return;
        const top = section.getBoundingClientRect().top;
        if (top <= center && top > bestTop) { bestTop = top; best = index; }
      });
      if (best !== pageIndexRef.current) {
        pageIndexRef.current = best;
        applyTarget(best, true, 'scroll');
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      pageSyncRafRef.current = requestAnimationFrame(syncToPage);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncToPage);
    const initial = setTimeout(syncToPage, 0);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncToPage);
      clearTimeout(initial);
      if (pageSyncRafRef.current != null) cancelAnimationFrame(pageSyncRafRef.current);
    };
  }, [items, applyTarget]);

  const handlePointerDown = useCallback(e => { if (!cfgRef.current.draggable) return; dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId }; dragMovedRef.current = false; setIsDragging(true); }, []);
  const handlePointerMove = useCallback(e => { const drag = dragRef.current; if (!drag) return; const dy = e.clientY - drag.y; if (!dragMovedRef.current && Math.abs(dy) > 4) { dragMovedRef.current = true; rootRef.current?.setPointerCapture(drag.id); } if (dragMovedRef.current) applyTarget(drag.start - dy / cfgRef.current.rowH, false, 'user'); }, [applyTarget]);
  const handlePointerEnd = useCallback(() => { if (!dragRef.current) return; dragRef.current = null; setIsDragging(false); if (dragMovedRef.current) applyTarget(targetRef.current, true, 'user'); }, [applyTarget]);
  const handleItemClick = useCallback(index => { if (dragMovedRef.current) return; const cfg = cfgRef.current, cur = targetRef.current; let d = index - (((cur % cfg.count) + cfg.count) % cfg.count); if (cfg.loop && cfg.count > 1) { if (d > cfg.count / 2) d -= cfg.count; else if (d < -cfg.count / 2) d += cfg.count; } pageSyncLockRef.current = performance.now() + 900; pageIndexRef.current = index; applyTarget(cur + d, true, 'user'); }, [applyTarget]);
  const handleKeyDown = useCallback(e => { let delta = null; if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1; else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1; if (delta == null) return; e.preventDefault(); pageSyncLockRef.current = performance.now() + 900; pageIndexRef.current = Math.max(0, Math.min(items.length - 1, selectedRef.current + delta)); applyTarget(Math.round(targetRef.current) + delta, true, 'user'); }, [applyTarget, items.length]);

  useEffect(() => { applyTarget(targetRef.current, false, 'scroll'); }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget]);
  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); if (wheelFrameRef.current != null) cancelAnimationFrame(wheelFrameRef.current); if (pageSyncRafRef.current != null) cancelAnimationFrame(pageSyncRafRef.current); rafRef.current = null; wheelFrameRef.current = null; pageSyncRafRef.current = null; audioRef.current?.pause(); }, []);

  return <div ref={rootRef} role="listbox" tabIndex={0} aria-label="Site navigation" className={`option-wheel${side === 'right' ? ' option-wheel--right' : ''}${isDragging ? ' option-wheel--dragging' : ''}${className ? ` ${className}` : ''}`} style={{ '--ow-text-color': textColor, '--ow-active-color': activeColor, '--ow-font-size': `${fontSize}rem`, '--ow-inset': `${inset}px` }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd} onKeyDown={handleKeyDown}>
    {items.map((label, index) => <div key={`${label}-${index}`} ref={el => { itemRefs.current[index] = el; }} role="option" aria-selected={selectedIndex === index} className={`option-wheel__item${selectedIndex === index ? ' option-wheel__item--selected' : ''}`} onClick={() => handleItemClick(index)}>{label}</div>)}
  </div>;
};

export default OptionWheel;
