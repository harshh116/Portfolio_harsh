/* ==========================================================================
   Harsh Gohel portfolio: behaviour
   1 Menu and active link   2 3D card tilt   3 3D photo medal
   4 Hero globe             5 Certificates   6 Contact (email, phone, form)
   ========================================================================== */

/* >>> Edit these if your contact details change <<< */
const CONTACT = {
  email: "harshgohel647@gmail.com",
  phoneIntl: "+33782363197",
  whatsapp: "33782363197"
};

/* =====================================================================
   1. Mobile menu and active section link
===================================================================== */
(function(){
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
  }));

  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => l.removeAttribute('aria-current'));
      const l = map.get(en.target.id); if (l) l.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

/* =====================================================================
   2. 3D tilt for cards (mouse and pen only, so touch scrolling stays smooth)
===================================================================== */
function initTilt(scope){
  (scope || document).querySelectorAll('[data-tilt]:not([data-tilt-ready])').forEach(el => {
    el.setAttribute('data-tilt-ready', '');
    const max = parseFloat(el.dataset.tilt) || 5;
    el.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((px - .5) * 2 * max).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((.5 - py) * 2 * max).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      el.style.setProperty('--go', '1');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); el.style.setProperty('--go', '0');
    });
  });
}
initTilt();

/* =====================================================================
   3. The 3D photo medal: real thickness, tilt, click to flip.
      Front: your photo. Back: a cartoon version that floats in front.
===================================================================== */
(function(){
  const stage = document.getElementById('coinStage');
  const rig = document.getElementById('coinRig');
  const coin = document.getElementById('coin');
  const shadow = stage.querySelector('.coin-shadow');
  const img = coin.querySelector('.coin-front img');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the rim: a stack of discs gives the medal real thickness
  const T = 16;
  for (let i = 1; i < T; i++) {
    const s = document.createElement('i');
    s.className = 'coin-edge';
    s.style.transform = 'translateZ(' + (i - T / 2) + 'px)';
    s.style.background = i % 2 ? '#5B402D' : '#6F4E37';
    coin.appendChild(s);
  }
  // if the photo file is missing, show initials instead of a broken image
  img.addEventListener('error', () => {
    const fb = document.createElement('div');
    fb.style.cssText = 'width:100%;height:100%;border-radius:50%;display:grid;place-items:center;background:#E6E0F0;color:#6F4E37;font:800 4rem "Bricolage Grotesque",sans-serif';
    fb.textContent = 'HG';
    img.replaceWith(fb);
  });

  let tx = reduce ? 4 : 0, ty = reduce ? -12 : 0, cx = tx, cy = ty;
  let hover = false, dragging = false, moved = false, sx0 = 0, sy0 = 0, flipped = false;

  function flip(){
    flipped = !flipped;
    coin.style.setProperty('--flip', flipped ? '180deg' : '0deg');
  }
  function aim(e){
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    ty = (px - .5) * 56; tx = (.5 - py) * 36;
    stage.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
    stage.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
  }
  stage.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') hover = true; });
  stage.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' && !dragging) return;
    hover = true; aim(e);
    if (dragging && Math.hypot(e.clientX - sx0, e.clientY - sy0) > 6) moved = true;
  });
  stage.addEventListener('pointerleave', () => { hover = false; dragging = false; });
  stage.addEventListener('pointerdown', e => { dragging = true; moved = false; sx0 = e.clientX; sy0 = e.clientY; });
  stage.addEventListener('pointerup', () => { if (dragging && !moved) flip(); dragging = false; });
  stage.addEventListener('pointercancel', () => { dragging = false; hover = false; });
  stage.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });

  let running = false, raf = 0;
  function tick(t){
    if (!hover && !reduce) { tx = Math.sin(t / 1900) * 5; ty = Math.sin(t / 2500) * 15; }
    const k = reduce ? 1 : .09;
    cx += (tx - cx) * k; cy += (ty - cy) * k;
    rig.style.setProperty('--rx', cx.toFixed(2) + 'deg');
    rig.style.setProperty('--ry', cy.toFixed(2) + 'deg');
    shadow.style.setProperty('--sx', (cy * -1.1).toFixed(1) + 'px');
    if (!hover) {
      stage.style.setProperty('--gx', (50 + cy * 1.6).toFixed(1) + '%');
      stage.style.setProperty('--gy', (35 - cx * 2).toFixed(1) + '%');
    }
    if (running) raf = requestAnimationFrame(tick);
  }
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !running) { running = true; raf = requestAnimationFrame(tick); }
    else if (!en.isIntersecting) { running = false; cancelAnimationFrame(raf); }
  }).observe(stage);
})();

