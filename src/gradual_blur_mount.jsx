import React from 'react';
import { createRoot } from 'react-dom/client';
import GradualBlur from './GradualBlur';

const mount = document.createElement('div');
mount.id = 'gradual-blur-mount';
Object.assign(mount.style, {
  position: 'fixed',
  inset: '0',
  pointerEvents: 'none',
  zIndex: '1000'
});
document.body.appendChild(mount);

createRoot(mount).render(
  <>
    <GradualBlur
      target="parent"
      position="top"
      height="6rem"
      strength={2}
      divCount={5}
      curve="bezier"
      exponential={true}
      opacity={1}
    />
    <GradualBlur
      target="parent"
      position="bottom"
      height="6rem"
      strength={2}
      divCount={5}
      curve="bezier"
      exponential={true}
      opacity={1}
    />
  </>
);
