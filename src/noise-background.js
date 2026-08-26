import "./Noise.css";

const patternRefreshInterval = 2;
const patternAlpha = 10;
const canvasSize = 1024;

function mountNoise() {
  if (document.querySelector(".noise-overlay")) return;

  const canvas = document.createElement("canvas");
  canvas.className = "noise-overlay";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.imageRendering = "pixelated";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let frame = 0;
  let animationId;

  const resize = () => {
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
  };

  const drawGrain = () => {
    const imageData = ctx.createImageData(canvasSize, canvasSize);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = patternAlpha;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  resize();
  drawGrain();

  const loop = () => {
    if (frame % patternRefreshInterval === 0) drawGrain();
    frame += 1;
    animationId = window.requestAnimationFrame(loop);
  };

  window.addEventListener("resize", resize);
  loop();

  window.addEventListener("beforeunload", () => {
    window.removeEventListener("resize", resize);
    window.cancelAnimationFrame(animationId);
  }, { once: true });
}

// This script is loaded before the React app so the noise layer exists
// alongside the LightRays/particle background from the very first paint.
mountNoise();
