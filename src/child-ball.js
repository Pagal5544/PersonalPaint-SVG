const $=id=>document.getElementById(id), W=720,H=1280,FPS=30,DURATION=30,TOTAL=FPS*DURATION;
let playing=false,raf=0,start=0,pausedAt=0,recorder=null,chunks=[];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function frame(t){
 const run=t%10, segment=Math.floor(t/10), direction=segment%2===0?1:-1;
 const progress=run/10, phase=t*2.9, stride=Math.sin(phase);
 // बच्चा पूरे मैदान में एक तरफ से दूसरी तरफ दौड़ता है; हर 10 सेकंड दिशा बदलता है।
 const childX=direction===1?105+progress*500:605-progress*500;
 const kickPulse=Math.max(0,Math.sin(run*1.05-1.0));
 const bounce=Math.abs(stride)*20 + kickPulse*24, cy=815-bounce;
 const leg=stride*42, arm=Math.sin(phase+Math.PI)*34;
 // गेंद हमेशा बच्चे के आगे रहती है और किक के बाद ऊँची उछलती है।
 const ballX=Math.max(58,Math.min(662,childX+direction*(112+kickPulse*45)));
 const ballY=930-kickPulse*190-Math.abs(Math.sin(run*2.2))*38;
 const sky=`<rect width="720" height="1280" fill="#8bdcf5"/><circle cx="560" cy="190" r="78" fill="#fff0a6"/><path d="M0 780 Q160 650 330 770 T720 740 V1280 H0Z" fill="#74bd67"/><path d="M0 950 Q190 840 360 950 T720 900 V1280 H0Z" fill="#4d9d55"/><path d="M0 1080 Q220 990 430 1080 T720 1040 V1280 H0Z" fill="#337c49"/><g fill="#287b4b"><circle cx="90" cy="590" r="95"/><circle cx="160" cy="550" r="110"/><circle cx="635" cy="570" r="115"/></g><g fill="#87532f"><path d="M112 620h28v270h-28zM618 630h30v280h-30z"/></g><path d="M0 1125 Q360 1085 720 1125" stroke="#d9e9a1" stroke-width="8" fill="none" opacity=".55"/>`;
 const boy=`<g transform="translate(${childX} ${cy}) scale(${direction} 1)">
 <ellipse cx="0" cy="300" rx="104" ry="22" fill="#1e633e" opacity=".25"/>
 <!-- back arm -->
 <g transform="translate(-52 75) rotate(${-arm*.7})"><path d="M0 0 Q-65 32 -82 112" fill="none" stroke="#a85e35" stroke-width="35" stroke-linecap="round"/><circle cx="-83" cy="118" r="19" fill="#b96c42"/></g>
 <!-- legs -->
 <g transform="translate(-28 188) rotate(${leg})"><path d="M0 0 Q-8 64 -26 132" fill="none" stroke="#b96c42" stroke-width="39" stroke-linecap="round"/><path d="M-26 132q-28 18-13 32h60q12-14-7-26z" fill="#293c70" stroke="#18284b" stroke-width="7"/></g>
 <g transform="translate(32 188) rotate(${-leg})"><path d="M0 0 Q15 68 29 132" fill="none" stroke="#b96c42" stroke-width="39" stroke-linecap="round"/><path d="M28 132q-20 18-7 32h61q12-14-8-26z" fill="#293c70" stroke="#18284b" stroke-width="7"/></g>
 <!-- body -->
 <path d="M-65 55 Q-80 82 -70 205 Q0 245 72 205 L65 55 Q0 20 -65 55Z" fill="#1687d4" stroke="#174c79" stroke-width="9"/>
 <path d="M-48 73 Q0 110 48 73" fill="none" stroke="#8ed9ff" stroke-width="8" opacity=".8"/>
 <!-- front arm -->
 <g transform="translate(55 82) rotate(${arm})"><path d="M0 0 Q56 22 86 86" fill="none" stroke="#b96c42" stroke-width="34" stroke-linecap="round"/><circle cx="87" cy="91" r="19" fill="#c77a4d"/></g>
 <!-- neck/head -->
 <rect x="-19" y="25" width="38" height="42" rx="13" fill="#b96c42"/>
 <ellipse cx="0" cy="-35" rx="76" ry="88" fill="#c77a4d" stroke="#75402d" stroke-width="8"/>
 <path d="M-73 -49 Q-75 -130 -5 -126 Q64 -130 75 -64 Q45 -89 10 -87 Q-35 -77 -73 -49Z" fill="#302329"/>
 <path d="M-44 -29q15-12 30 0M15 -29q15-12 30 0" fill="none" stroke="#3a2524" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="-29" cy="-17" rx="7" ry="11" fill="#fff"/><ellipse cx="30" cy="-17" rx="7" ry="11" fill="#fff"/><circle cx="-28" cy="-16" r="4" fill="#182238"/><circle cx="31" cy="-16" r="4" fill="#182238"/>
 <path d="M-17 18 Q0 34 19 18" fill="none" stroke="#743b31" stroke-width="7" stroke-linecap="round"/>
 <circle cx="-51" cy="8" r="11" fill="#e99a79" opacity=".65"/><circle cx="51" cy="8" r="11" fill="#e99a79" opacity=".65"/>
 </g>`;
 const ball=`<g transform="translate(${ballX} ${ballY}) rotate(${t*170})"><circle r="49" fill="#ffbd24" stroke="#9b4e14" stroke-width="8"/><path d="M-46 -12 Q0 18 46 -12 M-12 -46 Q-38 0 -12 46 M12 -46 Q38 0 12 46" fill="none" stroke="#fff4cb" stroke-width="7"/><circle r="9" fill="#f16b27"/></g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${sky}<path d="M0 1190 Q160 1160 330 1190 T720 1175 V1280 H0Z" fill="#286b43"/>${ball}${boy}<g font-family="sans-serif" text-anchor="middle" fill="#fff" opacity=".9"><text x="360" y="1225" font-size="34" font-weight="700">चलो गेंद के साथ खेलें!</text></g></svg>`;
}
function show(t){$("stage").innerHTML=frame(t);}
function tick(now){if(!playing)return;const t=((now-start)/1000)%DURATION;show(t);raf=requestAnimationFrame(tick);}
$("play").onclick=()=>{if(playing)return;playing=true;start=performance.now()-pausedAt*1000;raf=requestAnimationFrame(tick);$("status").textContent="एनिमेशन चल रहा है — 30 सेकंड का लूप।";};
$("pause").onclick=()=>{if(playing){pausedAt=((performance.now()-start)/1000)%DURATION;playing=false;cancelAnimationFrame(raf);$("status").textContent="एनिमेशन रोक दिया गया।";}};
show(0);
$("zip").onclick=async()=>{const b=$("zip");b.disabled=true;try{if(!window.JSZip)throw Error("ZIP library लोड नहीं हुई; पेज refresh करके दोबारा कोशिश करें।");const zip=new JSZip(),folder=zip.folder("child-ball-svg-frames");for(let i=0;i<TOTAL;i++){folder.file("frame_"+String(i).padStart(4,"0")+".svg",frame(i/FPS));if(i%30===0)$("status").textContent="SVG फ्रेम बन रहे हैं: "+i+"/"+TOTAL;}const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE"},m=>{$("status").textContent="ZIP तैयार हो रही है: "+Math.round(m.percent)+"%";});const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download="Child_Ball_900_SVG_Frames.zip";a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);$("status").textContent="900 अलग-अलग SVG फ्रेम डाउनलोड हो गए।";}catch(e){$("status").textContent="त्रुटि: "+e.message;}finally{b.disabled=false;}};
$("webm").onclick=async()=>{const b=$("webm");b.disabled=true;try{const canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;const ctx=canvas.getContext("2d");const stream=canvas.captureStream(FPS);recorder=new MediaRecorder(stream,{mimeType:"video/webm"});chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{const blob=new Blob(chunks,{type:"video/webm"}),a=document.createElement("a"),u=URL.createObjectURL(blob);a.href=u;a.download="Child_Ball_30sec.webm";a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);$("status").textContent="30 सेकंड WebM वीडियो डाउनलोड हो गया।";b.disabled=false;};recorder.start();for(let i=0;i<TOTAL;i++){const svg=frame(i/FPS),img=new Image(),url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url;});ctx.clearRect(0,0,W,H);ctx.drawImage(img,0,0,W,H);URL.revokeObjectURL(url);if(i%15===0){$("status").textContent="वीडियो render: "+i+"/"+TOTAL;await new Promise(r=>setTimeout(r,0));}}recorder.stop();}catch(e){$("status").textContent="वीडियो export error: "+e.message;b.disabled=false;}};