// Component ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ASCIIText.css';

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform float uEnableWaves;
void main() {
 vUv = uv;
 float time = uTime * 5.;
 float waveFactor = uEnableWaves;
 vec3 transformed = position;
 float dist = distance(uv, uMouse * 0.5 + 0.5);
 float influence = smoothstep(0.65, 0.0, dist);
 transformed.z += sin(time + position.x * 2.0 + position.y) * 0.28 * waveFactor;
 transformed.x += sin(time * 0.8 + position.y * 2.0) * 0.18 * waveFactor;
 transformed.y += cos(time * 0.7 + position.x * 2.0) * 0.12 * waveFactor;
 transformed.z += influence * sin(time * 2.0 + dist * 18.0) * 1.2 * waveFactor;
 transformed.x += (uMouse.x * 0.5) * influence * waveFactor;
 transformed.y -= (uMouse.y * 0.35) * influence * waveFactor;
 gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
void main() {
 float time = uTime;
 vec2 pos = vUv;
 float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
 float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
 float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
 float a = texture2D(uTexture, pos).a;
 gl_FragColor = vec4(r,g,b,a);
}`;

class CanvasTxt {
  constructor(txt, opts) { this.txt = txt; this.opts = opts; this.canvas = document.createElement('canvas'); this.context = this.canvas.getContext('2d'); }
  resize() { this.context.font = `${this.opts.fontSize}px ${this.opts.fontFamily}`; const m = this.context.measureText(this.txt); this.canvas.width = Math.max(1, Math.ceil(m.width + 20)); this.canvas.height = Math.max(1, Math.ceil(this.opts.fontSize * 1.35)); }
  render() { const { fontSize, fontFamily, color } = this.opts; this.context.clearRect(0,0,this.canvas.width,this.canvas.height); this.context.font = `${fontSize}px ${fontFamily}`; this.context.fillStyle = color; this.context.textBaseline = 'alphabetic'; const metrics = this.context.measureText(this.txt); this.context.fillText(this.txt,10,10+metrics.actualBoundingBoxAscent); }
  get width(){return this.canvas.width;} get height(){return this.canvas.height;} get texture(){return this.canvas;}
}

class AsciiFilter {
  constructor(renderer,options){this.renderer=renderer;this.options=options;this.domElement=document.createElement('pre');this.domElement.style.cssText='margin:0;user-select:none;padding:0;line-height:1em;text-align:left;position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;white-space:pre;';}
  render(source,time=0){
    const fontSize=this.options.fontSize;
    // Use a deliberately wide particle field so the particles form a horizontal
    // rectangle around the complete word instead of a square around its center.
    const fieldWidth=Math.max(source.width*1.45,source.height*2.8);
    const fieldHeight=Math.max(source.height*1.05,1);
    const w=Math.max(1,Math.ceil(fieldWidth/fontSize)),h=Math.max(1,Math.ceil(fieldHeight/fontSize));
    this.buffer=this.buffer||document.createElement('canvas');this.buffer.width=w;this.buffer.height=h;
    const ctx=this.buffer.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,w,h);
    const sourceX=Math.max(0,(fieldWidth-source.width)/2);
    ctx.drawImage(source,sourceX/fontSize,0,source.width/fontSize,source.height/fontSize);
    const data=ctx.getImageData(0,0,w,h).data,chars=' .:-=+*#%@';let out='';
    const tick=Math.floor(time*7);
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++){
        const i=(y*w+x)*4,a=data[i+3]/255,lum=(data[i]*.299+data[i+1]*.587+data[i+2]*.114)/255;
        if(a>=.08){out+=chars[Math.min(chars.length-1,Math.floor(lum*(chars.length-1)))];}
        else {
          const hash=Math.sin((x*127.1+y*311.7+tick*17.3))*43758.5453;
          const noise=hash-Math.floor(hash);
          const edge=Math.min(x,w-1-x)/(Math.max(1,w)*0.5);
          const vertical=Math.min(y,h-1-y)/(Math.max(1,h)*0.5);
          const density=0.065+(1-Math.min(1,edge))*0.035+(1-Math.min(1,vertical))*0.015;
          if(noise<density){
            const index=Math.min(chars.length-1,Math.max(5,Math.floor(noise*chars.length*1.7)));
            out+=chars[index];
          } else out+=' ';
        }
      }
      out+='\n';
    }
    this.domElement.textContent=out;
    this.domElement.style.width='145%';
    this.domElement.style.left='-22.5%';
  }
}

export default function ASCIIText({text='David!',asciiFontSize=4,textFontSize=360,textColor='#fdf9f3',planeBaseHeight=14,enableWaves=true}){
  const containerRef=useRef(null),instanceRef=useRef(null);
  useEffect(()=>{
    const container=containerRef.current;if(!container)return;let cancelled=false;
    const init=async()=>{
      await new Promise(r=>requestAnimationFrame(r));if(cancelled)return;
      const rect=container.getBoundingClientRect(),width=Math.max(1,rect.width),height=Math.max(1,rect.height);
      const renderer=new THREE.WebGLRenderer({antialias:false,alpha:true});renderer.setPixelRatio(1);renderer.setClearColor(0x000000,0);container.replaceChildren(renderer.domElement);
      const textCanvas=new CanvasTxt(text,{fontSize:textFontSize,fontFamily:'IBM Plex Mono, monospace',color:textColor});textCanvas.context.font=`${textFontSize}px IBM Plex Mono, monospace`;textCanvas.resize();textCanvas.render();
      const texture=new THREE.CanvasTexture(textCanvas.texture);texture.minFilter=THREE.NearestFilter;texture.magFilter=THREE.NearestFilter;
      const aspect=textCanvas.width/textCanvas.height,geometry=new THREE.PlaneGeometry(planeBaseHeight*aspect,planeBaseHeight,64,64);
      const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,transparent:true,uniforms:{uTime:{value:0},uTexture:{value:texture},uEnableWaves:{value:enableWaves?1:0},uMouse:{value:new THREE.Vector2(.5,.5)}}});
      const mesh=new THREE.Mesh(geometry,material),scene=new THREE.Scene();scene.add(mesh);
      const camera=new THREE.PerspectiveCamera(45,width/height,1,1000);camera.position.z=30;
      const filter=new AsciiFilter(renderer,{fontSize:asciiFontSize});container.appendChild(filter.domElement);renderer.setSize(width,height,false);
      const resize=()=>{const r=container.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();};
      const mouse={x:0,y:0},onMove=e=>{const r=container.getBoundingClientRect();mouse.x=(e.clientX-r.left)/Math.max(1,r.width);mouse.y=1-(e.clientY-r.top)/Math.max(1,r.height);material.uniforms.uMouse.value.set(mouse.x,mouse.y);};
      const ro=new ResizeObserver(resize);ro.observe(container);container.addEventListener('mousemove',onMove);container.addEventListener('touchmove',e=>{const t=e.touches?.[0];if(t)onMove(t);},{passive:true});
      let frame=0;const loop=t=>{if(cancelled)return;material.uniforms.uTime.value=t*.001;mesh.rotation.y+=((mouse.x-.5)*.08-mesh.rotation.y)*.04;mesh.rotation.x+=((-(mouse.y-.5))*.06-mesh.rotation.x)*.04;renderer.render(scene,camera);filter.render(renderer.domElement,t*.001);frame=requestAnimationFrame(loop);};frame=requestAnimationFrame(loop);
      instanceRef.current={dispose(){cancelAnimationFrame(frame);ro.disconnect();container.removeEventListener('mousemove',onMove);geometry.dispose();material.dispose();texture.dispose();renderer.dispose();renderer.forceContextLoss();}};
    };init();return()=>{cancelled=true;instanceRef.current?.dispose();instanceRef.current=null;};
  },[text,asciiFontSize,textFontSize,textColor,planeBaseHeight,enableWaves]);
  return <div ref={containerRef} className="ascii-text-container" aria-label={text}/>;
}