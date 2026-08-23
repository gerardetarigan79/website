import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';
import './Particles.css';

const defaultColors = ['#ffffff', '#a78bfa', '#8b5cf6', '#6366f1', '#c4b5fd'];
const hexToRgb = hex => { hex = hex.replace(/^#/, ''); if (hex.length === 3) hex = hex.split('').map(c => c + c).join(''); const int = parseInt(hex.slice(0, 6), 16); return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255]; };

const vertex = `attribute vec3 position; attribute vec4 random; attribute vec3 color; uniform mat4 modelMatrix; uniform mat4 viewMatrix; uniform mat4 projectionMatrix; uniform float uTime; uniform float uSpread; uniform float uBaseSize; uniform float uSizeRandomness; varying vec4 vRandom; varying vec3 vColor; void main(){vRandom=random;vColor=color;vec3 pos=position*uSpread;pos.z*=10.0;vec4 mPos=modelMatrix*vec4(pos,1.0);float t=uTime;mPos.x+=sin(t*random.z+6.28*random.w)*mix(0.1,1.5,random.x);mPos.y+=sin(t*random.y+6.28*random.x)*mix(0.1,1.5,random.w);mPos.z+=sin(t*random.w+6.28*random.y)*mix(0.1,1.5,random.z);vec4 mvPos=viewMatrix*mPos;if(uSizeRandomness==0.0)gl_PointSize=uBaseSize;else gl_PointSize=(uBaseSize*(1.0+uSizeRandomness*(random.x-0.5)))/length(mvPos.xyz);gl_Position=projectionMatrix*mvPos;}`;
const fragment = `precision highp float; uniform float uTime; uniform float uAlphaParticles; varying vec4 vRandom; varying vec3 vColor; void main(){vec2 uv=gl_PointCoord.xy;float d=length(uv-vec2(0.5));if(uAlphaParticles<0.5){if(d>0.5)discard;gl_FragColor=vec4(vColor,1.0);}else{float circle=smoothstep(0.5,0.4,d)*0.8;gl_FragColor=vec4(vColor,circle);}}`;

const Particles = ({particleCount=200,particleSpread=10,speed=0.1,particleColors,moveParticlesOnHover=false,particleHoverFactor=1,alphaParticles=false,particleBaseSize=100,sizeRandomness=1,cameraDistance=20,disableRotation=false,pixelRatio=1,className=''}) => {
  const containerRef=useRef(null);
  const mouseRef=useRef({x:0,y:0});
  const scrollRef=useRef({lastY:0,velocity:0,offset:0,targetOffset:0});
  useEffect(()=>{
    const container=containerRef.current; if(!container)return;
    const renderer=new Renderer({dpr:pixelRatio,depth:false,alpha:true}); const gl=renderer.gl; container.appendChild(gl.canvas); gl.clearColor(0,0,0,0);
    const camera=new Camera(gl,{fov:15}); camera.position.set(0,0,cameraDistance);
    const resize=()=>{const w=window.innerWidth,h=window.innerHeight; renderer.setSize(w,h); camera.perspective({aspect:gl.canvas.width/gl.canvas.height});};
    const move=e=>{mouseRef.current={x:(e.clientX/window.innerWidth)*2-1,y:-((e.clientY/window.innerHeight)*2-1)};};
    const scroll=()=>{const state=scrollRef.current; const delta=window.scrollY-state.lastY; state.lastY=window.scrollY; state.velocity += delta*0.0018; state.velocity=Math.max(-1.5,Math.min(1.5,state.velocity)); state.targetOffset += delta*0.0015;};
    window.addEventListener('resize',resize); resize();
    if(moveParticlesOnHover) window.addEventListener('mousemove',move,{passive:true});
    window.addEventListener('scroll',scroll,{passive:true});
    const count=particleCount,pos=new Float32Array(count*3),randoms=new Float32Array(count*4),colors=new Float32Array(count*3);
    // If the caller supplies only white (as the original React Bits example does),
    // deliberately expand it into the site's purple palette so the particles remain visibly colored.
    const supplied=particleColors?.filter(Boolean) || [];
    const onlyWhite=supplied.length>0 && supplied.every(c=>String(c).toLowerCase() === '#fff' || String(c).toLowerCase() === '#ffffff');
    const palette=onlyWhite ? defaultColors : (supplied.length ? supplied : defaultColors);
    for(let i=0;i<count;i++){let x,y,z,len;do{x=Math.random()*2-1;y=Math.random()*2-1;z=Math.random()*2-1;len=x*x+y*y+z*z;}while(len>1||len===0);const r=Math.cbrt(Math.random());pos.set([x*r,y*r,z*r],i*3);randoms.set([Math.random(),Math.random(),Math.random(),Math.random()],i*4);colors.set(hexToRgb(palette[Math.floor(Math.random()*palette.length)]),i*3);}
    const geometry=new Geometry(gl,{position:{size:3,data:pos},random:{size:4,data:randoms},color:{size:3,data:colors}});
    const program=new Program(gl,{vertex,fragment,uniforms:{uTime:{value:0},uSpread:{value:particleSpread},uBaseSize:{value:particleBaseSize*pixelRatio},uSizeRandomness:{value:sizeRandomness},uAlphaParticles:{value:alphaParticles?1:0}},transparent:true,depthTest:false});
    const particles=new Mesh(gl,{mode:gl.POINTS,geometry,program}); let id,last=performance.now(),elapsed=0;
    const update=t=>{id=requestAnimationFrame(update);const delta=t-last;last=t;elapsed+=delta*speed;const state=scrollRef.current; state.offset += (state.targetOffset-state.offset)*Math.min(delta*0.008,1); state.targetOffset *= Math.exp(-delta*0.0018); state.velocity *= Math.exp(-delta*0.006); const impulse=state.velocity; program.uniforms.uTime.value=elapsed*.001 + state.offset*0.35; if(moveParticlesOnHover){particles.position.x=-mouseRef.current.x*particleHoverFactor;particles.position.y=-mouseRef.current.y*particleHoverFactor;}else{particles.position.x=0;particles.position.y=0;}if(!disableRotation){particles.rotation.x=Math.sin(elapsed*.0002)*.1 + impulse*.045; particles.rotation.y=Math.cos(elapsed*.0005)*.15 - impulse*.03; particles.rotation.z+=.01*speed + impulse*.0009;}renderer.render({scene:particles,camera});};
    id=requestAnimationFrame(update);
    return()=>{window.removeEventListener('resize',resize);if(moveParticlesOnHover)window.removeEventListener('mousemove',move);window.removeEventListener('scroll',scroll);cancelAnimationFrame(id);if(container.contains(gl.canvas))container.removeChild(gl.canvas);};
  },[particleCount,particleSpread,speed,moveParticlesOnHover,particleHoverFactor,alphaParticles,particleBaseSize,sizeRandomness,cameraDistance,disableRotation,pixelRatio]);
  const layer=<div ref={containerRef} className={`particles-container ${className}`}/>;
  return typeof document !== 'undefined' ? createPortal(layer, document.body) : null;
};

export default Particles;