/* =====================================================================
   4. Hero globe: real land mask, lit sphere, shipping routes.
      Canvas 2D with a hand-written 3D projection. No libraries.
===================================================================== */
(function(){
  const MASK = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf8Af/AAAAAAAAAAAAAAAAAAAAAAAA//////+AAAAAAAADgAAAAAAAAAAAABf+f///4AA+AAAAAB8AAAAAAAAAABwAz4f///wAAYAAAEAAGAAAAAAAAAAAPi/wAf//wAAAAADAAf/4AHAAAAAAAH4n38AP//gAAAAAMBD///8DAAAADwACfw3/gP//gAAA4AMH///////gAAf////59jwH/+AAAP/gA//////////8P//////h+H/gAAAf/z///////////M///////n8D8A+AA+/f///////////AP/////4g4D4AAAH9/////////////Af/////gHgA4AAAP5///////////PwAHgP///gH0AAAAAH4/////////+CMAADAB///4H+AAAAGCx/////////8A8AAAAA////n/gAAAODj/////////wA4AAAAAf///v/wAAAbP///////////AwAAAAAP/////wAAAH////////////AAAAAAAH////8YAAAB///////////9AAAAAAAD////8EAAAB///////////9AAAAAAAD////+AAAAB//5fP//////4AAAAAAAD////gAAAAPxvwPP//////jAAAAAAAD////AAAAAfib//n/////+CAAAAAAAD///+AAAAAfADf/n////+MCAAAAAAAB///8AAAAAOeRP/3/////mOAAAAAAAA///8AAAAAH+AA///////E8AAAAAAAAf//wAAAAAP/gB///////hgAAAAAAAAP//gAAAAAf/7////////gAAAAAAAAAH/gwAAAAAf////f/////gAAAAAAAAAF+AQAAAAB///+/v/////AAAAAAAAAAC+AAAAAAD/////0X////AAAAAAAAAAAeAQAAAAD////f/D///8gAAAAAAAAAAfEEAAAAH////v/B/z/QAAAAAAAAAAAPMBgAAAD////v+A/B+gAAAAAAAAAAAD8AAAAAD////34AeB/AgAAAAAAAAAAAPAAAAAH////3wAcAfggAAAAAAAAAAADAAAAAD////+AAcAfgAAAAAAAAAAAABDwAAAD////9wAMATAYAAAAAAAAAAAA//AAAB/////gAOAQAIAAAAAAAAAAAAH/gAAA/////gACAIAIAAAAAAAAAAAAH/8AAAfH///AAAAsGAAAAAAAAAAAAAH/+AAAAB//+AAAAcOAAAAAAAAAAAAAP/+AAAAB//8AAAAc+gAAAAAAAAAAAAP//gAAAD//4AAAAMeggAAAAAAAAAAAP//8AAAB//wAAAAGdg+AAAAAAAAAAAf///AAAA//wAAAACAAPkAAAAAAAAAAP///gAAA//wAAAABwAHwAAAAAAAAAAP///AAAA//wAAAAAAIDYAAAAAAAAAAH///AAAAf/wAAAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//+AAAA//xgAAAAAPxgAAAAAAAAAAA//+AAAA//zgAAAAAf/gAAAAAAAAAAAf/8AAAA//DgAAAAAf/wAAAAAAAAAAAf/8AAAAf/DAAAAAD//4CAAAAAAAAAAf/4AAAAf/DAAAAAH//8AAAAAAAAAAAf/AAAAAf+CAAAAAH//8AAAAAAAAAAA//AAAAAf8AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAH4AAAAAAD//+AAAAAAAAAAA/8AAAAAHwAAAAAADwf8AAAAAAAAAAA/4AAAAAAAAAAAAACAH4AAAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB/AAAAAAAAAAAAAAAAAAAGAAAAAAAAB+AAAAAAAAAAAAAAAAAQAMAAAAAAAAB8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAAAwAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAA+AA//+//gAAAAAAAAAAAMAAAAAAADP/+H//////AAAAAAAAAAB+AAAAJf////8////////gAAAAAAPGB/AAAD///////////////gAAAf/////8AAAH//////////////+AABn/////+AAAH///////////////8AAE//////4ABw////////////////8AAAX//////nHg////////////////4AAAf/////////////////////////+A/4H///////////////////////////////////////////////////////////////////////////////////////";   // 180x90 land bitmap at 2 degrees per cell
  const canvas = document.getElementById('globe');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RAD = Math.PI / 180;

  // land dots: Fibonacci sphere, keep points that fall on land
  const bin = atob(MASK), bits = new Uint8Array(180 * 90);
  for (let i = 0; i < bits.length; i++) bits[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  const isLand = (lat, lon) =>
    bits[Math.min(89, Math.floor((90 - lat) / 2)) * 180 + Math.min(179, Math.floor((lon + 180) / 2))] === 1;
  const N = 9500, ga = Math.PI * (3 - Math.sqrt(5)), tmp = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i + .5) / N * 2, r = Math.sqrt(1 - y * y), th = ga * i;
    const x = Math.cos(th) * r, z = Math.sin(th) * r;
    if (isLand(Math.asin(y) / RAD, Math.atan2(x, z) / RAD)) tmp.push(x, y, z);
  }
  const land = new Float32Array(tmp);
  const vec = (lat, lon) => [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];

  // hubs and routes
  const hubs = [
    { n: 'Ahmedabad', lat: 23.03, lon: 72.58, main: true, side: 1 },
    { n: 'Rouen',     lat: 49.44, lon: 1.10,  main: true, side: -1 },
    { n: 'Mumbai',    lat: 19.08, lon: 72.88 },
    { n: 'Dubai',     lat: 25.2,  lon: 55.27 },
    { n: 'Singapore', lat: 1.35,  lon: 103.82 },
    { n: 'Shanghai',  lat: 31.23, lon: 121.47 },
    { n: 'Rotterdam', lat: 51.92, lon: 4.48 },
    { n: 'New York',  lat: 40.71, lon: -74.0 },
    { n: 'Sao Paulo', lat: -23.55, lon: -46.63 },
    { n: 'Lagos',     lat: 6.52,  lon: 3.38 }
  ];
  hubs.forEach(h => h.v = vec(h.lat, h.lon));
  const pairs = [[0,1],[2,3],[3,6],[4,2],[5,4],[6,7],[7,8],[9,6],[3,9]];
  const SEG = 72;
  const arcs = pairs.map(([a, b], i) => {
    const A = hubs[a].v, B = hubs[b].v;
    const dot = Math.min(1, Math.max(-1, A[0]*B[0] + A[1]*B[1] + A[2]*B[2]));
    const ang = Math.acos(dot), sa = Math.sin(ang);
    const lift = i === 0 ? .30 : .08 + .2 * ang / Math.PI;
    const pts = new Float32Array((SEG + 1) * 3);
    for (let k = 0; k <= SEG; k++) {
      const t = k / SEG, w1 = Math.sin((1 - t) * ang) / sa, w2 = Math.sin(t * ang) / sa;
      const h = 1 + lift * Math.sin(Math.PI * t);
      pts[k*3] = (w1*A[0] + w2*B[0]) * h; pts[k*3+1] = (w1*A[1] + w2*B[1]) * h; pts[k*3+2] = (w1*A[2] + w2*B[2]) * h;
    }
    return { pts, main: i === 0, speed: i === 0 ? .00017 : .0001 + .00004 * (i % 3), off: (i * .23) % 1 };
  });

  // view state
  const HOME = { lon: 38, lat: 30 };
  let baseLon = HOME.lon, baseLat = HOME.lat;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  let dragging = false, lastX = 0, lastY = 0, idleSince = performance.now();
  let W = 0, DPR = 1, running = false, raf = 0;

  function resize(){
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(W * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!running) draw(performance.now());
  }
  new ResizeObserver(resize).observe(canvas);

  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    if (dragging) {
      baseLon -= (e.clientX - lastX) * .35;
      baseLat = Math.max(-60, Math.min(70, baseLat + (e.clientY - lastY) * .3));
      lastX = e.clientX; lastY = e.clientY; idleSince = performance.now();
      if (!running) draw(performance.now());
    } else if (e.pointerType !== 'touch') {
      tmx = ((e.clientX - r.left) / r.width - .5) * 2; tmy = ((e.clientY - r.top) / r.height - .5) * 2;
    }
  });
  const endDrag = () => { dragging = false; idleSince = performance.now(); };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { tmx = 0; tmy = 0; });

  // drawing
  const buckets = Array.from({ length: 7 }, () => new Float32Array(land.length));
  const counts = new Int32Array(7);
  const pr = { x: 0, y: 0, z: 0 };
  let ca, sa_, cb, sb;
  function proj(x, y, z){
    const x1 = x * ca + z * sa_, z1 = -x * sa_ + z * ca;
    pr.x = x1; pr.y = y * cb - z1 * sb; pr.z = y * sb + z1 * cb;
  }
  const LX = -.5, LY = .55, LZ = .67;   // light from upper left, toward the viewer

  function draw(t){
    if (!W) return;
    const R = W * .40, cx = W / 2, cy = W / 2 - W * .03;
    const sway = reduce ? 0 : Math.sin(t / 3800) * 12;
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;
    const lon0 = (baseLon + sway + mx * 14) * RAD, lat0 = (baseLat - my * 9) * RAD;
    ca = Math.cos(-lon0); sa_ = Math.sin(-lon0); cb = Math.cos(lat0); sb = Math.sin(lat0);
    ctx.clearRect(0, 0, W, W);

    // soft lavender atmosphere
    let g = ctx.createRadialGradient(cx, cy, R * .97, cx, cy, R * 1.26);
    g.addColorStop(0, 'rgba(230,224,240,.36)'); g.addColorStop(.35, 'rgba(230,224,240,.10)'); g.addColorStop(1, 'rgba(230,224,240,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.26, 0, 7); ctx.fill();

    // ocean sphere in deep mocha
    g = ctx.createRadialGradient(cx - R * .38, cy - R * .42, R * .1, cx - R * .1, cy - R * .1, R * 1.25);
    g.addColorStop(0, '#8E6A4B'); g.addColorStop(.45, '#4F3625'); g.addColorStop(1, '#1F140D');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();

    // graticule
    ctx.strokeStyle = 'rgba(230,224,240,.10)'; ctx.lineWidth = 1;
    const line = (fn, n) => {
      ctx.beginPath(); let pen = false;
      for (let i = 0; i <= n; i++) {
        const v = fn(i / n); proj(v[0], v[1], v[2]);
        if (pr.z > 0) { const X = cx + pr.x * R, Y = cy - pr.y * R; pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true; } else pen = false;
      }
      ctx.stroke();
    };
    for (let la = -60; la <= 60; la += 30) line(u => vec(la, u * 360 - 180), 90);
    for (let lo = -180; lo < 180; lo += 30) line(u => vec(u * 180 - 90, lo), 60);

    // land dots (lavender), shaded by the light and bucketed so fillStyle changes only 7 times
    counts.fill(0);
    for (let i = 0; i < land.length; i += 3) {
      proj(land[i], land[i+1], land[i+2]);
      if (pr.z <= 0) continue;
      const nl = Math.max(0, pr.x * LX + pr.y * LY + pr.z * LZ);
      const b = Math.min(6, Math.floor((.30 + .70 * Math.pow(nl, .7)) * 7));
      const bk = buckets[b], c = counts[b];
      bk[c] = cx + pr.x * R; bk[c+1] = cy - pr.y * R; bk[c+2] = pr.z; counts[b] = c + 3;
    }
    const ds = Math.max(1.6, R / 135);
    for (let b = 0; b < 7; b++) {
      ctx.fillStyle = 'rgba(230,224,240,' + (.28 + b * .115).toFixed(2) + ')';
      const bk = buckets[b];
      for (let i = 0; i < counts[b]; i += 3) { const s = ds * (.55 + .6 * bk[i+2]); ctx.fillRect(bk[i] - s / 2, bk[i+1] - s / 2, s, s); }
    }

    // limb darkening and rim light
    g = ctx.createRadialGradient(cx - R * .32, cy - R * .38, R * .25, cx, cy, R * 1.02);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.65, 'rgba(30,18,10,.16)'); g.addColorStop(1, 'rgba(30,18,10,.6)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    g.addColorStop(0, 'rgba(245,238,255,.65)'); g.addColorStop(.45, 'rgba(245,238,255,.07)'); g.addColorStop(1, 'rgba(245,238,255,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();

    // routes and moving shipments (white and lavender)
    const vis = () => pr.z >= 0 || (pr.x * pr.x + pr.y * pr.y) > 1;
    arcs.forEach(a => {
      const p = a.pts;
      ctx.strokeStyle = a.main ? 'rgba(255,255,255,.92)' : 'rgba(230,224,240,.32)';
      ctx.lineWidth = a.main ? 2 : 1.1;
      ctx.beginPath(); let pen = false;
      for (let k = 0; k <= SEG; k++) {
        proj(p[k*3], p[k*3+1], p[k*3+2]);
        if (vis()) { const X = cx + pr.x * R, Y = cy - pr.y * R; pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true; } else pen = false;
      }
      ctx.stroke();

      const f = reduce ? (a.main ? .55 : a.off) : (t * a.speed + a.off) % 1;
      for (let j = 0; j < 9; j++) {
        const ff = f - j * .011; if (ff < 0) break;
        const fi = ff * SEG, i0 = Math.floor(fi), fr = fi - i0, i1 = Math.min(SEG, i0 + 1);
        proj(p[i0*3] + (p[i1*3] - p[i0*3]) * fr, p[i0*3+1] + (p[i1*3+1] - p[i0*3+1]) * fr, p[i0*3+2] + (p[i1*3+2] - p[i0*3+2]) * fr);
        if (!vis()) continue;
        const X = cx + pr.x * R, Y = cy - pr.y * R, k = 1 - j / 9;
        if (j === 0) {
          const hg = ctx.createRadialGradient(X, Y, 0, X, Y, a.main ? 14 : 9);
          hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(1, 'rgba(230,224,240,0)');
          ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(X, Y, a.main ? 14 : 9, 0, 7); ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,' + (.92 * k).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(X, Y, (a.main ? 2.6 : 1.8) * k + .4, 0, 7); ctx.fill();
      }
    });

    // hubs and labels
    ctx.font = '600 ' + Math.max(12, W / 46).toFixed(1) + 'px "Instrument Sans", system-ui, sans-serif';
    ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    hubs.forEach(h => {
      proj(h.v[0], h.v[1], h.v[2]);
      if (pr.z < .04) return;
      const X = cx + pr.x * R, Y = cy - pr.y * R;
      if (h.main) {
        const ph = reduce ? .4 : (t / 1500 + (h.side > 0 ? 0 : .5)) % 1;
        ctx.strokeStyle = 'rgba(230,224,240,' + (.8 * (1 - ph)).toFixed(2) + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(X, Y, 5 + ph * 14, 0, 7); ctx.stroke();
        ctx.fillStyle = '#E6E0F0'; ctx.beginPath(); ctx.arc(X, Y, 4.4, 0, 7); ctx.fill();
        ctx.fillStyle = '#4A3323'; ctx.beginPath(); ctx.arc(X, Y, 1.7, 0, 7); ctx.fill();
        ctx.textAlign = h.side > 0 ? 'left' : 'right';
        const a = Math.min(1, pr.z * 2.2).toFixed(2);
        ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(46,31,21,' + a + ')'; ctx.strokeText(h.n, X + h.side * 12, Y - 2);
        ctx.fillStyle = 'rgba(245,242,250,' + a + ')'; ctx.fillText(h.n, X + h.side * 12, Y - 2);
      } else {
        ctx.fillStyle = 'rgba(230,224,240,.9)'; ctx.beginPath(); ctx.arc(X, Y, 2.2, 0, 7); ctx.fill();
      }
    });
  }

  function loop(t){
    // after 5 seconds of no dragging, ease back to the Ahmedabad to Rouen view
    if (!dragging && t - idleSince > 5000) { baseLon += (HOME.lon - baseLon) * .02; baseLat += (HOME.lat - baseLat) * .02; }
    draw(t);
    if (running) raf = requestAnimationFrame(loop);
  }
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(([en]) => { en.isIntersecting ? start() : stop(); }).observe(canvas);
  resize();
})();

/* =====================================================================
   5. Certificates: built from certificates.js. Clicking one opens
      certificate.html, a page of its own for that certificate.
===================================================================== */
(function(){
  const host = document.getElementById('certGroups');
  const list = window.CERTIFICATES || [];
  if (!host || !list.length) return;
  const make = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };

  const groups = [];
  list.forEach(c => {
    let g = groups.find(x => x.name === c.group);
    if (!g) { g = { name: c.group, items: [] }; groups.push(g); }
    g.items.push(c);
  });

  groups.forEach(g => {
    const wrap = make('div', 'cert-group');
    wrap.appendChild(make('h3', '', g.name));
    const ul = make('ul', 'cert-grid');
    g.items.forEach(c => {
      const li = document.createElement('li');
      const a = make('a', 'cert tilt'); a.dataset.tilt = '4';
      a.href = 'certificate.html?c=' + encodeURIComponent(c.slug);
      a.setAttribute('aria-label', 'Open certificate: ' + c.title);
      const img = document.createElement('img');
      img.src = 'certificates/' + c.slug + '-thumb.webp';
      img.alt = 'Preview of the certificate ' + c.title;
      img.loading = 'lazy'; img.width = 720; img.height = 540;
      const body = make('div', 'cert-body');
      body.appendChild(make('span', 'cert-title', c.title));
      body.appendChild(make('span', 'cert-issuer', c.issuer));
      if (c.date) body.appendChild(make('span', 'cert-date', c.date));
      body.appendChild(make('span', 'cert-open', 'View certificate'));
      a.appendChild(img); a.appendChild(body); li.appendChild(a); ul.appendChild(li);
    });
    wrap.appendChild(ul); host.appendChild(wrap);
  });
  initTilt(host);
})();

