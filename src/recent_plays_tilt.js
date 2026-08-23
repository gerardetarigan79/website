const MAX_TILT = 12;
const MAX_SHIFT = 6;
const EASE = 0.12;

function setupRecentPlaysTilt() {
  const stage = document.querySelector(".record-stage");
  if (!stage || stage.dataset.tiltReady === "true") return !!stage;

  stage.dataset.tiltReady = "true";
  stage.style.transformOrigin = "center center";
  stage.style.willChange = "transform";

  let targetX = 0;
  let targetY = 0;
  let targetShiftX = 0;
  let targetShiftY = 0;
  let currentX = 0;
  let currentY = 0;
  let currentShiftX = 0;
  let currentShiftY = 0;
  let frame = 0;

  const render = () => {
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;
    currentShiftX += (targetShiftX - currentShiftX) * EASE;
    currentShiftY += (targetShiftY - currentShiftY) * EASE;

    stage.style.transform = `perspective(900px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg) translate3d(${currentShiftX.toFixed(2)}px, ${currentShiftY.toFixed(2)}px, 0)`;

    if (
      Math.abs(targetX - currentX) > 0.01 ||
      Math.abs(targetY - currentY) > 0.01 ||
      Math.abs(targetShiftX - currentShiftX) > 0.01 ||
      Math.abs(targetShiftY - currentShiftY) > 0.01
    ) {
      frame = requestAnimationFrame(render);
    } else {
      frame = 0;
    }
  };

  const move = (event) => {
    const rect = stage.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
    const y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));

    targetX = -y * MAX_TILT;
    targetY = x * MAX_TILT;
    targetShiftX = x * MAX_SHIFT;
    targetShiftY = y * MAX_SHIFT;

    if (!frame) frame = requestAnimationFrame(render);
  };

  const leave = () => {
    targetX = 0;
    targetY = 0;
    targetShiftX = 0;
    targetShiftY = 0;
    if (!frame) frame = requestAnimationFrame(render);
  };

  stage.addEventListener("mousemove", move, { passive: true });
  stage.addEventListener("mouseleave", leave, { passive: true });
  return true;
}

if (!setupRecentPlaysTilt()) {
  const observer = new MutationObserver(() => {
    if (setupRecentPlaysTilt()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
