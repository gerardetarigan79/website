const projects = [
  {
    name: 'Doxa Dock',
    type: 'Private user application',
    description: 'A private application built with a focused interface and custom functionality.',
    tag: 'PRIVATE USE · CLOSE FRIENDS',
    logo: '/projects/doxa.png'
  },
  {
    name: 'Vanta Flow',
    type: 'After Effects custom plugin',
    description: 'A custom After Effects plugin built around essential tools, workflow utilities, and shortcuts.',
    tag: 'PRIVATE USE · CLOSE FRIENDS',
    logo: '/projects/vanta.png'
  },
  {
    name: 'Argo Node',
    type: 'Discord utility bot',
    description: 'A private Discord utility bot focused on practical server tools and everyday automation.',
    tag: 'PRIVATE USE · CLOSE FRIENDS',
    logo: '/projects/argo.png'
  }
];

const style = document.createElement('style');
style.textContent = `
  .projects-private-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 22px;
  }
  .projects-private-card {
    position: relative;
    min-height: 245px;
    padding: 22px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 16px;
    background: rgba(255,255,255,.025);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform .25s ease, border-color .25s ease, background .25s ease;
  }
  .projects-private-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,.17);
    background: rgba(255,255,255,.04);
  }
  .projects-private-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(255,255,255,.06), transparent 55%);
    pointer-events: none;
  }
  .projects-private-card > * { position: relative; }
  .projects-private-logo-wrap {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    margin-bottom: 17px;
  }
  .projects-private-logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    display: block;
    filter: drop-shadow(0 10px 22px rgba(0,0,0,.35));
  }
  .projects-private-lock {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    width: fit-content;
    padding: 5px 8px;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 999px;
    font-size: 8px;
    letter-spacing: .12em;
    color: rgba(255,255,255,.55);
  }
  .projects-private-lock::before { content: '◆'; font-size: 6px; opacity: .7; }
  .projects-private-card h2 { margin: 0 0 5px; }
  .projects-private-type { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; opacity: .45; }
  .projects-private-description { margin: 14px 0 0; font-size: 12px; line-height: 1.65; opacity: .62; }
  .projects-private-note { margin-top: 22px; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; opacity: .35; }
  @media (max-width: 900px) { .projects-private-grid { grid-template-columns: 1fr; } }
`;
document.head.appendChild(style);

function mountProjects() {
  const section = document.querySelector('#projects');
  if (!section || section.dataset.privateProjectsMounted === '1') return;
  const inner = section.querySelector('.page-inner');
  if (!inner) return;

  const oldCard = inner.querySelector('.project-card');
  if (!oldCard) return;

  section.dataset.privateProjectsMounted = '1';
  oldCard.remove();

  const grid = document.createElement('div');
  grid.className = 'projects-private-grid';
  grid.innerHTML = projects.map(project => `
    <article class="projects-private-card cursor-target">
      <div>
        <div class="projects-private-logo-wrap">
          <img class="projects-private-logo" src="${project.logo}" alt="${project.name} logo" />
        </div>
        <span class="projects-private-lock">${project.tag}</span>
        <h2>${project.name}</h2>
        <div class="projects-private-type">${project.type}</div>
        <p class="projects-private-description">${project.description}</p>
      </div>
      <div class="projects-private-note">not publicly available</div>
    </article>
  `).join('');

  inner.appendChild(grid);
}

const observer = new MutationObserver(mountProjects);
observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
mountProjects();
