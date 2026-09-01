import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ExternalLink } from "lucide-react";
import "./RobloxProfile.css";

function formatNumber(value) {
  return value == null ? "—" : new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

function relativeTime(value) {
  if (!value) return "last seen unavailable";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

function RobloxAvatar3D({ modelUrl, fallbackUrl, loading }) {
  const mountRef = useRef(null);
  const [failed, setFailed] = React.useState(false);

  useEffect(() => {
    if (!modelUrl) return undefined;
    setFailed(false);

    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 1000);
    camera.position.set(0, 1.65, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x3b1b66, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(3, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8d5cff, 2.5);
    rim.position.set(-4, 3, -4);
    scene.add(rim);

    const loader = new GLTFLoader();
    let model;
    let frame;
    let disposed = false;

    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z) || 1;
        model.scale.setScalar(3.25 / maxSize);

        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = scaledBox.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y = -0.15;
        scene.add(model);
      },
      undefined,
      () => {
        if (!disposed) setFailed(true);
      },
    );

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.004;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      if (model) {
        model.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
              Object.values(material).forEach((value) => { if (value?.isTexture) value.dispose(); });
              material.dispose();
            });
          }
        });
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [modelUrl]);

  return (
    <div className="roblox-avatar-stage">
      {modelUrl && !failed ? <div ref={mountRef} className="roblox-canvas" /> : fallbackUrl ? <img src={fallbackUrl} alt="Roblox avatar" className="roblox-fallback" /> : null}
      {loading && <div className="roblox-avatar-loading"><span /></div>}
    </div>
  );
}

export default function RobloxProfile() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = await fetch("/api/roblox");
        const next = await response.json();
        if (alive) setData(next);
      } catch (_) {
        if (alive) setData({ error: true });
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  const user = data?.user;
  const presence = data?.presence || {};
  const online = presence.type === 1 || presence.type === 2 || presence.type === 3;
  const playing = presence.type === 2;
  const studio = presence.type === 3;
  const statusText = playing ? "in-game" : studio ? "in studio" : online ? "online" : "offline";
  const activityText = playing ? (presence.game?.name || "Roblox") : studio ? "Roblox Studio" : "offline";
  const activityLabel = playing ? "Currently playing" : studio ? "Currently in" : online ? "Online" : "Last played";
  const modelUrl = data?.modelUrl ? "/api/roblox-model" : "";

  return (
    <div className="roblox-profile cursor-target">
      <div className="roblox-profile-head">
        <div>
          <span className="kicker">ROBLOX PROFILE</span>
          <div className="roblox-name-row">
            <h2>{user?.username || "Draven"}</h2>
            <span className={`roblox-status-dot ${online ? "online" : "offline"}`} />
            <span className="roblox-status-text">{loading ? "loading" : statusText}</span>
          </div>
          {user?.displayName && user.displayName !== user.username && <small className="roblox-display-name">{user.displayName}</small>}
        </div>
        <a className="roblox-open" href={`https://www.roblox.com/users/${user?.id || "331953010"}/profile`} target="_blank" rel="noreferrer">open profile <ExternalLink size={10} /></a>
      </div>

      <div className="roblox-profile-body">
        <RobloxAvatar3D modelUrl={modelUrl} fallbackUrl={data?.avatarUrl} loading={loading} />

        <div className="roblox-details">
          <div className="roblox-activity">
            <span>{activityLabel}</span>
            <strong>{loading ? "loading…" : activityText}</strong>
            <small>{online ? "active now" : relativeTime(presence.lastOnline)}</small>
          </div>

          <div className="roblox-stats">
            <div><b>{formatNumber(data?.friends)}</b><span>Friends</span></div>
            <div><b>{formatNumber(data?.followers)}</b><span>Followers</span></div>
            <div><b>{data?.badgeStatus === "unavailable" ? "—" : formatNumber(data?.badges)}</b><span>Badges</span></div>
          </div>

          <div className="roblox-created">
            <span>Account created</span>
            <strong>{formatDate(user?.created)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
