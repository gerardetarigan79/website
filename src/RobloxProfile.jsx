import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ExternalLink } from "lucide-react";
import "./RobloxProfile.css";

function formatNumber(value) { return value == null ? "—" : new Intl.NumberFormat("en-US").format(value); }
function formatDate(value) { if (!value) return "—"; return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value)); }
function relativeTime(value) {
  if (!value) return "last seen unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "last seen unavailable";
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}
function cdnUrl(hash) {
  if (!hash) return "";
  let i = 31;
  for (let t = 0; t < Math.min(38, hash.length); t += 1) i ^= hash[t].charCodeAt(0);
  return `https://t${((i % 8) + 8) % 8}.rbxcdn.com/${hash}`;
}

function RobloxAvatar3D({ model, fallbackUrl, loading }) {
  const mountRef = useRef(null);
  const [failed, setFailed] = React.useState(false);
  useEffect(() => {
    if (!model?.objUrl || !model?.mtlUrl) return undefined;
    setFailed(false);
    const mount = mountRef.current;
    if (!mount) return undefined;
    let disposed = false; let frame; let avatar;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(25, 1, 0.01, 1000);
    camera.position.set(0, 1.72, 8.75); camera.lookAt(0, 1.72, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 0); mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 1.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.9); fill.position.set(-4, 3, 4); scene.add(fill);
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => { const hash = url.split("?")[0].split("/").pop(); return hash && /^[A-Za-z0-9_-]{24,}$/.test(hash) ? cdnUrl(hash) : url; });
    const mtlLoader = new MTLLoader(manager); const objLoader = new OBJLoader(manager);
    const load = async () => {
      try {
        const materials = await new Promise((resolve, reject) => mtlLoader.load(model.mtlUrl, resolve, undefined, reject));
        if (disposed) return; materials.preload();
        Object.values(materials.materials || {}).forEach((material) => { material.transparent = false; material.alphaTest = 0.01; material.side = THREE.DoubleSide; if (material.color) material.color.setRGB(1, 1, 1); material.needsUpdate = true; });
        objLoader.setMaterials(materials);
        avatar = await new Promise((resolve, reject) => objLoader.load(model.objUrl, resolve, undefined, reject));
        if (disposed) return;
        const rawBox = new THREE.Box3().setFromObject(avatar); const rawSize = rawBox.getSize(new THREE.Vector3());
        avatar.scale.setScalar(3.45 / Math.max(rawSize.y, 0.001));
        const box = new THREE.Box3().setFromObject(avatar); const center = box.getCenter(new THREE.Vector3());
        avatar.position.x -= center.x; avatar.position.z -= center.z; avatar.position.y -= box.min.y; avatar.position.y -= 0.08; scene.add(avatar);
      } catch (_) { if (!disposed) setFailed(true); }
    };
    const resize = () => { const width = Math.max(1, mount.clientWidth); const height = Math.max(1, mount.clientHeight); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
    resize(); const observer = new ResizeObserver(resize); observer.observe(mount); load();
    const animate = () => { if (disposed) return; frame = requestAnimationFrame(animate); if (avatar) avatar.rotation.y += 0.0035; renderer.render(scene, camera); }; animate();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); if (avatar) avatar.traverse((child) => { if (child.geometry) child.geometry.dispose(); if (child.material) (Array.isArray(child.material) ? child.material : [child.material]).forEach((material) => { Object.values(material).forEach((value) => { if (value?.isTexture) value.dispose(); }); material.dispose(); }); }); renderer.dispose(); renderer.domElement.remove(); };
  }, [model]);
  return <div className="roblox-avatar-stage">{model?.objUrl && model?.mtlUrl && !failed ? <div ref={mountRef} className="roblox-canvas" /> : fallbackUrl ? <img src={fallbackUrl} alt="Roblox avatar" className="roblox-fallback" /> : null}{loading && <div className="roblox-avatar-loading"><span /></div>}</div>;
}

export default function RobloxProfile() {
  const [data, setData] = React.useState(null); const [loading, setLoading] = React.useState(true);
  useEffect(() => { let alive = true; const load = async () => { try { const response = await fetch("/api/roblox", { cache: "no-store" }); const next = await response.json(); if (alive) setData(next); } catch (_) { if (alive) setData({ error: true }); } finally { if (alive) setLoading(false); } }; load(); const interval = setInterval(load, 30000); return () => { alive = false; clearInterval(interval); }; }, []);
  const user = data?.user; const presence = data?.presence || {}; const online = [1, 2, 3].includes(presence.type);
  const statusText = presence.type === 2 ? "in-game" : presence.type === 3 ? "in studio" : online ? "online" : "offline";
  return (
    <div className="roblox-profile cursor-target">
      <div className="roblox-profile-head"><div><span className="kicker">ROBLOX PROFILE</span><div className="roblox-name-row"><h2>{user?.username || "Draven"}</h2><span className={`roblox-status-dot ${online ? "online" : "offline"}`} /><span className="roblox-status-text">{loading ? "loading" : statusText}</span></div>{user?.displayName && user.displayName !== user.username && <small className="roblox-display-name">{user.displayName}</small>}</div><a className="roblox-open" href={`https://www.roblox.com/users/${user?.id || "331953010"}/profile`} target="_blank" rel="noreferrer">open profile <ExternalLink size={10} /></a></div>
      <div className="roblox-profile-body"><RobloxAvatar3D model={data?.model} fallbackUrl={data?.avatarUrl} loading={loading} /><div className="roblox-details"><div className="roblox-stats"><div><b>{formatNumber(data?.friends)}</b><span>Friends</span></div><div><b>{formatNumber(data?.followers)}</b><span>Followers</span></div><div><b>{formatNumber(data?.badges)}</b><span>Badges</span></div></div><div className="roblox-created"><span>Account created</span><strong>{formatDate(user?.created)}</strong></div></div></div>
    </div>
  );
}