/* =====================================================================
   6. Contact: email, phone, copy buttons, message form, Rouen clock
===================================================================== */
(function(){
  const live = document.getElementById('live');
  const isTouch = () => matchMedia('(pointer: coarse)').matches;
  const mailto = (subject, body) =>
    'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent(subject || '') + '&body=' + encodeURIComponent(body || '');
  const gmail = (subject, body) =>
    'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT.email) +
    '&su=' + encodeURIComponent(subject || '') + '&body=' + encodeURIComponent(body || '');

  // Email button: phones open the mail app; computers open Gmail in a new tab.
  // (Many computers have no mail app set up, which is why a plain mailto link often does nothing.)
  const emailBtn = document.getElementById('emailBtn');
  emailBtn.addEventListener('click', e => {
    e.preventDefault();
    if (isTouch()) window.location.href = mailto('Hello Harsh', '');
    else window.open(gmail('Hello Harsh', ''), '_blank', 'noopener');
  });

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try { await navigator.clipboard.writeText(text); }
      catch (e) {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      const old = btn.textContent; btn.textContent = 'Copied';
      live.textContent = btn.dataset.what + ' copied';
      setTimeout(() => { btn.textContent = old; }, 1800);
    });
  });

  // Message form: sends straight to your inbox through FormSubmit (free, no account).
  // If that fails (offline, blocked, not activated yet), the visitor gets two one-click fallbacks.
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const btn = document.getElementById('fBtn');
  const setNote = (cls, text) => { note.className = 'form-note ' + cls; note.textContent = text; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.fName.value.trim(), email = form.fEmail.value.trim(), msg = form.fMsg.value.trim();
    if (form.fHp.value) return;                                    // spam trap
    if (!name || !msg || !/^\S+@\S+\.\S+$/.test(email)) {
      setNote('err', 'Please add your name, a valid email address and a message.'); return;
    }
    const subject = 'Portfolio message from ' + name;
    btn.disabled = true; btn.textContent = 'Sending...'; setNote('', '');
    try {
      const res = await fetch('https://formsubmit.co/ajax/' + CONTACT.email, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, message: msg, _subject: subject, _template: 'table', _captcha: 'false' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== 'true') throw new Error('not sent');
      form.reset();
      setNote('ok', 'Message sent. Thank you, ' + name + '!');
    } catch (err) {
      const body = msg + '\n\n- ' + name + ' (' + email + ')';
      note.className = 'form-note err'; note.textContent = "I couldn't send this directly. Send it with ";
      const g = document.createElement('a'); g.href = gmail(subject, body); g.target = '_blank'; g.rel = 'noopener'; g.textContent = 'Gmail';
      const m = document.createElement('a'); m.href = mailto(subject, body); m.textContent = 'your mail app';
      note.append(g, ' or ', m, '. Your message is filled in.');
    } finally {
      btn.disabled = false; btn.textContent = 'Send message';
    }
  });

  // Rouen clock
  const clock = document.getElementById('rouenTime');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  const tickClock = () => { clock.textContent = fmt.format(new Date()); };
  tickClock(); setInterval(tickClock, 30000);
})();


