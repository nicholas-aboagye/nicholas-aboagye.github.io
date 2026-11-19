/* Nicholas Aboagye — shared behaviour: theme, lightbox, copy, contour field.
   Every block guards against its own elements being absent, so one file serves
   every page. */

/* ---- theme toggle (overrides the viewer's system setting both ways) ---- */
(function(){
  var root=document.documentElement, btn=document.getElementById('themeToggle'), saved=null;
  try{ saved=localStorage.getItem('na-theme'); }catch(e){}
  if(saved==='dark'||saved==='light'){ root.setAttribute('data-theme',saved); }
  if(!btn) return;
  function isDark(){
    var a=root.getAttribute('data-theme');
    if(a==='dark') return true;
    if(a==='light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function sync(){ btn.setAttribute('aria-pressed', isDark()?'true':'false'); }
  sync();
  btn.addEventListener('click',function(){
    var next=isDark()?'light':'dark';
    root.setAttribute('data-theme',next);
    try{ localStorage.setItem('na-theme',next); }catch(e){}
    sync();
    if(typeof window.drawContours==='function') window.drawContours();
  });
})();

/* ---- placeholder links do nothing until a URL is in ---- */
document.addEventListener('click',function(e){
  var a=e.target.closest('[aria-disabled="true"]');
  if(a) e.preventDefault();
});

/* ---- lightbox ---- */
(function(){
  var box=document.getElementById('lightbox');
  if(!box) return;
  var lbImg=document.getElementById('lbImg'),
      lbCap=document.getElementById('lbCap'),
      shots=[].slice.call(document.querySelectorAll('.shot')),
      idx=0, lastFocus=null;
  if(!shots.length) return;

  function show(i){
    idx=(i+shots.length)%shots.length;
    var fig=shots[idx], img=fig.querySelector('img'), cap=fig.querySelector('figcaption');
    lbImg.src=img.getAttribute('src');
    lbImg.alt=img.getAttribute('alt')||'';
    lbCap.innerHTML=cap?cap.innerHTML:'';
  }
  function open(i){
    lastFocus=document.activeElement;
    show(i);
    box.setAttribute('data-open','');
    document.getElementById('lbClose').focus();
  }
  function close(){
    box.removeAttribute('data-open');
    lbImg.src='';
    if(lastFocus&&lastFocus.focus) lastFocus.focus();
  }
  shots.forEach(function(fig,i){
    var b=fig.querySelector('.zoom');
    if(b) b.addEventListener('click',function(){ open(i); });
  });
  document.getElementById('lbClose').addEventListener('click',close);
  document.getElementById('lbPrev').addEventListener('click',function(){ show(idx-1); });
  document.getElementById('lbNext').addEventListener('click',function(){ show(idx+1); });
  box.addEventListener('click',function(e){ if(e.target===box||e.target===lbImg) close(); });
  document.addEventListener('keydown',function(e){
    if(!box.hasAttribute('data-open')) return;
    if(e.key==='Escape') close();
    else if(e.key==='ArrowLeft') show(idx-1);
    else if(e.key==='ArrowRight') show(idx+1);
  });
})();

/* ---- copy email ---- */
(function(){
  var btn=document.getElementById('copyEmail'), code=document.getElementById('email');
  if(!btn||!code) return;
  btn.addEventListener('click',function(){
    var txt=code.textContent.trim();
    function done(){ btn.textContent='Copied'; setTimeout(function(){ btn.textContent='Copy'; },1600); }
    function select(){
      var r=document.createRange(); r.selectNodeContents(code);
      var s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent='Selected'; setTimeout(function(){ btn.textContent='Copy'; },1600);
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done,select);
    } else { select(); }
  });
})();

/* ---- contour field: marching squares over a synthetic elevation surface ---- */
(function(){
  var canvas=document.getElementById('contours');
  if(!canvas) return;
  var ctx=canvas.getContext('2d');
  var BUMPS=[
    [0.14,0.34,0.26, 1.00],[0.58,0.74,0.30, 0.88],[0.86,0.20,0.19,-0.72],
    [0.40,0.06,0.24, 0.46],[0.03,0.88,0.21,-0.52],[0.74,0.46,0.15, 0.40]
  ];
  function field(x,y){
    var v=0,i,b,dx,dy;
    for(i=0;i<BUMPS.length;i++){
      b=BUMPS[i]; dx=x-b[0]; dy=y-b[1];
      v+=b[3]*Math.exp(-(dx*dx+dy*dy)/(b[2]*b[2])*1.55);
    }
    return v+0.13*Math.sin(x*6.6+1.1)*Math.cos(y*4.9-0.5);
  }
  function draw(){
    var host=canvas.parentElement, w=host.clientWidth, h=host.clientHeight;
    if(!w||!h) return;
    var dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);

    var cs=getComputedStyle(document.documentElement);
    var minor=cs.getPropertyValue('--line').trim()||'#DBE0DA';
    var major=cs.getPropertyValue('--contour').trim()||'#B4844A';

    var step=Math.max(6,Math.min(11,Math.round(w/150)));
    var cols=Math.ceil(w/step)+1, rows=Math.ceil(h/step)+1;

    var g=new Float32Array(cols*rows), r, c;
    for(r=0;r<rows;r++){
      for(c=0;c<cols;c++){ g[r*cols+c]=field((c*step)/w,(r*step)/h); }
    }
    var lo=Infinity, hi=-Infinity, k;
    for(k=0;k<g.length;k++){ if(g[k]<lo)lo=g[k]; if(g[k]>hi)hi=g[k]; }

    var LEVELS=18;
    for(var L=1;L<LEVELS;L++){
      var t=lo+(hi-lo)*(L/LEVELS), index=(L%5===0);
      ctx.beginPath();
      ctx.strokeStyle=index?major:minor;
      ctx.globalAlpha=index?0.5:0.75;
      ctx.lineWidth=index?1.15:0.65;
      for(r=0;r<rows-1;r++){
        for(c=0;c<cols-1;c++){
          var v0=g[r*cols+c], v1=g[r*cols+c+1], v2=g[(r+1)*cols+c+1], v3=g[(r+1)*cols+c];
          var x0=c*step, y0=r*step, x1=x0+step, y1=y0+step, pts=[];
          if((v0<t)!==(v1<t)) pts.push([x0+step*(t-v0)/(v1-v0), y0]);
          if((v1<t)!==(v2<t)) pts.push([x1, y0+step*(t-v1)/(v2-v1)]);
          if((v3<t)!==(v2<t)) pts.push([x0+step*(t-v3)/(v2-v3), y1]);
          if((v0<t)!==(v3<t)) pts.push([x0, y0+step*(t-v0)/(v3-v0)]);
          if(pts.length===2){
            ctx.moveTo(pts[0][0],pts[0][1]); ctx.lineTo(pts[1][0],pts[1][1]);
          } else if(pts.length===4){
            ctx.moveTo(pts[0][0],pts[0][1]); ctx.lineTo(pts[1][0],pts[1][1]);
            ctx.moveTo(pts[2][0],pts[2][1]); ctx.lineTo(pts[3][0],pts[3][1]);
          }
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  window.drawContours=draw;
  draw();
  var rt;
  window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(draw,140); });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);
})();
