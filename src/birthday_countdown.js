(() => {
  const BIRTH_MONTH = 8; // September (0-based)
  const BIRTH_DAY = 7;
  const ID = "birthday-countdown";

  const daysUntilBirthday = () => {
    const now = new Date();
    let next = new Date(now.getFullYear(), BIRTH_MONTH, BIRTH_DAY);
    if (next.getTime() <= now.getTime()) {
      next = new Date(now.getFullYear() + 1, BIRTH_MONTH, BIRTH_DAY);
    }
    return Math.ceil((next.getTime() - now.getTime()) / 86400000);
  };

  const mount = () => {
    const ageMs = document.querySelector(".age-ms");
    if (!ageMs || ageMs.querySelector(`#${ID}`)) return false;

    const countdown = document.createElement("small");
    countdown.id = ID;
    countdown.textContent = `${daysUntilBirthday()} days until birthday`;
    ageMs.appendChild(countdown);
    return true;
  };

  const update = () => {
    const countdown = document.getElementById(ID);
    if (countdown) countdown.textContent = `${daysUntilBirthday()} days until birthday`;
  };

  const style = document.createElement("style");
  style.textContent = `#${ID}{display:block;margin-top:2px}`;
  document.head.appendChild(style);

  mount();
  const observer = new MutationObserver(() => mount());
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(update, 60000);
})();
