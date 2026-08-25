import React, {useEffect, useMemo, useRef, useState} from "react";

const MAX_TRACKS = 15;
const STEP = 175;

const imageOf = (track) => {
  const images = Array.isArray(track?.image) ? track.image : [];
  return (images.find((image) => image?.size === "extralarge") || images.at(-1))?.["#text"] || "";
};
const artistOf = (track) => track?.artist?.["#text"] || track?.artist?.name || "Unknown artist";

export default function RecentPlaysCarousel({tracks = []}) {
  const items = useMemo(() => tracks.slice(0, MAX_TRACKS).map((track, index) => ({
    key: `track-${index}-${track?.name || "unknown"}`,
    track,
    image: imageOf(track),
    artist: artistOf(track)
  })), [tracks]);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [tilt, setTilt] = useState({x: 0, y: 0});
  const drag = useRef({pointerId: null, startX: 0, lastX: 0, distance: 0, active: false});

  useEffect(() => {
    setActive((value) => Math.min(value, Math.max(0, items.length - 1)));
  }, [items.length]);

  const move = (delta) => setActive((value) => Math.min(Math.max(value + delta, 0), Math.max(0, items.length - 1)));
  const resetDrag = (element, pointerId) => {
    try { if (element?.hasPointerCapture?.(pointerId)) element.releasePointerCapture(pointerId); } catch {}
    drag.current.active = false;
    drag.current.pointerId = null;
    setDragging(false);
  };

  const onPointerDown = (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch {}
    drag.current = {pointerId: event.pointerId, startX: event.clientX, lastX: event.clientX, distance: 0, active: true};
    setDragging(true);
  };
  const onPointerMove = (event) => {
    const state = drag.current;
    if (!state.active || state.pointerId !== event.pointerId) return;
    const delta = event.clientX - state.lastX;
    if (!delta) return;
    state.distance += Math.abs(delta);
    state.lastX = event.clientX;
    if (state.distance >= 110) {
      move(state.lastX < state.startX ? 1 : -1);
      state.distance = 0;
      state.startX = state.lastX;
    }
  };
  const onPointerUp = (event) => {
    if (drag.current.pointerId === event.pointerId) resetDrag(event.currentTarget, event.pointerId);
  };
  const onPointerCancel = (event) => {
    if (drag.current.pointerId === event.pointerId) resetDrag(event.currentTarget, event.pointerId);
  };
  const onMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
    setTilt({x: -y * 10, y: x * 10});
  };
  const onMouseLeave = () => setTilt({x: 0, y: 0});
  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  };

  if (!items.length) return <div className="rpc-empty">No recent plays yet.</div>;

  return <div className={`rpc${dragging ? " is-dragging" : ""}`} tabIndex={0} onKeyDown={onKeyDown} aria-label="Recent plays carousel">
    <style>{`
      .rpc{position:relative;width:100%;padding:10px 0 4px;overflow:hidden;isolation:isolate;outline:none;mask-image:linear-gradient(to right,transparent 0%,black 15%,black 85%,transparent 100%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 15%,black 85%,transparent 100%)}
      .rpc-track{position:relative;height:390px;perspective:1100px;transform-style:preserve-3d;overflow:visible}
      .rpc-card{position:absolute;left:50%;top:0;width:280px;text-align:center;transform-style:preserve-3d;transition:transform .42s cubic-bezier(.22,.75,.2,1),opacity .32s ease;pointer-events:none}
      .rpc-drag-zone{width:280px;height:280px;position:relative;margin:0 auto;pointer-events:auto;cursor:grab;touch-action:none}
      .rpc.is-dragging .rpc-drag-zone{cursor:grabbing}
      .rpc-cd{position:absolute;inset:0;border-radius:50%;background-color:#17171c;background-position:center;background-size:cover;background-repeat:no-repeat;box-shadow:0 20px 35px rgba(0,0,0,.42);animation:rpc-spin 18s linear infinite;will-change:transform;transform:rotateX(var(--rpc-x,0deg)) rotateY(var(--rpc-y,0deg));transition:filter .2s ease}
      .rpc-cd::before{content:"";position:absolute;left:50%;top:50%;width:54px;height:54px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at center,#08080b 0 17%,#24242a 18% 31%,#0b0b0f 32% 42%,rgba(0,0,0,.78) 43% 100%);box-shadow:0 0 0 2px rgba(255,255,255,.12),inset 0 0 8px rgba(0,0,0,.9);z-index:3}
      .rpc-cd::after{content:"";position:absolute;inset:5%;border-radius:50%;background:repeating-radial-gradient(circle,transparent 0 22px,rgba(255,255,255,.035) 23px 24px);mix-blend-mode:screen;pointer-events:none}
      @keyframes rpc-spin{from{rotate:0deg}to{rotate:360deg}}
      .rpc-cover-fallback{position:absolute;inset:0;border-radius:50%;display:grid;place-items:center;background:#17171c;color:#777}
      .rpc-info{margin:14px auto 0;width:100%;padding:0 12px;line-height:1.25}
      .rpc-info strong,.rpc-info small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rpc-info strong{font-size:13px;font-weight:700;color:#eee}
      .rpc-info small{margin-top:5px;font-size:10px;color:#777}
      .rpc-boundary{position:absolute;top:105px;width:150px;height:150px;display:grid;place-items:center;opacity:.2;pointer-events:none;filter:blur(.1px);z-index:1}
      .rpc-boundary.left{left:-32px}.rpc-boundary.right{right:-32px}
      .rpc-boundary-card{width:110px;height:110px;border:1px solid rgba(255,255,255,.08);border-radius:50%;display:grid;place-items:center;align-content:center;gap:5px;background:rgba(255,255,255,.018);box-shadow:0 12px 30px rgba(0,0,0,.22)}
      .rpc-boundary-card b{font-size:13px;color:#aaa}.rpc-boundary-card small{font-size:7px;letter-spacing:.12em;color:#666}
      .rpc-hint{text-align:center;margin-top:-2px;font-size:9px;letter-spacing:.08em;color:#555;text-transform:lowercase}
      .rpc-empty{padding:24px;text-align:center;color:#666;font-size:12px}
      @media(max-width:700px){.rpc-track{height:350px}.rpc-drag-zone,.rpc-card{width:240px}.rpc-drag-zone,.rpc-cd{height:240px}.rpc-boundary{display:none}}
    `}</style>
    <div className="rpc-boundary left"><div className="rpc-boundary-card"><b>last.fm</b><small>START</small></div></div>
    <div className="rpc-boundary right"><div className="rpc-boundary-card"><b>last.fm</b><small>END</small></div></div>
    <div className="rpc-track">
      {items.map((item, index) => {
        const offset = index - active;
        const distance = Math.abs(offset);
        const activeCard = offset === 0;
        const x = offset * STEP;
        const opacity = distance > 3 ? 0 : Math.max(.2, 1 - distance * .22);
        return <article className="rpc-card" key={item.key} style={{transform:`translateX(calc(-50% + ${x}px)) translateZ(${activeCard ? 35 : Math.max(0, 14 - distance * 4)}px) rotateY(${offset * -18}deg) scale(${activeCard ? 1 : Math.max(.66, 1 - distance * .1)})`,opacity,zIndex:30-distance}}>
          <div className="rpc-drag-zone" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onMouseMove={activeCard ? onMouseMove : undefined} onMouseLeave={activeCard ? onMouseLeave : undefined} title="Drag to browse recent plays">
            <div className="rpc-cd" style={{backgroundImage:item.image?`url(${item.image})`:"none",...(activeCard?{"--rpc-x":`${tilt.x}deg`,"--rpc-y":`${tilt.y}deg`}: {})}} aria-label={`${item.track?.name || "Unknown track"} CD`} />
            {!item.image&&<div className="rpc-cover-fallback">♪</div>}
          </div>
          <div className="rpc-info"><strong>{item.track?.name || "Unknown track"}</strong><small>{item.artist}</small></div>
        </article>;
      })}
    </div>
    <div className="rpc-hint">drag the CD to explore recent plays</div>
  </div>;
}
