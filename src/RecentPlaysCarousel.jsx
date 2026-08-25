import React, {useEffect, useMemo, useRef, useState} from "react";

const imageOf = (track) => {
  const images = Array.isArray(track?.image) ? track.image : [];
  return (images.find((image) => image?.size === "extralarge") || images.at(-1))?.["#text"] || "";
};
const artistOf = (track) => track?.artist?.["#text"] || track?.artist?.name || "Last.fm";

export default function RecentPlaysCarousel({tracks = []}) {
  const items = useMemo(() => tracks.slice(0, 15).map((track, index) => ({
    type: "track",
    key: `track-${index}-${track?.name || "unknown"}`,
    track,
    image: imageOf(track),
    artist: artistOf(track)
  })), [tracks]);

  const sequence = useMemo(() => [
    {type: "boundary", side: "start", key: "lastfm-start"},
    ...items,
    {type: "boundary", side: "end", key: "lastfm-end"}
  ], [items]);

  const [active, setActive] = useState(items.length ? 1 : 0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({pointerId: null, startX: 0, lastX: 0, distance: 0, moved: false, active: false});
  const suppressClick = useRef(false);
  const clamp = (value) => Math.min(Math.max(value, 0), sequence.length - 1);

  useEffect(() => {
    setActive(items.length ? 1 : 0);
  }, [items.length]);

  const move = (delta) => setActive((value) => clamp(value + delta));

  const openLastFm = (event, url) => {
    if (suppressClick.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick.current = false;
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const resetDrag = () => {
    drag.current.active = false;
    drag.current.pointerId = null;
    setDragging(false);
  };

  const onDown = (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      distance: 0,
      moved: false,
      active: true
    };
    suppressClick.current = false;
    setDragging(true);
  };

  const onMove = (event) => {
    const state = drag.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    // If the pointer leaves the carousel's actual box while dragging, end the
    // gesture immediately. This prevents document-level pointer events from
    // making the carousel keep following the mouse after the button is released.
    const rect = event.currentTarget.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) {
      suppressClick.current = state.moved;
      resetDrag();
      return;
    }

    const delta = event.clientX - state.lastX;
    if (!delta) return;

    state.distance += Math.abs(delta);
    state.lastX = event.clientX;

    if (state.distance >= 110) {
      move(state.lastX < state.startX ? 1 : -1);
      state.distance = 0;
      state.startX = state.lastX;
      state.moved = true;
      suppressClick.current = true;
    }
  };

  const onUp = (event) => {
    const state = drag.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    if (state.moved || Math.abs(event.clientX - state.startX) > 12) {
      suppressClick.current = true;
    }
    resetDrag();
  };

  const onCancel = (event) => {
    if (drag.current.pointerId !== event.pointerId) return;
    suppressClick.current = drag.current.moved;
    resetDrag();
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  };

  if (!items.length) return <div className="recent-carousel-empty">No recent plays yet.</div>;

  return <div
    className={`recent-carousel${dragging ? " is-dragging" : ""}`}
    tabIndex={0}
    onPointerDown={onDown}
    onPointerMove={onMove}
    onPointerUp={onUp}
    onPointerCancel={onCancel}
    onLostPointerCapture={onCancel}
    onKeyDown={onKeyDown}
    aria-label="Recent plays carousel"
  >
    <div className="recent-carousel-track">
      {sequence.map((item, index) => {
        const offset = index - active;
        const distance = Math.abs(offset);
        const activeCard = offset === 0;
        const boundary = item.type === "boundary";
        const style = {
          transform: `translateX(calc(-50% + ${offset * 175}px)) translateZ(${activeCard ? 35 : Math.max(0, 12 - distance * 4)}px) rotateY(${offset * -19}deg) rotateX(${activeCard ? 0 : Math.min(10, distance * 3)}deg) scale(${activeCard ? 1 : Math.max(.62, 1 - distance * .12)})`,
          opacity: distance > 3 ? 0 : boundary && distance > 2 ? .25 : Math.max(.25, 1 - distance * .2),
          zIndex: 30 - distance
        };

        if (boundary) {
          return <article
            className={`recent-card is-boundary${activeCard ? " is-active" : ""}`}
            style={style}
            key={item.key}
            aria-hidden={!activeCard}
          >
            <div className="lastfm-boundary-card">
              <div className="lastfm-logo" aria-label="Last.fm">last<span>.fm</span></div>
              <small>{item.side === "start" ? "FIRST SCROBBLE" : "END OF SCROBBLES"}</small>
            </div>
          </article>;
        }

        const trackUrl = item.track?.url || `https://www.last.fm/user/drva7/music/${encodeURIComponent(item.artist)}/_/${encodeURIComponent(item.track?.name || "")}`;

        return <a
          className={`recent-card${activeCard ? " is-active" : ""}`}
          style={style}
          key={item.key}
          href={trackUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.track?.name || "Unknown track"} by ${item.artist} on Last.fm`}
          onClick={(event) => openLastFm(event, trackUrl)}
          draggable={false}
        >
          <div className="recent-art-wrap">
            <div
              className="recent-cd"
              style={{backgroundImage: item.image ? `url(${item.image})` : "none"}}
              aria-hidden="true"
            />
            {!item.image && <div className="recent-cover-fallback">Last.fm</div>}
          </div>
          <div className="recent-card-info">
            <strong>{item.track?.name || "Unknown track"}</strong>
            <small>{item.artist}</small>
            <span>{item.track?.["@attr"]?.nowplaying === "true" ? "NOW PLAYING" : "RECENT"}</span>
          </div>
        </a>;
      })}
    </div>
    <div className="recent-carousel-hint">drag to explore · swipe on mobile</div>
  </div>;
}
