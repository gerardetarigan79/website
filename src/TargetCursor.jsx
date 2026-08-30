import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

const getContainingBlock = element => {
  let node = element?.parentElement;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (style.transform !== 'none' || style.perspective !== 'none' || style.filter !== 'none' || style.willChange.includes('transform') || style.willChange.includes('perspective') || style.willChange.includes('filter') || /paint|layout|strict|content/.test(style.contain)) return node;
    node = node.parentElement;
  }
  return null;
};
const getContainingBlockOffset = block => block ? (() => { const r = block.getBoundingClientRect(); return {x:r.left+block.clientLeft,y:r.top+block.clientTop}; })() : {x:0,y:0};

const TargetCursor = ({targetSelector='.cursor-target, .skill-logo-loop',spinDuration=2,hideDefaultCursor=true,hoverDuration=.2,parallaxOn=true,cursorColor='#ffffff',cursorColorOnTarget}) => {
  const cursorRef=useRef(null),cornersRef=useRef(null),spinTl=useRef(null),dotRef=useRef(null),containingBlockRef=useRef(null),targetCornerPositionsRef=useRef(null),tickerFnRef=useRef(null),activeStrengthRef=useRef(0);
  const isMobile=useMemo(()=>typeof window==='undefined'?false:((('ontouchstart' in window||navigator.maxTouchPoints>0)&&window.innerWidth<=768)||/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test((navigator.userAgent||'').toLowerCase())),[]);
  const constants=useMemo(()=>({borderWidth:3,cornerSize:12}),[]);
  const moveCursor=useCallback((x,y)=>{if(!cursorRef.current)return;const o=getContainingBlockOffset(containingBlockRef.current);gsap.to(cursorRef.current,{x:x-o.x,y:y-o.y,duration:.1,ease:'power3.out'});},[]);
  useEffect(()=>{
    if(isMobile||!cursorRef.current)return;
    const originalCursor=document.body.style.cursor;if(hideDefaultCursor)document.body.style.cursor='none';
    const cursor=cursorRef.current;cornersRef.current=cursor.querySelectorAll('.target-cursor-corner');containingBlockRef.current=getContainingBlock(cursor);const getOffset=()=>getContainingBlockOffset(containingBlockRef.current);
    let activeTarget=null,currentLeaveHandler=null,lastMouseX=window.innerWidth/2,lastMouseY=window.innerHeight/2;
    const cleanupTarget=target=>{if(currentLeaveHandler)target.removeEventListener('mouseleave',currentLeaveHandler);currentLeaveHandler=null;};
    const startSpin=()=>{if(!cursorRef.current)return;spinTl.current?.kill();gsap.killTweensOf(cursorRef.current,'rotation');spinTl.current=gsap.timeline({repeat:-1}).to(cursorRef.current,{rotation:'+=360',duration:spinDuration,ease:'none'});};
    const updateTargetCornerPositions=()=>{
      if(!activeTarget)return;
      const rect=activeTarget.getBoundingClientRect(),{borderWidth,cornerSize}=constants,{x:offsetX,y:offsetY}=getOffset();
      targetCornerPositionsRef.current=[{x:rect.left-borderWidth-offsetX,y:rect.top-borderWidth-offsetY},{x:rect.right+borderWidth-cornerSize-offsetX,y:rect.top-borderWidth-offsetY},{x:rect.right+borderWidth-cornerSize-offsetX,y:rect.bottom+borderWidth-cornerSize-offsetY},{x:rect.left-borderWidth-offsetX,y:rect.bottom+borderWidth-cornerSize-offsetY}];
    };
    const clearActiveTarget=()=>{if(!activeTarget)return;cleanupTarget(activeTarget);activeTarget=null;targetCornerPositionsRef.current=null;gsap.set(activeStrengthRef,{current:0,overwrite:true});if(cursorColorOnTarget){gsap.to(cornersRef.current,{borderColor:cursorColor,duration:.15,ease:'power2.out'});if(dotRef.current)gsap.to(dotRef.current,{backgroundColor:cursorColor,duration:.15,ease:'power2.out'});}const positions=[{x:-18,y:-18},{x:6,y:-18},{x:6,y:6},{x:-18,y:6}],tl=gsap.timeline();Array.from(cornersRef.current||[]).forEach((corner,index)=>tl.to(corner,{...positions[index],duration:.3,ease:'power3.out'},0));gsap.ticker.remove(tickerFnRef.current);startSpin();};
    const initialOffset=getOffset();gsap.set(cursor,{xPercent:-50,yPercent:-50,x:window.innerWidth/2-initialOffset.x,y:window.innerHeight/2-initialOffset.y});
    startSpin();
    const tickerFn=()=>{
      if(!targetCornerPositionsRef.current||!cursorRef.current||!cornersRef.current)return;
      const strength=activeStrengthRef.current;if(strength===0)return;
      updateTargetCornerPositions();
      if(!targetCornerPositionsRef.current)return;
      const cursorX=gsap.getProperty(cursorRef.current,'x'),cursorY=gsap.getProperty(cursorRef.current,'y');
      Array.from(cornersRef.current).forEach((corner,i)=>{const currentX=gsap.getProperty(corner,'x'),currentY=gsap.getProperty(corner,'y'),targetX=targetCornerPositionsRef.current[i].x-cursorX,targetY=targetCornerPositionsRef.current[i].y-cursorY,finalX=currentX+(targetX-currentX)*strength,finalY=currentY+(targetY-currentY)*strength,duration=strength>=.99?(parallaxOn?.2:0):.05;gsap.to(corner,{x:finalX,y:finalY,duration,ease:duration===0?'none':'power1.out',overwrite:'auto'});});
    };tickerFnRef.current=tickerFn;
    const moveHandler=e=>{lastMouseX=e.clientX;lastMouseY=e.clientY;moveCursor(e.clientX,e.clientY);};window.addEventListener('mousemove',moveHandler);
    const mouseDownHandler=()=>{if(dotRef.current)gsap.to(dotRef.current,{scale:.7,duration:.3});gsap.to(cursorRef.current,{scale:.9,duration:.2});};const mouseUpHandler=()=>{if(dotRef.current)gsap.to(dotRef.current,{scale:1,duration:.3});gsap.to(cursorRef.current,{scale:1,duration:.2});};window.addEventListener('mousedown',mouseDownHandler);window.addEventListener('mouseup',mouseUpHandler);
    const findTarget=element=>{if(!element?.closest)return null;const target=element.closest(targetSelector);return target&&target!==cursor&&document.body.contains(target)?target:null;};
    const enterHandler=e=>{const target=findTarget(e.target);if(!target||!cursorRef.current||!cornersRef.current||activeTarget===target)return;if(activeTarget)cleanupTarget(activeTarget);activeTarget=target;const corners=Array.from(cornersRef.current);corners.forEach(c=>gsap.killTweensOf(c,'x,y'));gsap.killTweensOf(cursorRef.current,'rotation');spinTl.current?.pause();gsap.set(cursorRef.current,{rotation:0});if(cursorColorOnTarget){gsap.to(corners,{borderColor:cursorColorOnTarget,duration:.15,ease:'power2.out'});if(dotRef.current)gsap.to(dotRef.current,{backgroundColor:cursorColorOnTarget,duration:.15,ease:'power2.out'});}updateTargetCornerPositions();const cursorX=gsap.getProperty(cursorRef.current,'x'),cursorY=gsap.getProperty(cursorRef.current,'y');gsap.ticker.add(tickerFnRef.current);gsap.to(activeStrengthRef,{current:1,duration:hoverDuration,ease:'power2.out'});corners.forEach((corner,i)=>gsap.to(corner,{x:targetCornerPositionsRef.current[i].x-cursorX,y:targetCornerPositionsRef.current[i].y-cursorY,duration:.2,ease:'power2.out'}));const leaveHandler=()=>{clearActiveTarget();};currentLeaveHandler=leaveHandler;target.addEventListener('mouseleave',leaveHandler);};
    const refreshTargetAfterScroll=()=>{if(!activeTarget)return;const element=document.elementFromPoint(lastMouseX,lastMouseY);const target=findTarget(element);if(target!==activeTarget){clearActiveTarget();if(target)enterHandler({target});}else updateTargetCornerPositions();};
    window.addEventListener('mouseover',enterHandler,{passive:true});window.addEventListener('scroll',refreshTargetAfterScroll,{passive:true,capture:true});window.addEventListener('resize',refreshTargetAfterScroll);const resizeHandler=()=>{containingBlockRef.current=getContainingBlock(cursor);refreshTargetAfterScroll();};
    return()=>{tickerFnRef.current&&gsap.ticker.remove(tickerFnRef.current);window.removeEventListener('mousemove',moveHandler);window.removeEventListener('mouseover',enterHandler);window.removeEventListener('scroll',refreshTargetAfterScroll,true);window.removeEventListener('resize',resizeHandler);window.removeEventListener('mousedown',mouseDownHandler);window.removeEventListener('mouseup',mouseUpHandler);if(activeTarget)cleanupTarget(activeTarget);spinTl.current?.kill();document.body.style.cursor=originalCursor;targetCornerPositionsRef.current=null;activeStrengthRef.current=0;};
  },[targetSelector,spinDuration,moveCursor,constants,hideDefaultCursor,isMobile,hoverDuration,parallaxOn,cursorColor,cursorColorOnTarget]);
  useEffect(()=>{if(isMobile||!cursorRef.current||!spinTl.current)return;spinTl.current.kill();spinTl.current=gsap.timeline({repeat:-1}).to(cursorRef.current,{rotation:'+=360',duration:spinDuration,ease:'none'});},[spinDuration,isMobile]);
  if(isMobile)return null;
  return <div ref={cursorRef} className="target-cursor-wrapper"><div ref={dotRef} className="target-cursor-dot" style={{backgroundColor:cursorColor}}/><div className="target-cursor-corner corner-tl" style={{borderColor:cursorColor}}/><div className="target-cursor-corner corner-tr" style={{borderColor:cursorColor}}/><div className="target-cursor-corner corner-br" style={{borderColor:cursorColor}}/><div className="target-cursor-corner corner-bl" style={{borderColor:cursorColor}}/></div>;
};
export default TargetCursor;
