import React, { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import './LightRays.css';

const hexToRgb = hex => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};
const getAnchorAndDir = (origin, w, h) => {
  const outside = 0.2;
  switch (origin) {
    case 'top-left': return { anchor: [0, -outside * h], dir: [0, 1] };
    case 'top-right': return { anchor: [w, -outside * h], dir: [0, 1] };
    case 'left': return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case 'right': return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case 'bottom-left': return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-center': return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-right': return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
};
const LightRays = ({ raysOrigin = 'top-center', raysColor = '#ffffff', raysSpeed = 1, lightSpread = 1, rayLength = 2, pulsating = false, fadeDistance = 1, saturation = 1, followMouse = true, mouseInfluence = 0.1, noiseAmount = 0, distortion = 0, className = '' }) => {
  const containerRef = useRef(null), rendererRef = useRef(null), mouseRef = useRef({ x: 0.5, y: 0.5 }), smoothMouseRef = useRef({ x: 0.5, y: 0.5 }), animationIdRef = useRef(null), cleanupRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { const el = containerRef.current; if (!el) return; const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 }); observer.observe(el); return () => observer.disconnect(); }, []);
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    let cancelled = false;
    const init = async () => {
      await new Promise(r => setTimeout(r, 10));
      if (cancelled || !containerRef.current) return;
      const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
      rendererRef.current = renderer;
      const gl = renderer.gl; gl.canvas.style.width = '100%'; gl.canvas.style.height = '100%';
      containerRef.current.replaceChildren(gl.canvas);
      const vert = `attribute vec2 position; varying vec2 vUv; void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
      const frag = `precision highp float; uniform float iTime; uniform vec2 iResolution,rayPos,rayDir,mousePos; uniform vec3 raysColor; uniform float raysSpeed,lightSpread,rayLength,pulsating,fadeDistance,saturation,mouseInfluence,noiseAmount,distortion; varying vec2 vUv; float noise(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);} float rayStrength(vec2 src,vec2 ref,vec2 coord,float a,float b,float speed){vec2 d=coord-src;vec2 n=normalize(d);float c=dot(n,ref);float da=c+distortion*sin(iTime*2.+length(d)*.01)*.2;float spread=pow(max(da,0.),1./max(lightSpread,.001));float dist=length(d);float maxD=iResolution.x*rayLength;float lf=clamp((maxD-dist)/maxD,0.,1.);float ff=clamp((iResolution.x*fadeDistance-dist)/(iResolution.x*fadeDistance),.5,1.);float pulse=pulsating>.5?(.8+.2*sin(iTime*speed*3.)):1.;float base=clamp((.45+.15*sin(da*a+iTime*speed))+(.3+.2*cos(-da*b+iTime*speed)),0.,1.);return base*lf*ff*spread*pulse;} void main(){vec2 coord=vec2(gl_FragCoord.x,iResolution.y-gl_FragCoord.y);vec2 dir=rayDir;if(mouseInfluence>0.){vec2 mp=mousePos*iResolution.xy;dir=normalize(mix(rayDir,normalize(mp-rayPos),mouseInfluence));}float s=rayStrength(rayPos,dir,coord,36.2214,21.11349,1.5*raysSpeed)*.5+rayStrength(rayPos,dir,coord,22.3991,18.0234,1.1*raysSpeed)*.4;if(noiseAmount>0.)s*=1.-noiseAmount+noiseAmount*noise(coord*.01+iTime*.1);float b=1.-coord.y/iResolution.y;vec3 col=vec3(s);col*=raysColor;col*=vec3(.1+b*.8,.3+b*.6,.5+b*.5);float gray=dot(col,vec3(.299,.587,.114));col=mix(vec3(gray),col,saturation);gl_FragColor=vec4(col,s);}`;
      const uniforms = { iTime:{value:0}, iResolution:{value:[1,1]}, rayPos:{value:[0,0]}, rayDir:{value:[0,1]}, raysColor:{value:hexToRgb(raysColor)}, raysSpeed:{value:raysSpeed}, lightSpread:{value:lightSpread}, rayLength:{value:rayLength}, pulsating:{value:pulsating?1:0}, fadeDistance:{value:fadeDistance}, saturation:{value:saturation}, mousePos:{value:[.5,.5]}, mouseInfluence:{value:mouseInfluence}, noiseAmount:{value:noiseAmount}, distortion:{value:distortion} };
      const mesh = new Mesh(gl, { geometry:new Triangle(gl), program:new Program(gl,{vertex:vert,fragment:frag,uniforms}) });
      const resize=()=>{const w=containerRef.current.clientWidth,h=containerRef.current.clientHeight;renderer.setSize(w,h);const d=renderer.dpr;uniforms.iResolution.value=[w*d,h*d];const a=getAnchorAndDir(raysOrigin,w*d,h*d);uniforms.rayPos.value=a.anchor;uniforms.rayDir.value=a.dir;};
      const loop=t=>{if(!rendererRef.current)return;uniforms.iTime.value=t*.001;if(followMouse){const s=.92;smoothMouseRef.current.x=smoothMouseRef.current.x*s+mouseRef.current.x*(1-s);smoothMouseRef.current.y=smoothMouseRef.current.y*s+mouseRef.current.y*(1-s);uniforms.mousePos.value=[smoothMouseRef.current.x,smoothMouseRef.current.y];}renderer.render({scene:mesh});animationIdRef.current=requestAnimationFrame(loop);};
      const mouse=e=>{const r=containerRef.current.getBoundingClientRect();mouseRef.current={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
      window.addEventListener('resize',resize); window.addEventListener('mousemove',mouse); resize(); animationIdRef.current=requestAnimationFrame(loop);
      cleanupRef.current=()=>{cancelAnimationFrame(animationIdRef.current);window.removeEventListener('resize',resize);window.removeEventListener('mousemove',mouse);renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();rendererRef.current=null;};
    }; init(); return ()=>{cancelled=true;cleanupRef.current?.();cleanupRef.current=null;};
  },[isVisible,raysOrigin,raysColor,raysSpeed,lightSpread,rayLength,pulsating,fadeDistance,saturation,followMouse,mouseInfluence,noiseAmount,distortion]);
  return <div ref={containerRef} className={`light-rays-container ${className}`.trim()} />;
};
export default LightRays;