/* =====================================================================
   7. Depth parallax: the chrome ribbons and the hero text follow the
      cursor and the scroll, so the page has real depth
===================================================================== */
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sets = [...document.querySelectorAll('.ribbons')].map(rb => ({ rb, host: rb.parentElement }));
  sets.forEach(({ rb, host }) => {
    const copy = host.classList.contains('hero') ? host.querySelector('.hero-copy') : null;
    const put = (mx, my) => {
      rb.style.setProperty('--mx', mx); rb.style.setProperty('--my', my);
      if (copy) { copy.style.setProperty('--mx', mx); copy.style.setProperty('--my', my); }
    };
    host.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = host.getBoundingClientRect();
      put((((e.clientX - r.left) / r.width - .5) * 2).toFixed(3), (((e.clientY - r.top) / r.height - .5) * 2).toFixed(3));
    });
    host.addEventListener('pointerleave', () => put('0', '0'));
  });
  let ticking = false;
  const onScroll = () => {
    sets.forEach(({ rb, host }) => {
      const r = host.getBoundingClientRect();
      const sy = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
      rb.style.setProperty('--sy', sy.toFixed(3));
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();

/* =====================================================================
   8. 3D entrance: blocks flip up out of the depth as they scroll into view
===================================================================== */
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const sel = ['.sec h2', '.sec .section-intro', '.about-grid > *', '.timeline > li', '.proj-grid > *', '.orbit',
               '.skill-grid > *', '.soft', '.edu-grid > *', '.cert-group', '.contact-cards > *', '.contact-grid > .form', '.local-time'];
  const els = [...new Set(sel.flatMap(q => [...document.querySelectorAll(q)]))];
  els.forEach(el => {
    el.classList.add('reveal');
    const idx = Math.min(4, [...el.parentElement.children].indexOf(el));
    el.style.setProperty('--d', (idx * 110) + 'ms');
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; io.unobserve(el);
      el.classList.add('in');
      // when the entrance is finished, hand the element back to its normal styles (so tilt stays snappy)
      setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); }, 1500);
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
})();

