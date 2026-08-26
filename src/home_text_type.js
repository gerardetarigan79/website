import React, { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import TextType from './TextType.jsx';

const mount = () => {
  const heading = document.querySelector('#home h1');
  if (!heading || heading.dataset.textTypeMounted === '1') return;
  heading.dataset.textTypeMounted = '1';

  const mountPoint = document.createElement('span');
  mountPoint.className = 'home-text-type-mount';
  heading.replaceChildren(mountPoint);

  createRoot(mountPoint).render(
    createElement(TextType, {
      as: 'span',
      text: ['Draven'],
      typingSpeed: 75,
      pauseDuration: 1500,
      showCursor: true,
      cursorCharacter: '|',
      variableSpeed: { min: 55, max: 95 },
      loop: false
    })
  );
};

const observer = new MutationObserver(() => mount());
observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
mount();
