import React, {useEffect, useMemo, useRef, useState} from "react";

const imageOf = (track) => {
  const images = Array.isArray(track?.image) ? track.image : [];
  return (images.find((image) => image?.size === "extralarge") || images.at(-1))?.["#text"] || "";
};
const artistOf = (track) => track?.artist?.["#text"] || track?.artist?.name || "Last.fm";

export default function RecentPlaysCarousel({tracks = []}) {
  const items = useMemo(() => tracks.slice(0, 15).map((track, index) => ({
    type: "track", key: `track-${index}-${track?.name || "unknown"}`, track,
    image: imageOf(track), artist: artistOf(track)
  })), [tracks]);
  const sequence = useMemo(() => [
    {type: "boundary", side: "start", key: "lastfm-start"}, ...items,
    {type: "boundary", side: "end", key: "lastfm-end"}
  ], [items]);
  const [active, setActive] = useState(items.length ? 1 : 0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({startX: 0, lastX: 0});
  const clamp = (value) => Math.min(Math.max(value, 0), sequence.length - 1);
  useEffect(() => { setActive(items.length ? 1 : 0); }, [items.length]);
  const move = (delta) => setActive((value) => clamp(value + delta));
  const onDown = (event) => { drag.current = {startX: event.clientX, lastX: event.clientX}; setDragging(true); event.currentTarget.setPointerCapture?.(event.pointerId); };
  const onMove = (event) => { if (!dragging) return; const delta = event.clientX - drag.current.lastX; if (Math.abs(delta) > 24) { move(delta < 0 ? 1 : -1); drag.current.lastX = event.clientX; } };
  const onKeyDown = (event) => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); };
  if (!items.length) return <div className="recent-carousel-empty">No recent plays yet.</div>;
  return <div className={`recent-carousel${dragging ? " is-dragging" : ""}`} tabIndex={0} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)} onKeyDown={onKeyDown} aria-label="Recent plays carousel">
    <div className="recent-carousel-track">
      {sequence.map((item, index) => {
        const offset = index - active, distance = Math.abs(offset), activeCard = offset === 0, boundary = item.type === "boundary";
        const style = {transform: `translateX(calc(-50% + ${offset * 175}px)) translateZ(${activeCard ? 35 : Math.max(0, 12 - distance * 4)}px) rotateY(${offset * -19}deg) rotateX(${activeCard ? 0 : Math.min(10, distance * 3)}deg) scale(${activeCard ? 1 : Math.max(.62, 1 - distance * .12)})`, opacity: distance > 3 ? 0 : boundary && distance > 2 ? .25 : Math.max(.25, 1 - distance * .2), zIndex: 30 - distance};
        return <article className={`recent-card${activeCard ? " is-active" : ""}${boundary ? " is-boundary" : ""}`} style={style} key={item.key} aria-hidden={!activeCard}>
          {boundary ? <div className="lastfm-boundary-card"><div className="lastfm-logo" aria-label="Last.fm">last<span>.fm</span></div><small>{item.side === "start" ? "FIRST SCROBBLE" : "END OF SCROBBLES"}</small></div> : <>
            <div className="recent-art-wrap"><div className="recent-cd" style={{backgroundImage: item.image ? `url(${item.image})` : "none"}}/><div className="recent-cover">{item.image ? <img src={item.image} alt="" draggable="false"/> : <div className="recent-cover-fallback">Last.fm</div>}</div></div>
            <div className="recent-card-info"><strong>{item.track?.name || "Unknown track"}</strong><small>{item.artist}</small><span>{item.track?.["@attr"]?.nowplaying === "true" ? "NOW PLAYING" : "RECENT"}</span></div>
          </>}
        </article>;
      })}
    </div><div className="recent-carousel-hint">drag to explore · swipe on mobile</div>
  </div>;
}