/* =====================================================================
   9. 3D skills orbit: a ring of tiles turning in space. Drag to spin it.
===================================================================== */
(function(){
  const host = document.getElementById('orbit'), ring = document.getElementById('orbitRing');
  if (!host || !ring) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = ['Python', 'SQL', 'Power BI', 'Excel', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'ARIMA', 'EDA', 'Time series', 'Data viz'];
  const step = 360 / items.length;
  const tiles = items.map(t => { const d = document.createElement('div'); d.className = 'orbit-tile'; d.textContent = t; ring.appendChild(d); return d; });

  function layout(){
    const small = host.clientWidth < 520;
    const tw = small ? 92 : 150, th = small ? 56 : 86;
    ring.style.setProperty('--tw', tw + 'px'); ring.style.setProperty('--th', th + 'px');
    const R = Math.round((tw / 2) / Math.tan(Math.PI / items.length)) + (small ? 20 : 34);
    tiles.forEach((d, i) => { d.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
  }
  layout(); new ResizeObserver(layout).observe(host);

  let angle = -20, vel = 0, dragging = false, lastX = 0, visible = false, raf = 0, last = 0;
  const speed = reduce ? 0 : .014;                 // degrees per millisecond
  function tick(t){
    const dt = last ? Math.min(40, t - last) : 16; last = t;
    if (!dragging) { vel *= .95; angle += vel + speed * dt; }
    ring.style.setProperty('--a', angle.toFixed(2) + 'deg');
    if (visible) raf = requestAnimationFrame(tick);
  }
  host.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; vel = 0; host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; angle += dx * .45; vel = dx * .22; });
  ['pointerup', 'pointercancel'].forEach(ev => host.addEventListener(ev, () => { dragging = false; }));
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) { last = 0; raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf);
  }).observe(host);
})();

/* =====================================================================
   10. Opening screen: 3D emoji and "Harsh Gohel portfolio" for a few
       seconds, then the page rises into view. Shown once per visit.
       (Add ?intro=1 to the address to see it again.)
===================================================================== */
(function(){
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro || !root.classList.contains('intro-on')) { root.classList.add('ready'); return; }

  // split the name into letters so each one can rise in turn
  const nameEl = document.getElementById('introName');
  const text = nameEl.textContent; nameEl.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true');
    s.textContent = ch === ' ' ? '\u00A0' : ch; nameEl.appendChild(s);
  });
  try { sessionStorage.setItem('hg-intro', '1'); } catch (e) {}

  let done = false;
  function close(){
    if (done) return; done = true;
    intro.classList.add('is-out');
    root.classList.add('ready');                    // the hero starts building as the curtain lifts
    setTimeout(() => { root.classList.remove('intro-on'); intro.remove(); }, 1000);
  }
  setTimeout(close, 3600);
  document.getElementById('introSkip').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (!done && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) close(); });
})();
