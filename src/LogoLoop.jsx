import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import './LogoLoop.css';

const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };
const toCssLength = value => (typeof value === 'number' ? `${value}px` : (value ?? undefined));

const useResizeObserver = (callback, elements, dependencies) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener('resize', handleResize);
      callback();
      return () => window.removeEventListener('resize', handleResize);
    }
    const observers = elements.map(ref => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });
    callback();
    return () => observers.forEach(observer => observer?.disconnect());
  }, [callback, elements, dependencies]);
};

const useImageLoader = (seqRef, onLoad, dependencies) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (!images.length) { onLoad(); return; }
    let remainingImages = images.length;
    const handleImageLoad = () => { remainingImages -= 1; if (remainingImages === 0) onLoad(); };
    images.forEach(img => {
      if (img.complete) handleImageLoad();
      else {
        img.addEventListener('load', handleImageLoad, { once: true });
        img.addEventListener('error', handleImageLoad, { once: true });
      }
    });
    return () => images.forEach(img => {
      img.removeEventListener('load', handleImageLoad);
      img.removeEventListener('error', handleImageLoad);
    });
  }, [onLoad, seqRef, dependencies]);
};

const useAnimationLoop = (trackRef, targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical) => {
  const rafRef = useRef(null), lastTimestampRef = useRef(null), offsetRef = useRef(0), velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const seqSize = isVertical ? seqHeight : seqWidth;
    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    lastTimestampRef.current = null;

    const animate = timestamp => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaTime = Math.min(0.05, Math.max(0, timestamp - lastTimestampRef.current) / 1000);
      lastTimestampRef.current = timestamp;

      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqSize > 0) {
        const rawOffset = offsetRef.current + velocityRef.current * deltaTime;
        const nextOffset = ((rawOffset % seqSize) + seqSize) % seqSize;
        offsetRef.current = nextOffset;
        track.style.transform = isVertical
          ? `translate3d(0, ${-nextOffset}px, 0)`
          : `translate3d(${-nextOffset}px, 0, 0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical, trackRef]);
};

export const LogoLoop = memo(({ logos, speed=120, direction='left', width='100%', logoHeight=28, gap=32, pauseOnHover, hoverSpeed, fadeOut=false, fadeOutColor, scaleOnHover=false, renderItem, ariaLabel='Partner logos', className, style }) => {
  const containerRef=useRef(null), trackRef=useRef(null), seqRef=useRef(null);
  const [seqWidth,setSeqWidth]=useState(0),[seqHeight,setSeqHeight]=useState(0),[copyCount,setCopyCount]=useState(ANIMATION_CONFIG.MIN_COPIES),[isHovered,setIsHovered]=useState(false);
  const effectiveHoverSpeed=useMemo(()=>hoverSpeed!==undefined?hoverSpeed:pauseOnHover===true?0:pauseOnHover===false?undefined:0,[hoverSpeed,pauseOnHover]);
  const isVertical=direction==='up'||direction==='down';
  const targetVelocity=useMemo(()=>{const magnitude=Math.abs(speed);const directionMultiplier=isVertical?(direction==='up'?1:-1):(direction==='left'?1:-1);return magnitude*directionMultiplier*(speed<0?-1:1)},[speed,direction,isVertical]);
  const updateDimensions=useCallback(()=>{const containerWidth=containerRef.current?.clientWidth??0;const firstSequence=seqRef.current;if(!firstSequence)return;const sequenceWidth=firstSequence.scrollWidth;const sequenceHeight=firstSequence.scrollHeight;if(isVertical){const parentHeight=containerRef.current?.parentElement?.clientHeight??0;if(containerRef.current&&parentHeight>0){const targetHeight=Math.ceil(parentHeight);if(containerRef.current.style.height!==`${targetHeight}px`)containerRef.current.style.height=`${targetHeight}px`;}if(sequenceHeight>0){setSeqHeight(sequenceHeight);const viewport=containerRef.current?.clientHeight??parentHeight??sequenceHeight;setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES,Math.ceil(viewport/sequenceHeight)+ANIMATION_CONFIG.COPY_HEADROOM));}}else if(sequenceWidth>0){setSeqWidth(sequenceWidth);setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES,Math.ceil(containerWidth/sequenceWidth)+ANIMATION_CONFIG.COPY_HEADROOM));}},[isVertical]);
  useResizeObserver(updateDimensions,[containerRef,seqRef],[logos,gap,logoHeight,isVertical]);
  useImageLoader(seqRef,updateDimensions,[logos,gap,logoHeight,isVertical]);
  useAnimationLoop(trackRef,targetVelocity,seqWidth,seqHeight,isHovered,effectiveHoverSpeed,isVertical);
  const cssVariables=useMemo(()=>({'--logoloop-gap':`${gap}px`,'--logoloop-logoHeight':`${logoHeight}px`,...(fadeOutColor&&{'--logoloop-fadeColor':fadeOutColor})}),[gap,logoHeight,fadeOutColor]);
  const rootClassName=useMemo(()=>['logoloop',isVertical?'logoloop--vertical':'logoloop--horizontal',fadeOut&&'logoloop--fade',scaleOnHover&&'logoloop--scale-hover',className].filter(Boolean).join(' '),[isVertical,fadeOut,scaleOnHover,className]);
  const handleMouseEnter=useCallback(()=>{if(effectiveHoverSpeed!==undefined)setIsHovered(true)},[effectiveHoverSpeed]);
  const handleMouseLeave=useCallback(()=>{if(effectiveHoverSpeed!==undefined)setIsHovered(false)},[effectiveHoverSpeed]);
  const renderLogoItem=useCallback((item,key)=>{if(renderItem)return <li className="logoloop__item" key={key} role="listitem">{renderItem(item,key)}</li>;const isNodeItem='node' in item;const content=isNodeItem?<span className="logoloop__node" aria-hidden={!!item.href&&!item.ariaLabel}>{item.node}</span>:<img src={item.src} srcSet={item.srcSet} sizes={item.sizes} width={item.width} height={item.height} alt={item.alt??''} title={item.title} loading="eager" decoding="async" draggable={false}/>;const itemAriaLabel=isNodeItem?(item.ariaLabel??item.title):(item.alt??item.title);const itemContent=item.href?<a className="logoloop__link" href={item.href} aria-label={itemAriaLabel||'logo link'} target="_blank" rel="noreferrer noopener">{content}</a>:content;return <li className="logoloop__item" key={key} role="listitem">{itemContent}</li>},[renderItem]);
  const logoLists=useMemo(()=>Array.from({length:copyCount},(_,copyIndex)=><ul className="logoloop__list" key={`copy-${copyIndex}`} role="list" aria-hidden={copyIndex>0} ref={copyIndex===0?seqRef:undefined}>{logos.map((item,itemIndex)=>renderLogoItem(item,`${copyIndex}-${itemIndex}`))}</ul>),[copyCount,logos,renderLogoItem]);
  const containerStyle=useMemo(()=>({width:isVertical?(toCssLength(width)==='100%'?undefined:toCssLength(width)):(toCssLength(width)??'100%'),...cssVariables,...style}),[width,cssVariables,style,isVertical]);
  return <div ref={containerRef} className={rootClassName} style={containerStyle} role="region" aria-label={ariaLabel} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}><div className="logoloop__track" ref={trackRef}>{logoLists}</div></div>;
});
LogoLoop.displayName='LogoLoop';
export default LogoLoop;
