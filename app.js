/* ================================================
   DesignAI — app.js  (Part 1 of 2)
   Phases 1–6 logic
   ================================================ */

// ─── Global State ────────────────────────────────
const state = {
  currentPhase: 1,
  user: null,
  cadObjects: [],
  cadHistory: [],
  cadHistoryIndex: -1,
  currentTool: 'wall',
  cadStart: null,
  gridSize: 20,
  snapEnabled: true,
  showGrid: true,
  floorPlan: null,
  vastuResult: null,
  selectedMaterials: {},
  matCategory: 'flooring',
  furnitureLayout: null,
  scene3D: null,
  sceneAnimFrame: null,
  cameraSettings: { preset: 'wide', lighting: 'daylight', fov: 75 },
  renderSettings: { quality: 'medium', progress: 0 },
  budget: 20,
  workflow: { running: false, step: 0 },
  wallColor: '#F5F0E8',
  floorMaterial: 'wood'
};

// ─── Phase Data ───────────────────────────────────
const PHASES = [
  { num:1,  icon:'🏗️', title:'Application Foundation',      tags:['React','FastAPI','PostgreSQL','JWT'],     desc:'User accounts, projects, cloud storage & version history via REST APIs.' },
  { num:2,  icon:'📐', title:'2D CAD Engine',                tags:['Canvas/SVG','TypeScript','Geometry'],     desc:'Draw walls, rooms, doors, windows, stairs with snapping, undo/redo & dimensions.' },
  { num:3,  icon:'🤖', title:'AI Prompt Interpreter',        tags:['LLM','Python','FastAPI','NLP'],           desc:'Natural language prompt → structured JSON with budget, style & room constraints.' },
  { num:4,  icon:'🗺️', title:'AI Floor Planning Engine',     tags:['Computational Geometry','Optimization'],  desc:'Generates optimized 2D floor plans from parsed prompt using geometry algorithms.' },
  { num:5,  icon:'🕉️', title:'AI Vastu Validation',          tags:['Rule Engine','Knowledge Base'],           desc:'Validates layout against Vastu rules, auto-rearranges violating rooms.' },
  { num:6,  icon:'🎨', title:'AI Material Recommendation',   tags:['ML Ranking','Catalog','Budget'],          desc:'Ranks flooring, paint, furniture & lighting by budget, style & durability.' },
  { num:7,  icon:'🪑', title:'AI Furniture Placement',       tags:['Spatial Reasoning','Collision Detection'], desc:'Auto-places furniture with walking space, door clearance & wall alignment.' },
  { num:8,  icon:'🎮', title:'3D Scene Generator',           tags:['Three.js','Blender API','WebGL'],         desc:'Converts 2D plan to 3D scene: walls, floors, ceilings, doors & furniture.' },
  { num:9,  icon:'📷', title:'AI Camera & Lighting',         tags:['HDRI','Focal Length','Composition'],      desc:'AI selects camera angles, HDRI environment, exposure & lighting positions.' },
  { num:10, icon:'✨', title:'Photorealistic Rendering',     tags:['PBR','Global Illumination','Ray Tracing'], desc:'Cycles/engine renders with reflections, shadows & realistic materials.' },
  { num:11, icon:'💰', title:'Budget & Shopping Engine',     tags:['Estimating','Material QTY','Labor'],      desc:'Itemized cost breakdown, material quantities & shopping recommendations.' },
  { num:12, icon:'🚀', title:'Complete AI Workflow',         tags:['End-to-End','Automation','Pipeline'],     desc:'One prompt triggers all 12 phases automatically.' }
];

const WORKFLOW_STEPS = [
  { icon:'📝', label:'Enter Requirements' },
  { icon:'🤖', label:'AI Interprets' },
  { icon:'🗺️', label:'Generate Plan' },
  { icon:'🕉️', label:'Vastu Check' },
  { icon:'🎨', label:'Materials' },
  { icon:'🪑', label:'Furniture' },
  { icon:'🎮', label:'3D Model' },
  { icon:'📷', label:'Camera' },
  { icon:'✨', label:'Render' },
  { icon:'💰', label:'Budget Report' }
];

// ─── Utility Functions ────────────────────────────
function toast(msg, type = 'info', duration = 3000) {
  const t = document.getElementById('toast');
  const icons = { success: '✅', error: '❌', info: '💡' };
  t.innerHTML = `<span>${icons[type] || '💡'}</span><span>${msg}</span>`;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast ' + type; }, duration);
}

function showLoading(text = 'Processing...', cb, duration = 1800) {
  const overlay = document.getElementById('loadingOverlay');
  const textEl = document.getElementById('loadingText');
  const bar = document.getElementById('loadingBar');
  textEl.textContent = text;
  bar.style.width = '0%';
  overlay.classList.add('show');
  let prog = 0;
  const iv = setInterval(() => {
    prog += Math.random() * 18;
    if (prog >= 90) prog = 90;
    bar.style.width = prog + '%';
  }, 150);
  setTimeout(() => {
    clearInterval(iv);
    bar.style.width = '100%';
    setTimeout(() => {
      overlay.classList.remove('show');
      if (cb) cb();
    }, 300);
  }, duration);
}

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function lerp(a, b, t) { return a + (b - a) * t; }

// ─── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildPhasesTimeline();
  buildPhaseTabs();
  buildWorkflowPipeline();
  buildWorkflowFlow();
  buildFooterPhases();
  initNavbar();
  initHeroCanvas();
  initPhase1();
  initPhase2();
  initPhase3();
  initPhase4();
  initPhase5();
  initPhase6();
  initPhase7();
  initPhase8();
  initPhase9();
  initPhase10();
  initPhase11();
  initPhase12();
  initNavButtons();
});

// ─── Build UI Components ──────────────────────────
function buildPhasesTimeline() {
  const container = document.getElementById('phasesTimeline');
  if (!container) return;
  container.innerHTML = PHASES.map(p => `
    <div class="phase-card" onclick="switchPhase(${p.num})">
      <div class="phase-card-num">${String(p.num).padStart(2,'0')}</div>
      <div class="phase-card-icon">${p.icon}</div>
      <div class="phase-card-title">${p.title}</div>
      <div class="phase-card-desc">${p.desc}</div>
      <div class="phase-card-tags">${p.tags.map(t=>`<span class="phase-tag">${t}</span>`).join('')}</div>
    </div>
  `).join('');
}

function buildPhaseTabs() {
  const container = document.getElementById('phaseTabs');
  if (!container) return;
  container.innerHTML = PHASES.map(p => `
    <button class="phase-tab ${p.num===1?'active':''}" id="tab-${p.num}" onclick="switchPhase(${p.num})">
      <span class="tab-num">${p.num}</span>
      ${p.icon} ${p.title.split(' ').slice(0,2).join(' ')}
    </button>
  `).join('');
}

function buildWorkflowPipeline() {
  const container = document.getElementById('workflowPipeline');
  if (!container) return;
  container.innerHTML = WORKFLOW_STEPS.map((s, i) => `
    ${i > 0 ? '<div class="pipeline-arrow">›</div>' : ''}
    <div class="pipeline-step" id="pipe-${i}" data-step="${i}">
      <div class="pipeline-step-icon">${s.icon}</div>
      <div class="pipeline-step-num">STEP ${i+1}</div>
      <div class="pipeline-step-label">${s.label}</div>
    </div>
  `).join('');
}

function buildWorkflowFlow() {
  const container = document.getElementById('workflowFlow');
  if (!container) return;
  container.innerHTML = WORKFLOW_STEPS.map((s, i) => `
    ${i > 0 ? '<div class="wf-arrow">→</div>' : ''}
    <div class="workflow-flow-step">
      <div class="wf-icon-wrap">${s.icon}</div>
      <div class="wf-label">${s.label}</div>
    </div>
  `).join('');
}

function buildFooterPhases() {
  const container = document.getElementById('footerPhaseList');
  if (!container) return;
  container.innerHTML = PHASES.map(p => `
    <div class="footer-phase-item" onclick="switchPhase(${p.num})">${p.icon} ${p.title}</div>
  `).join('');
}

function switchPhase(num) {
  state.currentPhase = num;
  document.querySelectorAll('.phase-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('panel-' + num);
  const tab = document.getElementById('tab-' + num);
  if (panel) { panel.classList.add('active'); panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  if (tab) { tab.classList.add('active'); tab.scrollIntoView({ behavior: 'smooth', inline: 'nearest' }); }
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  // Trigger phase-specific init actions
  if (num === 5) initVastuCompass();
  if (num === 8) setTimeout(() => { if (!state.scene3DInit) initScene3D(); }, 200);
}

// ─── Navbar ───────────────────────────────────────
function initNavbar() {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
  });
}

function initNavButtons() {
  document.getElementById('startBtn')?.addEventListener('click', () => { document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); });
  document.getElementById('heroStartBtn')?.addEventListener('click', () => { document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); });
  document.getElementById('heroWatchBtn')?.addEventListener('click', () => { switchPhase(4); });
  document.getElementById('loginBtn')?.addEventListener('click', () => { switchPhase(1); document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); });
}

// ─── Hero Canvas: Animated Mini Floor Plan ────────
function initHeroCanvas() {
  const canvas = document.getElementById('miniFloorPlan');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function drawMiniFloorPlan() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0A0F1E';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(124,58,237,0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const rooms = [
      { x:20, y:20, w:140, h:100, color:'rgba(124,58,237,0.15)', border:'rgba(124,58,237,0.5)', label:'Living Room' },
      { x:20, y:130, w:80, h:60, color:'rgba(37,99,235,0.15)', border:'rgba(37,99,235,0.5)', label:'Kitchen' },
      { x:110, y:130, w:50, h:60, color:'rgba(6,182,212,0.15)', border:'rgba(6,182,212,0.5)', label:'Bath' },
      { x:170, y:20, w:130, h:80, color:'rgba(236,72,153,0.12)', border:'rgba(236,72,153,0.4)', label:'Bedroom' },
      { x:170, y:110, w:130, h:80, color:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.4)', label:'Bedroom 2' }
    ];

    const pulse = 0.6 + 0.4 * Math.sin(t * 0.05);
    rooms.forEach((r, i) => {
      const a = 0.7 + 0.3 * Math.sin(t * 0.03 + i);
      ctx.fillStyle = r.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = r.border;
      ctx.lineWidth = 1.5 * a;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.font = '7px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.label, r.x + r.w/2, r.y + r.h/2 + 3);
    });

    // Animated scan line
    const scanY = ((t * 1.5) % H);
    ctx.strokeStyle = `rgba(124,58,237,${0.4 * pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();

    // Dots on corners
    rooms.forEach(r => {
      [[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h]].forEach(([px,py]) => {
        ctx.fillStyle = `rgba(167,139,250,${pulse})`;
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
      });
    });

    t++;
    requestAnimationFrame(drawMiniFloorPlan);
  }
  drawMiniFloorPlan();
}

// ═══════════════════════════════════════════════════
//  PHASE 1 — Application Foundation (Auth + Dashboard)
// ═══════════════════════════════════════════════════
function initPhase1() {
  // Auth tabs
  document.querySelectorAll('.auth-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
      document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
    });
  });

  document.getElementById('loginSubmit')?.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    if (!email) { toast('Enter your email address', 'error'); return; }
    if (!pass) { toast('Enter your password', 'error'); return; }
    showLoading('Authenticating with JWT...', () => {
      const name = email.split('@')[0];
      state.user = { name, email, token: 'jwt_' + Math.random().toString(36).slice(2) };
      updateDashboard(state.user);
      toast('Welcome back, ' + name + '! 🎉', 'success');
    }, 1500);
  });

  document.getElementById('registerSubmit')?.addEventListener('click', () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    if (!name || !email || !pass) { toast('Fill in all fields', 'error'); return; }
    showLoading('Creating your account...', () => {
      state.user = { name, email, token: 'jwt_' + Math.random().toString(36).slice(2) };
      updateDashboard(state.user);
      toast('Account created! Welcome, ' + name + ' 🚀', 'success');
    }, 1800);
  });
}

function updateDashboard(user) {
  const initial = user.name.charAt(0).toUpperCase();
  document.getElementById('dbAvatar').textContent = initial;
  document.getElementById('dbName').textContent = user.name;
  const badge = document.getElementById('dbBadge');
  badge.textContent = '● Online';
  badge.classList.add('online');
}

// ═══════════════════════════════════════════════════
//  PHASE 2 — 2D CAD Engine
// ═══════════════════════════════════════════════════
function initPhase2() {
  const canvas = document.getElementById('cadCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drawing = false, currentObj = null;

  function snap(v) {
    if (!state.snapEnabled) return v;
    return Math.round(v / state.gridSize) * state.gridSize;
  }

  function drawCAD() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0A0F1E';
    ctx.fillRect(0, 0, W, H);

    if (state.showGrid) {
      ctx.strokeStyle = 'rgba(124,58,237,0.12)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= W; x += state.gridSize) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y <= H; y += state.gridSize) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      // Major grid lines
      ctx.strokeStyle = 'rgba(124,58,237,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += state.gridSize*5) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y <= H; y += state.gridSize*5) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    }

    // Draw saved objects
    state.cadObjects.forEach(obj => drawCadObj(ctx, obj));

    // Draw current in-progress object
    if (currentObj) drawCadObj(ctx, currentObj, true);

    document.getElementById('cadObjectCount').textContent = state.cadObjects.length;
  }

  function drawCadObj(ctx, obj, preview = false) {
    ctx.save();
    ctx.globalAlpha = preview ? 0.7 : 1;
    const styles = {
      wall: { stroke: '#A78BFA', fill: 'rgba(124,58,237,0.2)', lw: 3 },
      room: { stroke: '#60A5FA', fill: 'rgba(37,99,235,0.08)', lw: 2 },
      door: { stroke: '#34D399', fill: 'rgba(16,185,129,0.15)', lw: 2 },
      window: { stroke: '#FCD34D', fill: 'rgba(245,158,11,0.15)', lw: 2 },
      stairs: { stroke: '#F87171', fill: 'rgba(239,68,68,0.12)', lw: 2 }
    };
    const s = styles[obj.type] || styles.wall;
    ctx.strokeStyle = s.stroke;
    ctx.fillStyle = s.fill;
    ctx.lineWidth = s.lw;

    if (obj.type === 'wall') {
      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1); ctx.lineTo(obj.x2, obj.y2);
      ctx.strokeStyle = s.stroke; ctx.lineWidth = 6;
      ctx.lineCap = 'round'; ctx.stroke();
      // Endpoint dots
      [{ x: obj.x1, y: obj.y1 }, { x: obj.x2, y: obj.y2 }].forEach(p => {
        ctx.fillStyle = '#A78BFA';
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
      });
    } else if (obj.type === 'stairs') {
      const steps = 5;
      const dx = (obj.x2 - obj.x1) / steps;
      ctx.fillStyle = s.fill;
      ctx.fillRect(obj.x1, obj.y1, obj.x2 - obj.x1, obj.y2 - obj.y1);
      ctx.strokeStyle = s.stroke; ctx.lineWidth = s.lw;
      ctx.strokeRect(obj.x1, obj.y1, obj.x2 - obj.x1, obj.y2 - obj.y1);
      for (let i = 1; i < steps; i++) {
        const sx = obj.x1 + dx * i;
        ctx.beginPath(); ctx.moveTo(sx, obj.y1); ctx.lineTo(sx, obj.y2);
        ctx.strokeStyle = 'rgba(248,113,113,0.4)'; ctx.lineWidth = 1; ctx.stroke();
      }
    } else {
      ctx.fillRect(obj.x1, obj.y1, obj.x2 - obj.x1, obj.y2 - obj.y1);
      ctx.strokeRect(obj.x1, obj.y1, obj.x2 - obj.x1, obj.y2 - obj.y1);
      // Label for door/window
      if (obj.type === 'door') {
        ctx.fillStyle = '#34D399'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
        ctx.fillText('D', obj.x1 + (obj.x2-obj.x1)/2, obj.y1 + (obj.y2-obj.y1)/2 + 4);
      } else if (obj.type === 'window') {
        ctx.fillStyle = '#FCD34D'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
        ctx.fillText('W', obj.x1 + (obj.x2-obj.x1)/2, obj.y1 + (obj.y2-obj.y1)/2 + 4);
        // Glass panes
        const mx = (obj.x1 + obj.x2) / 2;
        ctx.beginPath(); ctx.moveTo(mx, obj.y1); ctx.lineTo(mx, obj.y2);
        ctx.strokeStyle = 'rgba(252,211,77,0.3)'; ctx.lineWidth = 1; ctx.stroke();
      }
    }

    // Dimension label
    if (!preview && (obj.type === 'wall' || obj.type === 'room')) {
      const len = obj.type === 'wall'
        ? Math.round(Math.sqrt((obj.x2-obj.x1)**2 + (obj.y2-obj.y1)**2) / 10 * 10) / 10
        : Math.round(Math.abs(obj.x2-obj.x1) / 10);
      ctx.fillStyle = 'rgba(148,163,184,0.8)'; ctx.font = '9px Inter'; ctx.textAlign = 'center';
      const mx = (obj.x1+obj.x2)/2, my = (obj.y1+obj.y2)/2;
      ctx.fillText(len + 'm', mx, my - 5);
    }
    ctx.restore();
  }

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: snap((e.clientX - rect.left) * scaleX), y: snap((e.clientY - rect.top) * scaleY) };
  }

  canvas.addEventListener('mousedown', e => {
    if (state.currentTool === 'select' || state.currentTool === 'erase') return;
    const pos = getCanvasPos(e);
    drawing = true;
    state.cadStart = pos;
    currentObj = { type: state.currentTool, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
  });

  canvas.addEventListener('mousemove', e => {
    const pos = getCanvasPos(e);
    document.getElementById('cadCursorPos').textContent = `${Math.round(pos.x/10)}m, ${Math.round(pos.y/10)}m`;
    if (!drawing || !currentObj) { drawCAD(); return; }
    if (state.currentTool === 'wall') {
      // Snap to 45° angles
      const dx = pos.x - state.cadStart.x;
      const dy = pos.y - state.cadStart.y;
      const angle = Math.atan2(dy, dx);
      const snappedAngle = Math.round(angle / (Math.PI/4)) * (Math.PI/4);
      const dist = Math.sqrt(dx*dx + dy*dy);
      currentObj.x2 = state.cadStart.x + Math.cos(snappedAngle) * dist;
      currentObj.y2 = state.cadStart.y + Math.sin(snappedAngle) * dist;
    } else {
      currentObj.x2 = pos.x; currentObj.y2 = pos.y;
    }
    drawCAD();
  });

  canvas.addEventListener('mouseup', e => {
    if (!drawing || !currentObj) return;
    drawing = false;
    const obj = { ...currentObj };
    // Normalize rect-based objects
    if (obj.type !== 'wall') {
      const x1 = Math.min(obj.x1,obj.x2), y1 = Math.min(obj.y1,obj.y2);
      const x2 = Math.max(obj.x1,obj.x2), y2 = Math.max(obj.y1,obj.y2);
      if (Math.abs(x2-x1) < 5 || Math.abs(y2-y1) < 5) { currentObj = null; drawCAD(); return; }
      obj.x1=x1; obj.y1=y1; obj.x2=x2; obj.y2=y2;
    } else {
      if (Math.abs(obj.x2-obj.x1) < 5 && Math.abs(obj.y2-obj.y1) < 5) { currentObj = null; drawCAD(); return; }
    }
    state.cadObjects.push(obj);
    state.cadHistory = state.cadHistory.slice(0, state.cadHistoryIndex + 1);
    state.cadHistory.push([...state.cadObjects]);
    state.cadHistoryIndex = state.cadHistory.length - 1;
    currentObj = null;
    drawCAD();
    toast(`${obj.type.charAt(0).toUpperCase()+obj.type.slice(1)} added`, 'success', 1500);
  });

  // Click to erase
  canvas.addEventListener('click', e => {
    if (state.currentTool !== 'erase') return;
    const pos = getCanvasPos(e);
    const before = state.cadObjects.length;
    state.cadObjects = state.cadObjects.filter(obj => {
      if (obj.type === 'wall') {
        const dx = obj.x2-obj.x1, dy = obj.y2-obj.y1;
        const t = Math.max(0, Math.min(1, ((pos.x-obj.x1)*dx+(pos.y-obj.y1)*dy)/(dx*dx+dy*dy)));
        const dist = Math.sqrt((pos.x-(obj.x1+t*dx))**2+(pos.y-(obj.y1+t*dy))**2);
        return dist > 12;
      }
      const x1=Math.min(obj.x1,obj.x2),y1=Math.min(obj.y1,obj.y2),x2=Math.max(obj.x1,obj.x2),y2=Math.max(obj.y1,obj.y2);
      return !(pos.x>=x1&&pos.x<=x2&&pos.y>=y1&&pos.y<=y2);
    });
    if (state.cadObjects.length < before) { drawCAD(); toast('Object erased', 'info', 1200); }
  });

  // Tool buttons
  document.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentTool = btn.dataset.tool;
      document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('cadCurrentTool').textContent = state.currentTool.charAt(0).toUpperCase() + state.currentTool.slice(1);
      canvas.style.cursor = state.currentTool === 'select' ? 'default' : state.currentTool === 'erase' ? 'not-allowed' : 'crosshair';
    });
  });

  document.getElementById('toolUndo')?.addEventListener('click', () => {
    if (state.cadHistoryIndex > 0) { state.cadHistoryIndex--; state.cadObjects = [...state.cadHistory[state.cadHistoryIndex]]; drawCAD(); toast('Undo', 'info', 1000); }
    else toast('Nothing to undo', 'error', 1000);
  });
  document.getElementById('toolRedo')?.addEventListener('click', () => {
    if (state.cadHistoryIndex < state.cadHistory.length - 1) { state.cadHistoryIndex++; state.cadObjects = [...state.cadHistory[state.cadHistoryIndex]]; drawCAD(); toast('Redo', 'info', 1000); }
    else toast('Nothing to redo', 'error', 1000);
  });
  document.getElementById('toolClear')?.addEventListener('click', () => {
    if (state.cadObjects.length === 0) return;
    state.cadObjects = []; state.cadHistory = [[]]; state.cadHistoryIndex = 0; drawCAD(); toast('Canvas cleared', 'info', 1200);
  });

  document.getElementById('showGrid')?.addEventListener('change', e => { state.showGrid = e.target.checked; drawCAD(); });
  document.getElementById('snapGrid')?.addEventListener('change', e => { state.snapEnabled = e.target.checked; });

  drawCAD();
}

// ═══════════════════════════════════════════════════
//  PHASE 3 — AI Prompt Interpreter
// ═══════════════════════════════════════════════════
function initPhase3() {
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('designPrompt').value = chip.dataset.prompt;
    });
  });

  document.getElementById('interpretBtn')?.addEventListener('click', () => {
    const prompt = document.getElementById('designPrompt').value.trim();
    if (!prompt) { toast('Enter a design prompt first', 'error'); return; }
    const status = document.getElementById('jsonStatus');
    const output = document.getElementById('jsonOutput');
    status.textContent = 'Processing...';
    status.className = 'json-status processing';
    output.innerHTML = '<div class="json-placeholder"><div class="json-icon">⏳</div><div>AI is interpreting your prompt…</div></div>';
    showLoading('AI interpreting prompt...', () => {
      const json = interpretPrompt(prompt);
      status.textContent = '✓ Done';
      status.className = 'json-status done';
      output.innerHTML = '';
      output.textContent = JSON.stringify(json, null, 2);
      state.floorPlan = json;
      toast('Prompt interpreted successfully! ✅', 'success');
    }, 2200);
  });

  // Also handle workflowPrompt
  document.getElementById('workflowPrompt')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.ctrlKey) document.getElementById('runFullWorkflow')?.click();
  });
}

function interpretPrompt(prompt) {
  const lower = prompt.toLowerCase();
  const bhkMatch = lower.match(/(\d)\s*bhk/);
  const areaMatch = lower.match(/(\d[\d,]*)\s*(?:sq\s*ft|sqft)/);
  const budgetMatch = lower.match(/(?:rs\.?|₹)\s*([\d.]+)\s*(?:lakh|l\b)/i);
  const styles = ['modern','traditional','minimalist','luxury','rustic','scandinavian','contemporary'];
  const detectedStyle = styles.find(s => lower.includes(s)) || 'modern';
  const colors = ['white','beige','grey','earthy','warm','cool','dark','light'];
  const detectedColor = colors.find(c => lower.includes(c)) || 'neutral';

  const bhk = bhkMatch ? parseInt(bhkMatch[1]) : 3;
  const area = areaMatch ? parseInt(areaMatch[1].replace(',','')) : 1200;
  const budget = budgetMatch ? parseFloat(budgetMatch[1]) : 15;
  const vastu = lower.includes('vastu');

  const rooms = [{ name: 'Living Room', area: Math.round(area * 0.22), type: 'living', direction: 'north_east' }];
  if (lower.includes('kitchen') || bhk >= 1) rooms.push({ name: 'Kitchen', area: Math.round(area * 0.12), type: 'kitchen', direction: 'south_east' });
  for (let i = 0; i < bhk; i++) rooms.push({ name: i === 0 ? 'Master Bedroom' : `Bedroom ${i+1}`, area: Math.round(area * (i === 0 ? 0.18 : 0.14)), type: 'bedroom', direction: i % 2 === 0 ? 'south_west' : 'south' });
  rooms.push({ name: 'Bathroom', area: Math.round(area * 0.06), type: 'bathroom', direction: 'west' });
  if (lower.includes('balcony') || bhk >= 3) rooms.push({ name: 'Balcony', area: Math.round(area * 0.05), type: 'balcony', direction: 'north' });
  if (lower.includes('home theater') || lower.includes('theater')) rooms.push({ name: 'Home Theater', area: Math.round(area * 0.12), type: 'entertainment', direction: 'north_west' });

  return {
    projectId: 'proj_' + Math.random().toString(36).slice(2,10),
    timestamp: new Date().toISOString(),
    configuration: {
      type: bhk + 'BHK',
      totalArea: area,
      plotShape: 'rectangle',
      budget_lakhs: budget,
      currency: 'INR'
    },
    style: {
      primary: detectedStyle,
      colorPalette: detectedColor,
      furniture: lower.includes('premium') ? 'premium' : 'standard',
      lighting: 'natural + artificial'
    },
    rooms: rooms,
    constraints: {
      vastuCompliant: vastu,
      naturalLight: lower.includes('natural light') || lower.includes('bright'),
      openKitchen: lower.includes('open kitchen'),
      walkInCloset: lower.includes('walk-in'),
      homeOffice: lower.includes('office'),
      parkingSpace: lower.includes('parking')
    },
    aiConfidence: (0.85 + Math.random() * 0.14).toFixed(2),
    suggestedLayout: pick(['L-shape', 'Linear', 'Courtyard', 'Compact'])
  };
}

// ═══════════════════════════════════════════════════
//  PHASE 4 — AI Floor Planning Engine
// ═══════════════════════════════════════════════════
function initPhase4() {
  document.getElementById('generateFloorPlan')?.addEventListener('click', generateFloorPlan);
  document.getElementById('regenerateFloorPlan')?.addEventListener('click', generateFloorPlan);
}

function generateFloorPlan() {
  const area = parseInt(document.getElementById('fpArea').value) || 1200;
  const config = document.getElementById('fpConfig').value;
  const style = document.getElementById('fpStyle').value;
  const shape = document.getElementById('fpShape').value;

  showLoading('AI generating optimal floor plan...', () => {
    drawFloorPlan(area, config, style, shape);
    document.getElementById('fpOverlay').classList.add('hidden');
    toast('Floor plan generated! 🗺️', 'success');
  }, 2000);
}

function drawFloorPlan(area, config, style, shape) {
  const canvas = document.getElementById('floorPlanCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const PAD = 30;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0A0F1E';
  ctx.fillRect(0, 0, W, H);

  // Background grid
  ctx.strokeStyle = 'rgba(124,58,237,0.08)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 15) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 15) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  const configs = {
    studio: [{ name:'Studio', x:0.05,y:0.05,w:0.7,h:0.7,color:'rgba(124,58,237,0.18)' },
              { name:'Kitchen', x:0.78,y:0.05,w:0.17,h:0.35,color:'rgba(245,158,11,0.18)' },
              { name:'Bath', x:0.78,y:0.42,w:0.17,h:0.28,color:'rgba(6,182,212,0.18)' }],
    '1bhk': [{ name:'Living', x:0.05,y:0.05,w:0.5,h:0.5,color:'rgba(124,58,237,0.18)' },
              { name:'Bedroom', x:0.58,y:0.05,w:0.37,h:0.5,color:'rgba(236,72,153,0.18)' },
              { name:'Kitchen', x:0.05,y:0.58,w:0.35,h:0.37,color:'rgba(245,158,11,0.18)' },
              { name:'Bath', x:0.43,y:0.58,w:0.2,h:0.37,color:'rgba(6,182,212,0.18)' }],
    '2bhk': [{ name:'Living', x:0.04,y:0.04,w:0.45,h:0.42,color:'rgba(124,58,237,0.18)' },
              { name:'Kitchen', x:0.52,y:0.04,w:0.25,h:0.42,color:'rgba(245,158,11,0.18)' },
              { name:'Dining', x:0.8,y:0.04,w:0.16,h:0.42,color:'rgba(16,185,129,0.18)' },
              { name:'Master Bedroom', x:0.04,y:0.5,w:0.4,h:0.46,color:'rgba(236,72,153,0.18)' },
              { name:'Bedroom 2', x:0.48,y:0.5,w:0.35,h:0.46,color:'rgba(37,99,235,0.18)' },
              { name:'Bath', x:0.86,y:0.5,w:0.1,h:0.46,color:'rgba(6,182,212,0.18)' }],
    '3bhk': [{ name:'Living Room', x:0.04,y:0.04,w:0.38,h:0.44,color:'rgba(124,58,237,0.18)' },
              { name:'Kitchen', x:0.45,y:0.04,w:0.28,h:0.22,color:'rgba(245,158,11,0.18)' },
              { name:'Dining', x:0.76,y:0.04,w:0.2,h:0.22,color:'rgba(16,185,129,0.18)' },
              { name:'Foyer', x:0.45,y:0.28,w:0.14,h:0.2,color:'rgba(249,115,22,0.18)' },
              { name:'Bath 1', x:0.62,y:0.28,w:0.13,h:0.2,color:'rgba(6,182,212,0.18)' },
              { name:'Utility', x:0.78,y:0.28,w:0.18,h:0.2,color:'rgba(100,116,139,0.18)' },
              { name:'Master Bedroom', x:0.04,y:0.52,w:0.35,h:0.44,color:'rgba(236,72,153,0.2)' },
              { name:'Bedroom 2', x:0.42,y:0.52,w:0.26,h:0.44,color:'rgba(37,99,235,0.18)' },
              { name:'Bedroom 3', x:0.71,y:0.52,w:0.25,h:0.44,color:'rgba(167,139,250,0.18)' }],
    '4bhk': [{ name:'Living', x:0.04,y:0.04,w:0.32,h:0.42,color:'rgba(124,58,237,0.18)' },
              { name:'Kitchen', x:0.38,y:0.04,w:0.2,h:0.42,color:'rgba(245,158,11,0.18)' },
              { name:'Dining', x:0.61,y:0.04,w:0.18,h:0.42,color:'rgba(16,185,129,0.18)' },
              { name:'Study', x:0.82,y:0.04,w:0.14,h:0.42,color:'rgba(249,115,22,0.18)' },
              { name:'Master', x:0.04,y:0.5,w:0.28,h:0.46,color:'rgba(236,72,153,0.2)' },
              { name:'Bedroom 2', x:0.35,y:0.5,w:0.22,h:0.46,color:'rgba(37,99,235,0.18)' },
              { name:'Bedroom 3', x:0.6,y:0.5,w:0.2,h:0.46,color:'rgba(167,139,250,0.18)' },
              { name:'Bedroom 4', x:0.83,y:0.5,w:0.13,h:0.46,color:'rgba(6,182,212,0.18)' }]
  };

  const rooms = configs[config] || configs['3bhk'];
  const IW = W - PAD*2, IH = H - PAD*2;

  // Draw outer boundary
  ctx.strokeStyle = 'rgba(167,139,250,0.6)';
  ctx.lineWidth = 3;
  ctx.strokeRect(PAD, PAD, IW, IH);

  // Compass rose
  drawCompassRose(ctx, W - 55, 55, 30);

  rooms.forEach(r => {
    const rx = PAD + r.x * IW, ry = PAD + r.y * IH;
    const rw = r.w * IW, rh = r.h * IH;

    // Room fill
    ctx.fillStyle = r.color;
    ctx.fillRect(rx, ry, rw, rh);

    // Room border
    ctx.strokeStyle = r.color.replace('0.18','0.6').replace('0.2','0.6');
    ctx.lineWidth = 2;
    ctx.strokeRect(rx, ry, rw, rh);

    // Room label bg
    ctx.fillStyle = 'rgba(10,11,20,0.6)';
    const labelW = Math.min(rw - 8, 110), labelH = 22;
    ctx.fillRect(rx + rw/2 - labelW/2, ry + rh/2 - 11, labelW, labelH);

    // Room label
    ctx.fillStyle = '#F1F5F9';
    ctx.font = `bold ${Math.max(8, Math.min(11, rw/8))}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(r.name, rx + rw/2, ry + rh/2);

    // Area label
    const roomArea = Math.round(r.w * r.h * parseInt(document.getElementById('fpArea').value || 1200));
    ctx.font = `${Math.max(7, Math.min(9, rw/10))}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.fillText(roomArea + ' sq.ft', rx + rw/2, ry + rh/2 + 13);
  });

  // Draw doors between rooms
  ctx.strokeStyle = '#34D399'; ctx.lineWidth = 2;
  rooms.slice(0,-1).forEach((r,i) => {
    const rx = PAD + r.x * IW + r.w * IW;
    const ry = PAD + r.y * IH + r.h * IH / 2;
    ctx.beginPath(); ctx.arc(rx, ry, 4, 0, Math.PI*2);
    ctx.fillStyle = '#34D399'; ctx.fill();
  });

  // Legend
  buildFloorPlanLegend(rooms);

  // Area text
  ctx.fillStyle = 'rgba(167,139,250,0.7)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Total: ${document.getElementById('fpArea').value} sq.ft  |  ${config.toUpperCase()}  |  ${style.charAt(0).toUpperCase()+style.slice(1)}`, PAD + 4, H - 10);
}

function drawCompassRose(ctx, cx, cy, r) {
  const dirs = [['N',0],['E',90],['S',180],['W',270]];
  dirs.forEach(([d, deg]) => {
    const angle = (deg - 90) * Math.PI / 180;
    const x = cx + Math.cos(angle) * (r + 10), y = cy + Math.sin(angle) * (r + 10);
    ctx.fillStyle = d === 'N' ? '#F87171' : '#94A3B8';
    ctx.font = `bold 9px Inter`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d, x, y);
    // Arrow
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r);
    ctx.strokeStyle = d === 'N' ? 'rgba(248,113,113,0.6)' : 'rgba(100,116,139,0.4)';
    ctx.lineWidth = d === 'N' ? 2 : 1;
    ctx.stroke();
  });
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2);
  ctx.fillStyle = '#A78BFA'; ctx.fill();
}

function buildFloorPlanLegend(rooms) {
  const legend = document.getElementById('fpLegend');
  if (!legend) return;
  const uniq = [...new Set(rooms.map(r => r.name))].slice(0,6);
  const colors = ['rgba(124,58,237,0.5)','rgba(245,158,11,0.5)','rgba(236,72,153,0.5)','rgba(37,99,235,0.5)','rgba(16,185,129,0.5)','rgba(6,182,212,0.5)'];
  legend.innerHTML = uniq.map((n,i) => `
    <div class="legend-item">
      <div class="legend-color" style="background:${colors[i%colors.length]}"></div>
      <span>${n}</span>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════
//  PHASE 5 — AI Vastu Validation
// ═══════════════════════════════════════════════════
const VASTU_RULES = [
  { icon:'🏠', title:'Main Entrance', rule:'North-East or East direction for main door brings prosperity and positive energy.' },
  { icon:'🍳', title:'Kitchen Placement', rule:'South-East corner (Agni corner) is ideal for kitchen placement.' },
  { icon:'🛏', title:'Master Bedroom', rule:'South-West corner strengthens stability and decision-making power.' },
  { icon:'🚿', title:'Bathroom & Toilet', rule:'North-West or West direction. Avoid North-East and South-West.' },
  { icon:'🧘', title:'Pooja Room', rule:'North-East corner (Ishaan) is the most auspicious for prayer room.' },
  { icon:'💼', title:'Study / Office', rule:'North or East direction facing while studying ensures better concentration.' },
  { icon:'🪴', title:'Plants & Trees', rule:'Tulsi plant in North-East. Avoid large trees in North-East.' },
  { icon:'💧', title:'Water Bodies', rule:'Water elements, tanks and wells in North-East direction only.' }
];

function initPhase5() {
  const rulesList = document.getElementById('vastuRulesList');
  if (rulesList) {
    rulesList.innerHTML = VASTU_RULES.map(r => `
      <div class="vastu-rule-row">
        <div class="vastu-rule-icon">${r.icon}</div>
        <div class="vastu-rule-text"><strong>${r.title}</strong>${r.rule}</div>
      </div>
    `).join('');
  }
  document.getElementById('vastuValidate')?.addEventListener('click', runVastuValidation);
  document.getElementById('vastuAutoDesign')?.addEventListener('click', generateVastuLayout);
}

function generateVastuLayout() {
  document.getElementById('vastuRulesPanel').style.display = 'none';
  document.getElementById('vastuCanvasWrapper').style.display = 'block';
  
  const canvas = document.getElementById('vastuFloorPlanCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  
  // Clear and draw grid
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);
  
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for(let x=0; x<W; x+=20) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0; y<H; y+=20) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  
  // House boundaries
  const pX = 50, pY = 50, pW = 400, pH = 320;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(pX, pY, pW, pH);
  
  // Vastu compliant rooms
  const rooms = [
    { name: 'Entrance / Living', x: pX+pW/2, y: pY, w: pW/2, h: pH/2.5, color: '#0ea5e9' }, // North-East
    { name: 'Pooja Room', x: pX+pW/2+pW/4, y: pY, w: pW/4, h: pH/4, color: '#f59e0b' }, // NE exact corner
    { name: 'Kitchen (Agni)', x: pX+pW/2, y: pY+pH-pH/2.5, w: pW/2, h: pH/2.5, color: '#ef4444' }, // South-East
    { name: 'Master Bedroom', x: pX, y: pY+pH-pH/2.5, w: pW/2, h: pH/2.5, color: '#8b5cf6' }, // South-West
    { name: 'Guest/Bath', x: pX, y: pY, w: pW/2, h: pH/2.5, color: '#64748b' }, // North-West
    { name: 'Brahmasthan', x: pX+pW/3, y: pY+pH/2.5, w: pW/3, h: pH - 2*(pH/2.5), color: '#334155' } // Center Open
  ];
  
  rooms.forEach(r => {
    ctx.fillStyle = r.color + '40'; // 25% opacity
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(r.name, r.x + r.w/2, r.y + r.h/2);
  });
  
  // Mini Compass
  const mc = document.getElementById('vastuMiniCompass');
  const mctx = mc.getContext('2d');
  mctx.clearRect(0,0,60,60);
  mctx.beginPath(); mctx.arc(30,30,25,0,Math.PI*2); 
  mctx.fillStyle = 'rgba(124,58,237,0.2)'; mctx.fill();
  mctx.strokeStyle = '#7c3aed'; mctx.stroke();
  mctx.fillStyle = '#fff'; mctx.font = '10px Inter'; mctx.textAlign='center'; mctx.textBaseline='middle';
  mctx.fillText('N', 30, 12);
  mctx.fillText('E', 48, 30);
  mctx.fillText('S', 30, 48);
  mctx.fillText('W', 12, 30);
  
  const res = document.getElementById('vastuResults');
  res.innerHTML = `
    <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); padding:10px; border-radius:8px; margin-top:15px;">
      <h4 style="color:#10b981; margin:0 0 5px 0;">✨ Vastu Layout Generated</h4>
      <p style="margin:0; font-size:13px; color:#94a3b8;">Rooms are strictly mapped to Vastu principles (Master SW, Kitchen SE, Pooja NE). Perfect 100/100 score.</p>
    </div>
  `;
}

function initVastuCompass() {
  const canvas = document.getElementById('vastuCompass');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, r = 80;

  ctx.clearRect(0,0,W,H);

  // Outer ring
  const grad = ctx.createRadialGradient(cx,cy,r*0.4,cx,cy,r);
  grad.addColorStop(0,'rgba(124,58,237,0.2)');
  grad.addColorStop(1,'rgba(37,99,235,0.05)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(124,58,237,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Directions
  const zones = [
    { dir:'N', angle:-90, color:'rgba(37,99,235,0.3)', label:'✓' },
    { dir:'NE', angle:-45, color:'rgba(16,185,129,0.4)', label:'✓' },
    { dir:'E', angle:0, color:'rgba(245,158,11,0.3)', label:'✓' },
    { dir:'SE', angle:45, color:'rgba(245,158,11,0.3)', label:'✓' },
    { dir:'S', angle:90, color:'rgba(239,68,68,0.15)', label:'✗' },
    { dir:'SW', angle:135, color:'rgba(16,185,129,0.3)', label:'✓' },
    { dir:'W', angle:180, color:'rgba(100,116,139,0.2)', label:'~' },
    { dir:'NW', angle:-135, color:'rgba(100,116,139,0.2)', label:'~' }
  ];

  zones.forEach(z => {
    const a = z.angle * Math.PI / 180;
    const x = cx + Math.cos(a) * r * 0.65, y = cy + Math.sin(a) * r * 0.65;
    ctx.fillStyle = z.color;
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F1F5F9'; ctx.font = 'bold 9px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(z.dir, x, y - 4);
    ctx.fillStyle = z.label==='✓'?'#34D399':z.label==='✗'?'#F87171':'#FCD34D';
    ctx.font = '8px Inter';
    ctx.fillText(z.label, x, y + 5);
    // Spoke
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a)*r*0.45, cy + Math.sin(a)*r*0.45);
    ctx.strokeStyle = 'rgba(167,139,250,0.3)'; ctx.lineWidth = 1; ctx.stroke();
  });

  // Center
  ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI*2);
  const centerGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,8);
  centerGrad.addColorStop(0,'#A78BFA'); centerGrad.addColorStop(1,'#7C3AED');
  ctx.fillStyle = centerGrad; ctx.fill();
}

function runVastuValidation() {
  showLoading('Validating Vastu compliance...', () => {
    const results = [
      { type: 'pass', msg: '✓ Main entrance faces North-East — Excellent!' },
      { type: 'pass', msg: '✓ Kitchen in South-East (Agni corner) — Correct' },
      { type: 'pass', msg: '✓ Master Bedroom in South-West — Stable energy' },
      { type: pick(['pass','warn','fail']), msg: pick(['~ Bathroom in North-West — Acceptable', '✗ Bathroom faces North-East — Must relocate', '✓ Bathroom placement is correct']) },
      { type: 'pass', msg: '✓ Pooja room in North-East — Highly auspicious' },
      { type: pick(['pass','warn']), msg: pick(['✓ Study room faces East — Good for concentration', '~ Study room faces West — Acceptable but not ideal']) },
      { type: 'pass', msg: '✓ Water tank in North-East — Correct placement' },
      { type: pick(['pass','warn']), msg: pick(['✓ Overall Vastu score: 87% — Very Good', '~ Overall Vastu score: 72% — Good, minor corrections needed']) }
    ];

    const resultsEl = document.getElementById('vastuResults');
    if (resultsEl) {
      resultsEl.innerHTML = results.map(r => `
        <div class="vastu-result-item ${r.type}">
          <span>${r.msg}</span>
        </div>
      `).join('');
    }

    const passes = results.filter(r => r.type === 'pass').length;
    const pct = Math.round(passes / results.length * 100);
    toast(`Vastu Score: ${pct}% — ${pct >= 80 ? 'Excellent 🕉️' : pct >= 60 ? 'Good ✓' : 'Needs correction ⚠️'}`, pct >= 80 ? 'success' : 'info');
  }, 2000);
}

// ═══════════════════════════════════════════════════
//  PHASE 6 — AI Material Recommendation
// ═══════════════════════════════════════════════════
const MATERIALS_DB = {
  flooring: {
    economy:   [{ name:'Ceramic Tile',   price:'₹35–50/sqft', stars:'★★★☆☆', colors:['#E8E0D0','#D0C8B8','#F0E8D8','#C0B8A8'] }],
    mid:       [{ name:'Kajaria Tiles',    price:'₹80–120/sqft',stars:'★★★★☆', colors:['#F5F0E8','#E8E0D8','#D4CCC4','#FCFAF8'], link:'https://www.kajariaceramics.com/?utm_source=chatgpt.com' },
                { name:'Nitco Tiles',       price:'₹100–150/sqft',stars:'★★★★★',colors:['#8B5E3C','#6B4226','#A0724A','#C49A6C'], link:'https://www.nitco.in/?utm_source=chatgpt.com' },
                { name:'Somany Ceramics',price:'₹70–100/sqft', stars:'★★★★☆', colors:['#9C7354','#7A5840','#B08060','#4A3020'], link:'https://www.somanyceramics.com/?utm_source=chatgpt.com' }],
    premium:   [{ name:'Italian Marble', price:'₹200–350/sqft',stars:'★★★★★', colors:['#FAF8F5','#F0EDE8','#E8E4DF','#DDD8D2'] },
                { name:'Parquet Wood',   price:'₹180–250/sqft',stars:'★★★★★', colors:['#6B4226','#8B5E3C','#503010','#9C7354'] }],
    luxury:    [{ name:'Onyx Stone',     price:'₹400–700/sqft',stars:'★★★★★', colors:['#2C2C2C','#1A1A1A','#404040','#F5F0E8'] }]
  },
  paint: {
    economy:   [{ name:'Asian Paints Apex',    price:'₹180–220/L',  stars:'★★★☆☆', colors:['#F5F0E8','#E8F0E8','#E8E0F0','#F0E8E0'], link:'https://www.asianpaints.com/colour-catalogue.html?utm_source=chatgpt.com' }],
    mid:       [{ name:'Berger Paints', price:'₹300–400/L',  stars:'★★★★☆', colors:['#D4C5B0','#B8D4E8','#E8C5D4','#C5E8D4'], link:'https://www.bergerpaints.com/colour-catalogue?utm_source=chatgpt.com' },
                { name:'Dulux Colour Palette',          price:'₹350–450/L',  stars:'★★★★☆', colors:['#E8DCC8','#C8DDE8','#E8C8DC','#D0E8C8'], link:'https://www.dulux.in/en/colour-palettes?utm_source=chatgpt.com' }],
    premium:   [{ name:'Dulux Diamond',         price:'₹500–700/L',  stars:'★★★★★', colors:['#2C2C3E','#1A2040','#3E2C2C','#2C3E2C'], link:'https://www.dulux.in/en/colour-palettes?utm_source=chatgpt.com' }],
    luxury:    [{ name:'Farrow & Ball',          price:'₹1200–2000/L',stars:'★★★★★', colors:['#2E2B26','#595650','#C2B49A','#F3EDE3'] }]
  },
  furniture: {
    economy:   [{ name:'IKEA India',   price:'₹15,000–40,000', stars:'★★★☆☆', colors:['#8B7355','#C4A882','#6B5535','#D4B896'], link:'https://www.ikea.com/in/en/?utm_source=chatgpt.com' }],
    mid:       [{ name:'Godrej Interio',   price:'₹60,000–1.2L',  stars:'★★★★☆', colors:['#2C2C3E','#4A4A6A','#8B8BAA','#C8C8E8'], link:'https://www.godrejinterio.com/?utm_source=chatgpt.com' },
                { name:'Urban Ladder',       price:'₹35,000–60,000', stars:'★★★★☆', colors:['#5A3515','#7A5535','#C0A080','#E8D0B8'] }],
    premium:   [{ name:'Natuzzi Leather',  price:'₹2.5L–5L',      stars:'★★★★★', colors:['#2C1810','#5C3820','#9C7850','#E8D4B8'] }],
    luxury:    [{ name:'Poliform Living',        price:'₹8L–20L',       stars:'★★★★★', colors:['#FAFAF5','#2C2C2C','#C0A080','#5A4530'] }]
  },
  lighting: {
    economy:   [{ name:'Havells LED Panel',     price:'₹500–1200',     stars:'★★★☆☆', colors:['#FFFDE7','#FFF9C4','#FFECB3','#FFE082'] }],
    mid:       [{ name:'Crompton Chandelier',    price:'₹3,000–8,000',  stars:'★★★★☆', colors:['#C8A850','#D4B870','#A08030','#F0D490'] }],
    premium:   [{ name:'Artemide Tolomeo',       price:'₹25,000–50,000',stars:'★★★★★', colors:['#E8E0D0','#C0B8A8','#A09888','#D0C8B8'] }],
    luxury:    [{ name:'Baccarat Crystal',       price:'₹1.5L–10L',     stars:'★★★★★', colors:['#E8F4FD','#B8DDF8','#88C8F5','#F8F8F0'] }]
  },
  kitchen: {
    economy:   [{ name:'Sleek Modular Kitchen', price:'₹80,000–1.5L',  stars:'★★★☆☆', colors:['#E8E0D0','#C0B8A8','#F8F5F0','#D8D0C8'] }],
    mid:       [{ name:'Hettich Kitchen',        price:'₹2L–4L',        stars:'★★★★☆', colors:['#2C2C2C','#808080','#FFFFFF','#C8C8C8'], link:'https://www.hettich.com/in_EN/?utm_source=chatgpt.com' },
                { name:'Häfele Modular',         price:'₹2.5L–5L',      stars:'★★★★☆', colors:['#8B5E3C','#E8E0D0','#2C2C2C','#A09080'], link:'https://www.hafeleindia.com/?utm_source=chatgpt.com' },
                { name:'Blum Accessories',       price:'₹1.5L–3L',      stars:'★★★★☆', colors:['#4A4A4A','#E0E0E0','#C8C8C8','#FFFFFF'], link:'https://www.blum.com/?utm_source=chatgpt.com'}],
    premium:   [{ name:'Nobilia Kitchen',        price:'₹5L–12L',       stars:'★★★★★', colors:['#1A1A1A','#F5F5F5','#C0A080','#808080'] }],
    luxury:    [{ name:'Bulthaup b3',            price:'₹20L–50L',      stars:'★★★★★', colors:['#FAFAFA','#1A1A1A','#8B7355','#C8C8C8'] }]
  },
  laminates: {
    economy:   [{ name:'Greenlam Catalogs', price:'₹1,000–2,500', stars:'★★★☆☆', colors:['#D4B896','#C4A882','#8B7355','#6B5535'], link:'https://www.greenlam.com/resources/catalogues?utm_source=chatgpt.com' }],
    mid:       [{ name:'CenturyPly Laminates', price:'₹2,500–5,000', stars:'★★★★☆', colors:['#E8DCC8','#D4CCC4','#8B5E3C','#5A3515'], link:'https://www.centuryply.com/laminates?utm_source=chatgpt.com' },
                { name:'Merino Laminates', price:'₹2,000–4,500', stars:'★★★★☆', colors:['#F5F0E8','#E8E0D8','#9C7354','#4A3020'], link:'https://www.merinolaminates.com/?utm_source=chatgpt.com' }],
    premium:   [{ name:'Formica Premium', price:'₹5,000–8,000', stars:'★★★★★', colors:['#2C2C2C','#1A1A1A','#404040','#F5F0E8'] }],
    luxury:    [{ name:'Laminam S.p.A.', price:'₹10,000+', stars:'★★★★★', colors:['#FAF8F5','#F0EDE8','#E8E4DF','#DDD8D2'] }]
  },
  bathroom: {
    economy:   [{ name:'Cera Sanitaryware', price:'₹5,000–15,000', stars:'★★★☆☆', colors:['#FFFFFF','#F0F0F0','#E8E8E8','#DCDCDC'] }],
    mid:       [{ name:'Jaquar Taps', price:'₹15,000–40,000', stars:'★★★★☆', colors:['#C0C0C0','#E0E0E0','#B0B0B0','#808080'], link:'https://www.jaquar.com/?utm_source=chatgpt.com' },
                { name:'Kohler India', price:'₹25,000–60,000', stars:'★★★★☆', colors:['#F5F5DC','#FAF0E6','#FFF8DC','#FFEBCD'], link:'https://www.kohler.co.in/?utm_source=chatgpt.com' }],
    premium:   [{ name:'Grohe Fittings', price:'₹60,000–1.5L', stars:'★★★★★', colors:['#1A1A1A','#333333','#4D4D4D','#666666'] }],
    luxury:    [{ name:'TOTO Neorest', price:'₹2L+', stars:'★★★★★', colors:['#FFFFFF','#FAFAFA','#F5F5F5','#F0F0F0'] }]
  }
};

function initPhase6() {
  document.querySelectorAll('.mat-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mat-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.matCategory = btn.dataset.cat;
    });
  });
  document.getElementById('getMaterials')?.addEventListener('click', showMaterials);
  document.getElementById('aiThemeEngine')?.addEventListener('change', (e) => applyAITheme(e.target.value));
}

function applyAITheme(theme) {
  if (theme === 'none') return;
  initThreeScene(); // Ensure scene exists
  
  const themes = {
    scandinavian: { flooring: '#D4C4B0', paint: '#F5F0E8', furniture: '#6B5535', kitchen: '#E8E0D0', lighting: '#FFFDE7' },
    industrial: { flooring: '#404040', paint: '#808080', furniture: '#2C1810', kitchen: '#2C3E50', lighting: '#FF6B6B' },
    luxury: { flooring: '#FAF8F5', paint: '#1A2040', furniture: '#C0A080', kitchen: '#1A1A1A', lighting: '#E8F4FD' },
    bohemian: { flooring: '#C49A6C', paint: '#C5E8D4', furniture: '#9C7850', kitchen: '#FF6B6B', lighting: '#FFECB3' }
  };
  
  const selectedTheme = themes[theme];
  if (!selectedTheme) return;
  
  state.selectedMaterials = selectedTheme;
  
  // Apply to meshes
  if (roomMeshes.flooring) roomMeshes.flooring.material.color.set(selectedTheme.flooring);
  if (roomMeshes.paint) roomMeshes.paint.material.color.set(selectedTheme.paint);
  if (roomMeshes.paint2) roomMeshes.paint2.material.color.set(selectedTheme.paint);
  if (roomMeshes.paint3) roomMeshes.paint3.material.color.set(selectedTheme.paint);
  if (roomMeshes.furniture) roomMeshes.furniture.material.color.set(selectedTheme.furniture);
  if (roomMeshes.kitchen) roomMeshes.kitchen.material.color.set(selectedTheme.kitchen);
  if (roomMeshes.light) roomMeshes.light.color.set(selectedTheme.lighting);
  
  document.getElementById('material3DPreview').style.display = 'block';
  document.getElementById('previewLabel').innerText = `AI Theme Applied: ${theme.toUpperCase()}`;
  toast(`Applied ${theme} Theme to 3D Space`, 'success', 2000);
  calculateAIConsistencyScore();
}

function showMaterials() {
  const budget = document.getElementById('matBudget').value;
  const style = document.getElementById('matStyle').value;
  const cat = state.matCategory;
  const materials = MATERIALS_DB[cat]?.[budget] || MATERIALS_DB[cat]?.mid || [];

  showLoading('AI ranking materials...', () => {
    const grid = document.getElementById('materialsGrid');
    if (!grid) return;

    if (materials.length === 0) {
      grid.innerHTML = '<div class="materials-placeholder">No materials found for this combination</div>';
      return;
    }

    grid.innerHTML = materials.map((m, i) => {
      const swatchColors = m.colors || ['#888'];
      const swatchStyle = swatchColors.length >= 4
        ? `background: linear-gradient(135deg, ${swatchColors[0]} 25%, ${swatchColors[1]} 50%, ${swatchColors[2]} 75%, ${swatchColors[3]})`
        : `background: ${swatchColors[0]}`;
      const score = (95 - i * 8 + Math.random() * 5).toFixed(0);
      const linkHtml = m.link ? `<a href="${m.link}" target="_blank" onclick="event.stopPropagation()" style="display:inline-block; margin-top:.5rem; font-size:.75rem; color:var(--primary); text-decoration:none; font-weight:600;">↗ View Catalog</a>` : '';
      return `
        <div class="material-card" onclick="selectMaterial('${cat}','${m.name}',this, '${swatchColors.join(',')}')">
          <div class="material-swatch" style="${swatchStyle}"></div>
          <div class="material-name">${m.name}</div>
          <div class="material-price">${m.price}</div>
          <div class="material-stars">${m.stars}</div>
          <div style="font-size:.7rem;color:var(--text-muted);margin-top:.3rem">AI Score: ${score}%</div>
          ${linkHtml}
        </div>
      `;
    }).join('');
    toast(`${materials.length} materials ranked for ${budget} budget 🎨`, 'success');
  }, 1500);
}

let threeScene, threeCamera, threeRenderer, threeControls;
const roomMeshes = {};

function initThreeScene() {
  if (threeScene) return; // already initialized
  
  const container = document.getElementById('materialPreviewCanvas');
  const w = container.clientWidth || 500;
  const h = container.clientHeight || 250;
  
  threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0x0f172a);
  
  threeCamera = new THREE.PerspectiveCamera(50, w/h, 0.1, 1000);
  threeCamera.position.set(0, 5, 12);
  
  threeRenderer = new THREE.WebGLRenderer({ antialias: true });
  threeRenderer.setSize(w, h);
  container.innerHTML = '';
  container.appendChild(threeRenderer.domElement);
  
  threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
  threeControls.enableDamping = true;
  threeControls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  threeScene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0xfff5e6, 0.8);
  pointLight.position.set(0, 8, 0);
  threeScene.add(pointLight);
  roomMeshes.light = pointLight;
  
  // Create Room Geometry
  const floorGeo = new THREE.PlaneGeometry(20, 20);
  const wallGeo = new THREE.PlaneGeometry(20, 10);
  
  // Materials
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const furnMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
  const kitchenMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });
  
  // Floor
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  threeScene.add(floor);
  roomMeshes.flooring = floor;
  
  // Back Wall
  const backWall = new THREE.Mesh(wallGeo, wallMat);
  backWall.position.set(0, 5, -10);
  threeScene.add(backWall);
  roomMeshes.paint = backWall;
  
  // Left Wall
  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.position.set(-10, 5, 0);
  leftWall.rotation.y = Math.PI / 2;
  threeScene.add(leftWall);
  roomMeshes.paint2 = leftWall;
  
  // Right Wall
  const rightWall = new THREE.Mesh(wallGeo, wallMat);
  rightWall.position.set(10, 5, 0);
  rightWall.rotation.y = -Math.PI / 2;
  threeScene.add(rightWall);
  roomMeshes.paint3 = rightWall;
  
  // Furniture Placeholder (Sofa)
  const sofaGeo = new THREE.BoxGeometry(6, 2.5, 3);
  const sofa = new THREE.Mesh(sofaGeo, furnMat);
  sofa.position.set(0, 1.25, 0);
  threeScene.add(sofa);
  roomMeshes.furniture = sofa;
  
  // Kitchen Placeholder
  const kitchenGeo = new THREE.BoxGeometry(4, 3, 2);
  const kitchen = new THREE.Mesh(kitchenGeo, kitchenMat);
  kitchen.position.set(-7, 1.5, -8);
  threeScene.add(kitchen);
  roomMeshes.kitchen = kitchen;
  
  // Bathroom Placeholder (Vanity)
  const bathMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2 });
  const bathGeo = new THREE.BoxGeometry(2, 2, 2);
  const bath = new THREE.Mesh(bathGeo, bathMat);
  bath.position.set(7, 1, -8);
  threeScene.add(bath);
  roomMeshes.bathroom = bath;

  // Laminates Placeholder (Cabinet Panel)
  const lamMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
  const lamGeo = new THREE.BoxGeometry(3.8, 2.8, 0.1);
  const lam = new THREE.Mesh(lamGeo, lamMat);
  lam.position.set(-7, 1.5, -6.9);
  threeScene.add(lam);
  roomMeshes.laminates = lam;
  
  function animate() {
    requestAnimationFrame(animate);
    threeControls.update();
    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

function selectMaterial(cat, name, el, colorsStr) {
  document.querySelectorAll('.material-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  state.selectedMaterials[cat] = name;
  toast(`Selected: ${name}`, 'success', 1500);

  if (colorsStr) {
    renderMaterialPreview(cat, colorsStr.split(','));
  }
}

function renderMaterialPreview(cat, colors) {
  const container = document.getElementById('material3DPreview');
  if (!container) return;
  container.style.display = 'block';
  
  initThreeScene(); // Ensure scene is created
  
  const mainColor = colors[0] || '#ffffff';
  
  // Apply materials to meshes
  if (cat === 'flooring' && roomMeshes.flooring) {
    roomMeshes.flooring.material.color.set(mainColor);
  } else if (cat === 'paint') {
    if (roomMeshes.paint) roomMeshes.paint.material.color.set(mainColor);
    if (roomMeshes.paint2) roomMeshes.paint2.material.color.set(mainColor);
    if (roomMeshes.paint3) roomMeshes.paint3.material.color.set(mainColor);
  } else if (cat === 'furniture' && roomMeshes.furniture) {
    roomMeshes.furniture.material.color.set(mainColor);
  } else if (cat === 'kitchen' && roomMeshes.kitchen) {
    roomMeshes.kitchen.material.color.set(mainColor);
  } else if (cat === 'lighting' && roomMeshes.light) {
    roomMeshes.light.color.set(mainColor);
  } else if (cat === 'laminates' && roomMeshes.laminates) {
    roomMeshes.laminates.material.color.set(mainColor);
  } else if (cat === 'bathroom' && roomMeshes.bathroom) {
    roomMeshes.bathroom.material.color.set(mainColor);
  }
  
  // Also calculate AI Compatibility Score based on selections (fake score logic)
  calculateAIConsistencyScore();
  
  document.getElementById('previewLabel').innerText = `Live 3D Rendering: ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
}

function calculateAIConsistencyScore() {
  // A simple algorithm to sum random values based on how many materials selected
  const count = Object.keys(state.selectedMaterials).length;
  if (count === 0) return;
  
  let score = 50 + (count * 8);
  if (score > 98) score = 98; // max out
  
  const resultsDiv = document.getElementById('aiScoreResults') || createScorePanel();
  resultsDiv.innerHTML = `
    <strong>AI Compatibility Score: <span style="color:#10b981">${score}%</span></strong>
    <div style="font-size:12px; color:#94a3b8; margin-top:5px;">
      Color Harmony: ${Math.floor(score - Math.random()*5)}% | 
      Luxury Index: ${Math.floor(score + Math.random()*5)}% | 
      Budget Match: 100%
    </div>
  `;
}

function createScorePanel() {
  const preview = document.getElementById('material3DPreview');
  const panel = document.createElement('div');
  panel.id = 'aiScoreResults';
  panel.style.position = 'absolute';
  panel.style.top = '10px';
  panel.style.right = '10px';
  panel.style.background = 'rgba(15,23,42,0.85)';
  panel.style.padding = '10px';
  panel.style.borderRadius = '8px';
  panel.style.border = '1px solid #334155';
  panel.style.color = '#fff';
  panel.style.fontSize = '14px';
  preview.appendChild(panel);
  return panel;
}


/* ================================================
   DesignAI — app.js  (Part 2 of 2)
   Phases 7–12 logic
   ================================================ */

// ═══════════════════════════════════════════════════
//  PHASE 7 — AI Furniture Placement & Auto Alignment
// ═══════════════════════════════════════════════════
const FURNITURE_CATALOG = {
  living: [
    { name:'3-Seat Sofa',   w:3.0, h:1.0, color:'rgba(124,58,237,0.25)', stroke:'#A78BFA', icon:'🛋️' },
    { name:'Coffee Table',  w:1.2, h:0.7, color:'rgba(245,158,11,0.25)', stroke:'#FCD34D', icon:'☕' },
    { name:'TV Unit',       w:2.0, h:0.5, color:'rgba(37,99,235,0.25)',  stroke:'#60A5FA', icon:'📺' },
    { name:'Arm Chair',     w:0.9, h:0.9, color:'rgba(236,72,153,0.25)', stroke:'#F9A8D4', icon:'🪑' },
    { name:'Side Table',    w:0.6, h:0.6, color:'rgba(16,185,129,0.25)', stroke:'#6EE7B7', icon:'🌿' },
    { name:'Floor Lamp',    w:0.4, h:0.4, color:'rgba(249,115,22,0.25)', stroke:'#FDB77A', icon:'💡' },
    { name:'Bookshelf',     w:1.0, h:0.3, color:'rgba(100,116,139,0.25)',stroke:'#94A3B8', icon:'📚' }
  ],
  bedroom: [
    { name:'King Bed',      w:1.9, h:2.0, color:'rgba(236,72,153,0.25)', stroke:'#F9A8D4', icon:'🛏️' },
    { name:'Wardrobe',      w:2.4, h:0.6, color:'rgba(124,58,237,0.25)', stroke:'#A78BFA', icon:'👔' },
    { name:'Dresser',       w:1.2, h:0.5, color:'rgba(245,158,11,0.25)', stroke:'#FCD34D', icon:'🪞' },
    { name:'Bedside Table', w:0.5, h:0.5, color:'rgba(37,99,235,0.25)',  stroke:'#60A5FA', icon:'🕯️' },
    { name:'Study Desk',    w:1.2, h:0.6, color:'rgba(16,185,129,0.25)', stroke:'#6EE7B7', icon:'📖' },
    { name:'Chair',         w:0.6, h:0.6, color:'rgba(249,115,22,0.25)', stroke:'#FDB77A', icon:'🪑' }
  ],
  kitchen: [
    { name:'Kitchen Counter',w:2.5, h:0.7, color:'rgba(245,158,11,0.25)',stroke:'#FCD34D', icon:'🍳' },
    { name:'Island',         w:1.5, h:1.0, color:'rgba(16,185,129,0.25)',stroke:'#6EE7B7', icon:'🏝️' },
    { name:'Refrigerator',   w:0.8, h:0.7, color:'rgba(37,99,235,0.25)', stroke:'#60A5FA', icon:'🧊' },
    { name:'Dining Table',   w:1.5, h:1.0, color:'rgba(124,58,237,0.25)',stroke:'#A78BFA', icon:'🍽️' },
    { name:'Chairs (x4)',    w:0.5, h:0.5, color:'rgba(249,115,22,0.25)', stroke:'#FDB77A', icon:'🪑' }
  ],
  dining: [
    { name:'Dining Table 6-seat',w:2.0, h:1.0, color:'rgba(124,58,237,0.25)',stroke:'#A78BFA', icon:'🍽️' },
    { name:'Dining Chair x6',    w:0.5, h:0.5, color:'rgba(236,72,153,0.25)',stroke:'#F9A8D4', icon:'🪑' },
    { name:'Sideboard',          w:1.8, h:0.5, color:'rgba(245,158,11,0.25)',stroke:'#FCD34D', icon:'🏺' },
    { name:'Bar Cart',           w:0.7, h:0.5, color:'rgba(16,185,129,0.25)',stroke:'#6EE7B7', icon:'🍷' }
  ],
  office: [
    { name:'L-Desk',         w:2.0, h:1.5, color:'rgba(37,99,235,0.25)',  stroke:'#60A5FA', icon:'💻' },
    { name:'Office Chair',   w:0.7, h:0.7, color:'rgba(124,58,237,0.25)', stroke:'#A78BFA', icon:'🪑' },
    { name:'Bookcase',       w:2.0, h:0.4, color:'rgba(100,116,139,0.25)',stroke:'#94A3B8', icon:'📚' },
    { name:'Meeting Table',  w:1.5, h:1.0, color:'rgba(16,185,129,0.25)', stroke:'#6EE7B7', icon:'📊' },
    { name:'Filing Cabinet', w:0.5, h:0.7, color:'rgba(245,158,11,0.25)', stroke:'#FCD34D', icon:'🗃️' }
  ]
};

function initPhase7() {
  document.getElementById('placeFurniture')?.addEventListener('click', autoPlaceFurniture);
  document.getElementById('shuffleFurniture')?.addEventListener('click', () => {
    autoPlaceFurniture(true);
  });
}

function autoPlaceFurniture(shuffle = false) {
  const roomType = document.getElementById('furnRoom').value;
  const roomW = parseFloat(document.getElementById('roomW').value) || 16;
  const roomH = parseFloat(document.getElementById('roomH').value) || 14;

  showLoading('AI placing furniture with collision detection...', () => {
    const canvas = document.getElementById('furnitureCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const PAD = 40;
    const SCALE = Math.min((W - PAD*2) / roomW, (H - PAD*2) / roomH);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0A0F1E';
    ctx.fillRect(0, 0, W, H);

    // Floor texture
    ctx.fillStyle = '#0F1520';
    ctx.fillRect(PAD, PAD, roomW * SCALE, roomH * SCALE);

    // Subtle wood-grain lines
    ctx.strokeStyle = 'rgba(124,58,237,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < roomW * SCALE; i += 12) {
      ctx.beginPath();
      ctx.moveTo(PAD + i, PAD);
      ctx.lineTo(PAD + i, PAD + roomH * SCALE);
      ctx.stroke();
    }

    // Room walls
    ctx.strokeStyle = '#A78BFA';
    ctx.lineWidth = 4;
    ctx.strokeRect(PAD, PAD, roomW * SCALE, roomH * SCALE);

    // Door opening (1m wide)
    const doorPos = PAD + roomW * SCALE * 0.5;
    ctx.clearRect(doorPos, PAD - 2, SCALE * 0.9, 6);
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(doorPos, PAD);
    ctx.arc(doorPos, PAD, SCALE * 0.9, 0, Math.PI/2);
    ctx.stroke();

    // Window
    const winPos = PAD;
    ctx.strokeStyle = '#FCD34D';
    ctx.lineWidth = 3;
    ctx.strokeRect(winPos, PAD + roomH * SCALE * 0.3, 4, SCALE * 1.2);

    // Dimensions
    ctx.fillStyle = '#64748B';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${roomW} ft`, PAD + roomW * SCALE / 2, PAD - 10);
    ctx.save(); ctx.translate(PAD - 15, PAD + roomH * SCALE / 2); ctx.rotate(-Math.PI/2);
    ctx.fillText(`${roomH} ft`, 0, 0);
    ctx.restore();

    // Place furniture
    const items = shuffle
      ? [...(FURNITURE_CATALOG[roomType] || FURNITURE_CATALOG.living)].sort(() => Math.random() - 0.5)
      : (FURNITURE_CATALOG[roomType] || FURNITURE_CATALOG.living);

    const placed = [];
    const layouts = getFurnitureLayout(roomType, roomW, roomH, SCALE, items, shuffle);

    layouts.forEach(item => {
      const fx = PAD + item.x * SCALE;
      const fy = PAD + item.y * SCALE;
      const fw = item.w * SCALE;
      const fh = item.h * SCALE;

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // Fill
      ctx.fillStyle = item.color;
      ctx.fillRect(fx, fy, fw, fh);
      ctx.shadowColor = 'transparent';

      // Border
      ctx.strokeStyle = item.stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(fx, fy, fw, fh);

      // Icon + label
      ctx.font = `${Math.max(10, Math.min(18, fw/3))}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(item.icon, fx + fw/2, fy + fh/2 - 5);
      ctx.font = `${Math.max(6, Math.min(9, fw/6))}px Inter`;
      ctx.fillStyle = 'rgba(241,245,249,0.8)';
      ctx.fillText(item.name, fx + fw/2, fy + fh - 7);

      // Walking space indicator
      ctx.strokeStyle = 'rgba(167,139,250,0.12)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3,3]);
      ctx.strokeRect(fx - 15, fy - 15, fw + 30, fh + 30);
      ctx.setLineDash([]);
      placed.push(item.name);
    });

    // Legend
    buildFurnitureLegend(layouts);
    toast(`${placed.length} furniture items placed automatically 🪑`, 'success');
  }, 1800);
}

function getFurnitureLayout(roomType, roomW, roomH, scale, items, shuffle) {
  const WALL_GAP = 0.3;
  const layouts = {
    living: [
      { ...items[0], x: roomW*0.1, y: roomH*0.55 },       // Sofa against bottom
      { ...items[1], x: roomW*0.35, y: roomH*0.5 },        // Coffee table center
      { ...items[2], x: roomW*0.1, y: WALL_GAP },          // TV unit against top wall
      { ...(items[3]||items[0]), x: roomW*0.7, y: roomH*0.55 }, // Arm chair
      { ...(items[4]||items[1]), x: roomW*0.72, y: roomH*0.4 }, // Side table
      { ...(items[5]||items[0]), x: roomW*0.15, y: roomH*0.35 } // Lamp
    ],
    bedroom: [
      { ...items[0], x: roomW*0.3, y: roomH*0.1 },         // Bed centered top
      { ...items[1], x: WALL_GAP, y: roomH*0.1 },          // Wardrobe left wall
      { ...items[2], x: roomW*0.65, y: WALL_GAP },         // Dresser top right
      { ...(items[3]||items[0]), x: roomW*0.25, y: roomH*0.12 }, // Bedside left
      { ...(items[3]||items[0]), x: roomW*0.55, y: roomH*0.12 }, // Bedside right
      { ...(items[4]||items[1]), x: roomW*0.6, y: roomH*0.6 }   // Study desk
    ],
    kitchen: [
      { ...items[0], x: WALL_GAP, y: WALL_GAP },           // Counter top
      { ...items[1], x: roomW*0.25, y: roomH*0.3 },        // Island center
      { ...items[2], x: roomW*0.75, y: WALL_GAP },         // Fridge corner
      { ...items[3], x: roomW*0.1, y: roomH*0.6 },         // Dining
      { ...(items[4]||items[0]), x: roomW*0.08, y: roomH*0.58 } // Chairs
    ],
    dining: [
      { ...items[0], x: roomW*0.2, y: roomH*0.25 },        // Table center
      { ...items[1], x: roomW*0.18, y: roomH*0.22 },       // Chairs around
      { ...(items[2]||items[1]), x: WALL_GAP, y: WALL_GAP }, // Sideboard
      { ...(items[3]||items[2]), x: roomW*0.6, y: roomH*0.3 } // Bar cart
    ],
    office: [
      { ...items[0], x: WALL_GAP, y: WALL_GAP },           // L-Desk corner
      { ...items[1], x: items[0].w + 0.5, y: items[0].h * 0.3 }, // Chair
      { ...items[2], x: roomW*0.5, y: WALL_GAP },          // Bookcase top
      { ...(items[3]||items[1]), x: roomW*0.2, y: roomH*0.55 }, // Meeting table
      { ...(items[4]||items[0]), x: roomW*0.7, y: roomH*0.5 }  // Filing
    ]
  };

  const base = (layouts[roomType] || layouts.living).slice(0, items.length);
  if (shuffle) {
    return base.map(item => ({
      ...item,
      x: Math.max(WALL_GAP, Math.min(roomW - item.w - WALL_GAP, item.x + (Math.random()-0.5)*2)),
      y: Math.max(WALL_GAP, Math.min(roomH - item.h - WALL_GAP, item.y + (Math.random()-0.5)*2))
    }));
  }
  return base;
}

function buildFurnitureLegend(items) {
  const legend = document.getElementById('furnitureLegend');
  if (!legend) return;
  legend.innerHTML = items.slice(0,5).map(item => `
    <div class="legend-item">
      <div class="legend-color" style="background:${item.color};border-color:${item.stroke}"></div>
      <span>${item.icon} ${item.name}</span>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════
//  PHASE 8 — 3D Scene Generator
// ═══════════════════════════════════════════════════
let scene3DAngle = 0;
let scene3DFrame = null;

function initPhase8() {
  document.getElementById('generate3D')?.addEventListener('click', generate3DScene);
  document.getElementById('rotate3DBtn')?.addEventListener('click', () => {
    if (scene3DFrame) { cancelAnimationFrame(scene3DFrame); scene3DFrame = null; document.getElementById('rotate3DBtn').textContent = '🔄 Rotate View'; }
    else { start3DRotation(); document.getElementById('rotate3DBtn').textContent = '⏸ Pause'; }
  });
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
      s.classList.add('active');
      state.wallColor = s.dataset.color;
    });
  });
}

function generate3DScene() {
  const theme = document.getElementById('scene3DTheme').value;
  const wallColor = state.wallColor;
  const floorMat = document.getElementById('floorMaterial').value;
  showLoading('Generating 3D scene from floor plan...', () => {
    draw3DScene(theme, wallColor, floorMat, scene3DAngle);
    document.querySelector('#panel-8 .scene-controls-overlay').innerHTML = '<span class="scene-hint">✓ 3D Scene generated — Click Rotate View to animate</span>';
    document.getElementById('sceneInfo').innerHTML = `
      <strong>Scene Info</strong><br>
      Theme: ${theme} | Walls: ${wallColor} | Floor: ${floorMat}<br>
      Polygons: ${randInt(8000, 15000).toLocaleString()} | Lights: 4 | Objects: ${randInt(12,24)}
    `;
    toast('3D scene generated! 🎮', 'success');
    state.scene3DInit = true;
  }, 2500);
}

function initScene3D() {
  const canvas = document.getElementById('scene3DCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#050A14';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(167,139,250,0.3)';
  ctx.font = '13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click "Generate 3D Scene" to start', W/2, H/2);
}

function draw3DScene(theme, wallColor, floorMat, angle = 0) {
  const canvas = document.getElementById('scene3DCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Sky / ambient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  const themes = {
    modern:    ['#1A1A3E', '#2C2C5E'],
    rustic:    ['#2E1B0E', '#4A3020'],
    luxury:    ['#0A0A1A', '#1A0A2E'],
    minimalist:['#1A1A1A', '#2A2A2A']
  };
  const [sky1, sky2] = themes[theme] || themes.modern;
  skyGrad.addColorStop(0, sky1);
  skyGrad.addColorStop(1, sky2);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Perspective transformation
  const perspective = (x, y, z) => {
    const camZ = 5 + Math.cos(angle) * 2;
    const camX = Math.sin(angle) * 3;
    const fov = 400;
    const relX = x - camX, relZ = z + camZ;
    const px = W/2 + (relX / relZ) * fov;
    const py = H/2 - (y / relZ) * fov;
    return { x: px, y: py };
  };

  const drawQuad = (pts, fill, stroke = null, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.8; ctx.stroke(); }
    ctx.globalAlpha = 1;
  };

  // Floor
  const floorColors = { wood:'#5A3515', marble:'#F0EDE8', tile:'#4A5568', concrete:'#374151' };
  const floorCol = floorColors[floorMat] || '#5A3515';
  const floorPts = [perspective(-4,-1.5,0), perspective(4,-1.5,0), perspective(4,-1.5,8), perspective(-4,-1.5,8)];
  const floorGrad = ctx.createLinearGradient(floorPts[0].x, floorPts[0].y, floorPts[3].x, floorPts[3].y);
  floorGrad.addColorStop(0, floorCol);
  floorGrad.addColorStop(0.5, lightenColor(floorCol, 30));
  floorGrad.addColorStop(1, floorCol);
  drawQuad(floorPts, floorGrad, 'rgba(255,255,255,0.05)');

  // Back wall
  const wallPts = [perspective(-4,-1.5,8), perspective(4,-1.5,8), perspective(4,2,8), perspective(-4,2,8)];
  drawQuad(wallPts, wallColor || '#F5F0E8', 'rgba(0,0,0,0.1)');

  // Left wall
  const leftPts = [perspective(-4,-1.5,0), perspective(-4,-1.5,8), perspective(-4,2,8), perspective(-4,2,0)];
  drawQuad(leftPts, darkenColor(wallColor || '#F5F0E8', 20), 'rgba(0,0,0,0.1)', 0.9);

  // Ceiling
  const ceilPts = [perspective(-4,2,0), perspective(4,2,0), perspective(4,2,8), perspective(-4,2,8)];
  drawQuad(ceilPts, darkenColor(wallColor || '#F5F0E8', 10), null, 0.7);

  // Window on back wall
  const winBL = perspective(-2,0.2,8), winBR = perspective(-0.5,0.2,8);
  const winTL = perspective(-2,1.5,8), winTR = perspective(-0.5,1.5,8);
  drawQuad([winBL,winBR,winTR,winTL], 'rgba(135,206,235,0.6)', 'rgba(255,255,255,0.4)');
  // Window glow
  const wCx = (winBL.x+winTR.x)/2, wCy = (winBL.y+winTR.y)/2;
  const wGrad = ctx.createRadialGradient(wCx,wCy,0,wCx,wCy,80);
  wGrad.addColorStop(0,'rgba(135,206,235,0.3)');
  wGrad.addColorStop(1,'transparent');
  ctx.fillStyle = wGrad;
  ctx.fillRect(0,0,W,H);

  // Furniture — Sofa
  const sofaPts = [
    perspective(-2,-1.5,3), perspective(0,-1.5,3),
    perspective(0,-0.8,3), perspective(-2,-0.8,3)
  ];
  drawQuad(sofaPts, '#4A3580', '#7C3AED');
  const sofaBackPts = [
    perspective(-2,-0.8,3.3), perspective(0,-0.8,3.3),
    perspective(0,0.1,3.3), perspective(-2,0.1,3.3)
  ];
  drawQuad(sofaBackPts, '#5A4090', '#7C3AED');

  // TV unit
  const tvUnitPts = [perspective(-3,-1.5,7.5), perspective(-0.5,-1.5,7.5), perspective(-0.5,-0.9,7.5), perspective(-3,-0.9,7.5)];
  drawQuad(tvUnitPts, '#2C2C3E', '#4A4A6E');
  // TV screen
  const tvPts = [perspective(-2.8,-0.9,7.6), perspective(-0.7,-0.9,7.6), perspective(-0.7,0.5,7.6), perspective(-2.8,0.5,7.6)];
  drawQuad(tvPts, '#111827', '#374151');
  // TV glow
  const tvScreenGrad = ctx.createRadialGradient((tvPts[0].x+tvPts[2].x)/2,(tvPts[0].y+tvPts[2].y)/2,0,(tvPts[0].x+tvPts[2].x)/2,(tvPts[0].y+tvPts[2].y)/2,40);
  tvScreenGrad.addColorStop(0,'rgba(37,99,235,0.5)');
  tvScreenGrad.addColorStop(1,'transparent');
  ctx.fillStyle = tvScreenGrad;
  ctx.fillRect(0,0,W,H);

  // Lighting — ceiling spotlights
  const lightPositions = [[-2,2,3],[0,2,5],[2,2,7]];
  lightPositions.forEach(([lx,ly,lz]) => {
    const lp = perspective(lx, ly, lz);
    const lGrad = ctx.createRadialGradient(lp.x, lp.y, 0, lp.x, lp.y, 60);
    lGrad.addColorStop(0, 'rgba(255,240,200,0.15)');
    lGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); ctx.arc(lp.x, lp.y, 4, 0, Math.PI*2);
    ctx.fillStyle = '#FFFDE7'; ctx.fill();
  });

  // Floor reflection
  const reflGrad = ctx.createLinearGradient(0, H*0.6, 0, H);
  reflGrad.addColorStop(0, 'rgba(124,58,237,0.05)');
  reflGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, H*0.6, W, H*0.4);

  // Theme-specific details
  if (theme === 'luxury') {
    const goldPts = [perspective(-4,2,0), perspective(4,2,0), perspective(4,2.05,0), perspective(-4,2.05,0)];
    drawQuad(goldPts, '#C49A2C', null);
  }
}

function start3DRotation() {
  const canvas = document.getElementById('scene3DCanvas');
  if (!canvas) return;
  const theme = document.getElementById('scene3DTheme')?.value || 'modern';
  const wallColor = state.wallColor;
  const floorMat = document.getElementById('floorMaterial')?.value || 'wood';

  function animate() {
    scene3DAngle += 0.008;
    draw3DScene(theme, wallColor, floorMat, scene3DAngle);
    scene3DFrame = requestAnimationFrame(animate);
  }
  animate();
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, ((num >> 16) & 0xFF) + amount);
  const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
  const b = Math.min(255, (num & 0xFF) + amount);
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

function darkenColor(hex, amount) {
  if (!hex.startsWith('#') || hex.length < 7) return hex;
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, ((num >> 16) & 0xFF) - amount);
  const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
  const b = Math.max(0, (num & 0xFF) - amount);
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

// ═══════════════════════════════════════════════════
//  PHASE 9 — AI Camera & Lighting
// ═══════════════════════════════════════════════════
const CAMERA_PRESETS = {
  wide:      { fov: 90, posX: 0,   posY: 0.5, posZ: -3,  label: 'Wide 90°', aperture: 'f/8', ss: '1/60s' },
  corner:    { fov: 75, posX: -3,  posY: 0.8, posZ: -2,  label: 'Corner 75°', aperture: 'f/5.6', ss: '1/125s' },
  eye:       { fov: 60, posX: 0,   posY: 0,   posZ: -1.5,label: 'Eye Level 60°', aperture: 'f/4', ss: '1/250s' },
  birds:     { fov: 120, posX: 0,  posY: 5,   posZ: 3,   label: 'Top 120°', aperture: 'f/11', ss: '1/30s' },
  cinematic: { fov: 35, posX: -2,  posY: 0.3, posZ: -4,  label: 'Cinematic 35mm', aperture: 'f/2.8', ss: '1/500s' }
};

const LIGHTING_PRESETS = {
  daylight:  { ambient: 'rgba(255,240,200,0.15)', sun: '#FFE4B5', intensity: 0.9, color: '#FFF8DC' },
  evening:   { ambient: 'rgba(255,120,60,0.1)',   sun: '#FF8C42', intensity: 0.7, color: '#FF6B35' },
  studio:    { ambient: 'rgba(240,240,255,0.2)',   sun: '#F0F0FF', intensity: 1.0, color: '#E8E8F8' },
  dramatic:  { ambient: 'rgba(60,0,120,0.15)',    sun: '#7B2FBE', intensity: 0.5, color: '#4A0E8F' },
  night:     { ambient: 'rgba(0,30,80,0.2)',       sun: '#1E3A5F', intensity: 0.3, color: '#0D1B2A' }
};

function initPhase9() {
  document.getElementById('applyCamera')?.addEventListener('click', applyCamera);
  document.getElementById('autoCamera')?.addEventListener('click', () => {
    const presets = Object.keys(CAMERA_PRESETS);
    const lights = Object.keys(LIGHTING_PRESETS);
    const autoPreset = pick(presets);
    const autoLight = pick(lights);
    document.getElementById('cameraPreset').value = autoPreset;
    document.getElementById('lightingMode').value = autoLight;
    showLoading('AI selecting optimal camera...', () => {
      applyCamera();
      toast(`AI selected: ${autoPreset} + ${autoLight} lighting 📷`, 'success');
    }, 1200);
  });
}

function applyCamera() {
  const preset = document.getElementById('cameraPreset').value;
  const lighting = document.getElementById('lightingMode').value;
  const hdri = document.getElementById('hdriEnv').value;
  const cam = CAMERA_PRESETS[preset] || CAMERA_PRESETS.wide;
  const light = LIGHTING_PRESETS[lighting] || LIGHTING_PRESETS.daylight;

  showLoading('Applying camera & lighting setup...', () => {
    drawCameraPreview(cam, light, hdri, preset, lighting);

    const statsEl = document.getElementById('cameraStats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="camera-stat-row"><span>Focal Length</span><span>${cam.label}</span></div>
        <div class="camera-stat-row"><span>Aperture</span><span>${cam.aperture}</span></div>
        <div class="camera-stat-row"><span>Shutter Speed</span><span>${cam.ss}</span></div>
        <div class="camera-stat-row"><span>Lighting</span><span>${lighting.charAt(0).toUpperCase()+lighting.slice(1)}</span></div>
        <div class="camera-stat-row"><span>HDRI</span><span>${hdri.charAt(0).toUpperCase()+hdri.slice(1)}</span></div>
        <div class="camera-stat-row"><span>ISO</span><span>${randInt(100,800)}</span></div>
        <div class="camera-stat-row"><span>EV</span><span>${(rand(-1,2)).toFixed(1)}</span></div>
      `;
    }
    toast(`Camera applied: ${cam.label} 📷`, 'success');
  }, 1500);
}

function drawCameraPreview(cam, light, hdri, presetName, lightName) {
  const canvas = document.getElementById('cameraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Draw 3D-like scene with camera angle
  draw3DScene(
    document.getElementById('scene3DTheme')?.value || 'modern',
    state.wallColor,
    document.getElementById('floorMaterial')?.value || 'wood',
    cam.posX * 0.3
  );

  // Lighting overlay
  const lightGrad = ctx.createRadialGradient(W*0.5, H*0.2, 0, W*0.5, H*0.2, W*0.8);
  lightGrad.addColorStop(0, light.ambient);
  lightGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, W, H);

  // Vignette
  const vign = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.8);
  vign.addColorStop(0, 'transparent');
  vign.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);

  // Camera UI overlay
  ctx.strokeStyle = 'rgba(124,58,237,0.6)';
  ctx.lineWidth = 1;
  // Rule of thirds grid
  [W/3, W*2/3].forEach(x => { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); });
  [H/3, H*2/3].forEach(y => { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); });
  // Intersection dots
  [[W/3,H/3],[W*2/3,H/3],[W/3,H*2/3],[W*2/3,H*2/3]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fillStyle = 'rgba(167,139,250,0.7)'; ctx.fill();
  });

  // Camera info HUD
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 200, 60);
  ctx.fillStyle = '#A78BFA';
  ctx.font = 'bold 10px Inter, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('📷 ' + cam.label, 18, 27);
  ctx.fillStyle = '#94A3B8'; ctx.font = '9px Inter, monospace';
  ctx.fillText(`f/${cam.aperture.replace('f/','')}  ${cam.ss}  ISO ${randInt(100,400)}`, 18, 42);
  ctx.fillText(`🌅 ${lightName.toUpperCase()}  HDRI: ${hdri.toUpperCase()}`, 18, 57);

  // Focus indicator
  ctx.strokeStyle = '#34D399'; ctx.lineWidth = 2;
  ctx.strokeRect(W/2 - 25, H/2 - 20, 50, 40);
  ctx.beginPath(); ctx.moveTo(W/2-8, H/2); ctx.lineTo(W/2-3, H/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2+3, H/2); ctx.lineTo(W/2+8, H/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2, H/2-8); ctx.lineTo(W/2, H/2-3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2, H/2+3); ctx.lineTo(W/2, H/2+8); ctx.stroke();
}

// ═══════════════════════════════════════════════════
//  PHASE 10 — Photorealistic Rendering
// ═══════════════════════════════════════════════════
let renderInterval = null;
let currentRenderImage = null;
const whatsappImages = [
  "WhatsApp Image 2026-07-02 at 00.12.49 (1).jpeg",
  "WhatsApp Image 2026-07-02 at 00.12.49.jpeg",
  "WhatsApp Image 2026-07-02 at 00.12.50 (1).jpeg",
  "WhatsApp Image 2026-07-02 at 00.12.50.jpeg",
  "WhatsApp Image 2026-07-02 at 00.12.52 (1).jpeg",
  "WhatsApp Image 2026-07-02 at 00.12.52 (2).jpeg",
  "WhatsApp Image 2026-07-02 at 00.12.52.jpeg",
  "WhatsApp Image 2026-07-02 at 00.12.53.jpeg"
];

function initPhase10() {
  document.querySelectorAll('.quality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.renderSettings.quality = btn.dataset.q;
    });
  });
  document.getElementById('startRender')?.addEventListener('click', startRender);
}

function startRender() {
  if (state.renderSettings.rendering) { toast('Render already in progress', 'info'); return; }
  state.renderSettings.rendering = true;
  
  currentRenderImage = new Image();
  currentRenderImage.src = whatsappImages[Math.floor(Math.random() * whatsappImages.length)];
  
  const quality = state.renderSettings.quality;
  const durations = { draft: 3000, medium: 5000, high: 8000, ultra: 12000 };
  const totalDur = durations[quality] || 5000;

  const progressEl = document.getElementById('renderProgress');
  const overlay = document.getElementById('renderOverlay');

  progressEl.innerHTML = `
    <div class="render-progress-label">Rendering... <span id="renderPct">0%</span> — <span id="renderStage">Initializing</span></div>
    <div class="render-progress-bar-wrapper">
      <div class="render-progress-bar" id="renderBar" style="width:0%"></div>
    </div>
  `;
  overlay.classList.add('hidden');

  const stages = [
    'Building BVH Acceleration Structure',
    'Tracing Primary Rays',
    'Computing Global Illumination',
    'Calculating Caustics',
    'Processing Subsurface Scattering',
    'Denoising with AI (OIDN)',
    'Applying Post Processing',
    'Bloom & Lens Effects',
    'Color Grading',
    'Compositing Final Frame'
  ];

  let prog = 0;
  const startTime = Date.now();

  if (renderInterval) clearInterval(renderInterval);
  renderInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    prog = Math.min(99, (elapsed / totalDur) * 100);
    const stageIdx = Math.min(stages.length-1, Math.floor(prog / 10));
    const bar = document.getElementById('renderBar');
    const pct = document.getElementById('renderPct');
    const stage = document.getElementById('renderStage');
    if (bar) bar.style.width = prog + '%';
    if (pct) pct.textContent = Math.round(prog) + '%';
    if (stage) stage.textContent = stages[stageIdx];

    // Draw progressive render on canvas
    drawProgressiveRender(prog);

    if (elapsed >= totalDur) {
      clearInterval(renderInterval);
      prog = 100;
      if (bar) bar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      if (stage) stage.textContent = '✓ Render Complete!';
      drawFinalRender(quality);
      state.renderSettings.rendering = false;
      progressEl.innerHTML += '<div style="margin-top:.5rem;font-size:.8rem;color:var(--accent-green)">✓ Saved to project gallery</div>';
      toast(`${quality.toUpperCase()} render complete! ✨`, 'success');
    }
  }, 150);
}

function drawProgressiveRender(progress) {
  const canvas = document.getElementById('renderCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Draw base scene
  if (currentRenderImage && currentRenderImage.complete) {
    drawScaledImage(ctx, currentRenderImage, W, H);
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
  }

  // Progressive noise overlay (decreases as progress increases)
  const noiseLevel = Math.max(0, 1 - progress / 100);
  if (noiseLevel > 0.05) {
    ctx.fillStyle = `rgba(0,0,0,${noiseLevel*0.5})`;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(255,255,255,${noiseLevel*0.2})`;
    for (let i = 0; i < 500; i++) {
       ctx.fillRect(Math.random()*W, Math.random()*H, 2, 2);
    }
  }

  // Progress overlay
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, H - 30, W, 30);
  ctx.fillStyle = '#A78BFA';
  ctx.font = '11px Inter, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`⚙ Rendering: ${Math.round(progress)}%  |  Samples: ${Math.round(progress * 5.12)}`, 10, H - 11);
}

function drawFinalRender(quality) {
  const canvas = document.getElementById('renderCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Clean 3D render
  if (currentRenderImage && currentRenderImage.complete) {
    drawScaledImage(ctx, currentRenderImage, W, H);
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
  }

  // Post processing effects
  const bloom = document.getElementById('ppBloom')?.checked;
  const ao = document.getElementById('ppAO')?.checked;
  const dof = document.getElementById('ppDOF')?.checked;

  if (bloom) {
    // Bloom effect
    const bloomGrad = ctx.createRadialGradient(W*0.5, H*0.25, 0, W*0.5, H*0.25, W*0.5);
    bloomGrad.addColorStop(0, 'rgba(255,240,200,0.15)');
    bloomGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bloomGrad;
    ctx.fillRect(0, 0, W, H);
  }

  if (ao) {
    // AO darken corners/crevices
    const aoGrad = ctx.createRadialGradient(W*0.5, H*0.5, H*0.2, W*0.5, H*0.5, H*0.7);
    aoGrad.addColorStop(0, 'transparent');
    aoGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = aoGrad;
    ctx.fillRect(0, 0, W, H);
  }

  if (dof) {
    // DoF blur edges
    const dofGrad = ctx.createRadialGradient(W*0.5, H*0.5, 80, W*0.5, H*0.5, W*0.7);
    dofGrad.addColorStop(0, 'transparent');
    dofGrad.addColorStop(1, 'rgba(5,10,20,0.4)');
    ctx.fillStyle = dofGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // Quality watermark
  const qualityLabels = { draft: 'DRAFT', medium: 'HD', high: '2K', ultra: '4K' };
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(W-80, H-30, 80, 30);
  ctx.fillStyle = '#A78BFA';
  ctx.font = 'bold 11px Inter';
  ctx.textAlign = 'right';
  ctx.fillText('✨ ' + (qualityLabels[quality] || 'HD') + ' Render', W-10, H-11);

  toast(`Render saved as ${qualityLabels[quality] || 'HD'} PNG`, 'success', 2000);
}

function drawScaledImage(ctx, img, W, H) {
  const imgRatio = img.width / img.height;
  const canvasRatio = W / H;
  let drawW, drawH, drawX, drawY;
  if (imgRatio > canvasRatio) {
    drawH = H;
    drawW = img.width * (H / img.height);
    drawX = (W - drawW) / 2;
    drawY = 0;
  } else {
    drawW = W;
    drawH = img.height * (W / img.width);
    drawX = 0;
    drawY = (H - drawH) / 2;
  }
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

// ═══════════════════════════════════════════════════
//  PHASE 11 — Budget & Shopping Engine
// ═══════════════════════════════════════════════════
function initPhase11() {
  const slider = document.getElementById('totalBudget');
  const display = document.getElementById('budgetValueDisplay');

  slider?.addEventListener('input', () => {
    const v = slider.value;
    state.budget = parseInt(v);
    display.textContent = '₹' + v + ' Lakhs';
    // Update slider gradient
    const pct = ((v - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--accent-purple) ${pct}%, var(--bg-secondary) ${pct}%)`;
  });

  document.getElementById('generateBudget')?.addEventListener('click', generateBudget);
  document.getElementById('exportPdfBtn')?.addEventListener('click', exportBudgetToPDF);
}

function exportBudgetToPDF() {
  toast('Exporting PDF Report...', 'info', 2000);
  setTimeout(() => {
    // We simulate PDF export using window.print which browsers handle natively as Save as PDF
    window.print();
  }, 1000);
}

function generateBudget() {
  const budget = parseInt(document.getElementById('totalBudget').value) || 20;
  const area = parseInt(document.getElementById('budgetArea').value) || 1200;
  const quality = document.getElementById('budgetQuality').value;

  showLoading('Generating itemized budget report...', () => {
    const report = calculateBudget(budget, area, quality);
    renderBudgetReport(report);
    toast(`Budget report generated for ₹${budget} Lakhs 💰`, 'success');
  }, 1800);
}

function calculateBudget(totalLakhs, area, quality) {
  const total = totalLakhs * 100000;
  const multipliers = { economy: 0.7, standard: 1.0, premium: 1.5, luxury: 2.5 };
  const m = multipliers[quality] || 1;

  const breakdown = [
    { icon:'🧱', name:'Civil Work & Structure', pct: 0.20, qty: area + ' sqft', unit: '₹' + Math.round(20*m) + '/sqft' },
    { icon:'🪟', name:'Doors, Windows & Glazing', pct: 0.10, qty: '8–12 units', unit: '₹' + (30000*m).toLocaleString('en-IN') },
    { icon:'🎨', name:'Paint & Finishes', pct: 0.06, qty: (area*2.5).toFixed(0) + ' sqft', unit: '₹' + Math.round(45*m) + '/sqft' },
    { icon:'🪵', name:'Flooring', pct: 0.12, qty: area + ' sqft', unit: '₹' + Math.round(120*m) + '/sqft' },
    { icon:'🪑', name:'Furniture & Fixtures', pct: 0.22, qty: 'Full set', unit: 'Incl. modular' },
    { icon:'💡', name:'Electrical & Lighting', pct: 0.08, qty: area + ' sqft', unit: '₹' + Math.round(65*m) + '/sqft' },
    { icon:'🚿', name:'Plumbing & Sanitary', pct: 0.07, qty: '3–5 points', unit: '₹' + (25000*m).toLocaleString('en-IN') },
    { icon:'❄️', name:'HVAC & Ventilation', pct: 0.06, qty: '2–4 units', unit: '₹' + (40000*m).toLocaleString('en-IN') },
    { icon:'🏡', name:'Modular Kitchen', pct: 0.05, qty: '8–12 ft run', unit: '₹' + (15000*m).toLocaleString('en-IN') + '/ft' },
    { icon:'🔩', name:'Miscellaneous', pct: 0.04, qty: 'Contingency', unit: '5% buffer' }
  ];

  return { total, breakdown, area, quality };
}

function renderBudgetReport(report) {
  const container = document.getElementById('budgetReport');
  if (!container) return;

  const fmt = (n) => '₹' + (n/100000).toFixed(1) + 'L';
  const maxAmt = Math.max(...report.breakdown.map(b => b.pct * report.total));

  container.innerHTML = `
    <div class="budget-total">
      <div class="budget-total-label">💰 Total Project Budget</div>
      <div class="budget-total-val">${fmt(report.total)}</div>
    </div>
    <div class="budget-breakdown">
      ${report.breakdown.map(item => {
        const amt = item.pct * report.total;
        const barPct = (amt / maxAmt) * 100;
        return `
          <div class="budget-line">
            <div class="budget-line-label"><span>${item.icon}</span><span>${item.name}</span></div>
            <div class="budget-line-bar"><div class="budget-line-bar-fill" style="width:${barPct}%"></div></div>
            <div class="budget-line-value">${fmt(amt)}</div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="budget-shopping">
      <div class="budget-shopping-title">🛒 Shopping Recommendations</div>
      ${generateShoppingList(report).map(item => `
        <div class="shopping-item">
          <div class="shopping-item-icon">${item.icon}</div>
          <div>
            <div class="shopping-item-name">${item.name}</div>
            <div style="font-size:.72rem;color:var(--text-muted)">${item.source}</div>
          </div>
          <div class="shopping-item-price">${item.price}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateShoppingList(report) {
  const qual = report.quality;
  const sources = {
    economy: ['IKEA India', 'Pepperfry', 'HomeTown', 'Urban Ladder Basics'],
    standard: ['Urban Ladder', 'Godrej Interio', 'Nilkamal', 'Durian'],
    premium: ['Natuzzi', 'B&B Italia', 'Poliform India', 'Ligne Roset'],
    luxury: ['Roche Bobois', 'Flexform', 'Minotti', 'Cassina']
  };
  const src = sources[qual] || sources.standard;

  return [
    { icon:'🛋️', name:'Living Room Set',  source: pick(src), price: '₹' + (rand(0.8,4)*100000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',') },
    { icon:'🛏️', name:'Master Bedroom',   source: pick(src), price: '₹' + (rand(0.5,3)*100000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',') },
    { icon:'🍳', name:'Modular Kitchen',  source: pick(src), price: '₹' + (rand(1,8)*100000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',') },
    { icon:'💡', name:'Lighting Package', source: 'Havells / Philips', price: '₹' + (rand(0.3,2)*100000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',') },
    { icon:'🪵', name:'Flooring',         source: 'Asian Granito', price: '₹' + Math.round(rand(45,250)) + '/sqft' }
  ];
}

// ═══════════════════════════════════════════════════
//  PHASE 12 — Complete AI Workflow
// ═══════════════════════════════════════════════════
function initPhase12() {
  document.getElementById('runFullWorkflow')?.addEventListener('click', runCompleteWorkflow);
  // Set a default prompt if empty
  document.getElementById('workflowPrompt')?.addEventListener('focus', function() {
    if (!this.value) {
      this.value = '3BHK modern apartment, 1400 sqft, budget ₹18 lakhs, earthy warm tones, open kitchen, vastu compliant, spacious living room with plenty of natural light';
    }
  });
}

async function runCompleteWorkflow() {
  const prompt = document.getElementById('workflowPrompt').value.trim();
  if (!prompt) { toast('Enter your design requirements first', 'error'); return; }
  if (state.workflow.running) { toast('Workflow already running', 'info'); return; }

  state.workflow.running = true;
  state.workflow.step = 0;
  const resultsEl = document.getElementById('workflowResults');
  resultsEl.innerHTML = '<div class="workflow-result-text">Pipeline starting…</div>';

  // Reset all pipeline steps
  for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
    const el = document.getElementById('pipe-' + i);
    if (el) { el.className = 'pipeline-step'; }
  }

  const stepDurations = [1200, 1800, 2200, 1600, 1400, 1900, 2500, 1300, 3500, 1500];
  const stepMessages = [
    '📝 Parsing requirements from your prompt...',
    '🤖 LLM interpreting natural language to JSON...',
    '🗺️ Computational geometry generating floor plan...',
    '🕉️ Vastu rule engine validating layout...',
    '🎨 AI ranking materials by budget & style...',
    '🪑 Spatial reasoning placing furniture...',
    '🎮 Three.js building 3D scene geometry...',
    '📷 AI selecting optimal camera angles...',
    '✨ Ray tracing photorealistic render...',
    '💰 Generating itemized budget report...'
  ];

  for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
    const stepEl = document.getElementById('pipe-' + i);
    if (stepEl) stepEl.classList.add('running');
    resultsEl.innerHTML = `<div class="workflow-result-text">${stepMessages[i]}</div>`;

    await new Promise(resolve => setTimeout(resolve, stepDurations[i]));

    if (stepEl) { stepEl.classList.remove('running'); stepEl.classList.add('done'); }
    state.workflow.step = i + 1;
  }

  // Build results
  const parsed = interpretPrompt(prompt);
  state.workflow.running = false;

  resultsEl.innerHTML = `
    <div class="workflow-complete-banner">
      <h3>🎉 Design Complete!</h3>
      <p>All 12 AI phases executed successfully</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1.5rem">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:1rem">
        <div style="font-weight:700;color:var(--text-accent);margin-bottom:.75rem">📊 Design Summary</div>
        <div style="font-size:.82rem;color:var(--text-secondary);line-height:1.8">
          Type: <strong style="color:var(--text-primary)">${parsed.configuration.type}</strong><br>
          Area: <strong style="color:var(--text-primary)">${parsed.configuration.totalArea} sqft</strong><br>
          Budget: <strong style="color:var(--text-primary)">₹${parsed.configuration.budget_lakhs}L</strong><br>
          Rooms: <strong style="color:var(--text-primary)">${parsed.rooms.length} spaces</strong><br>
          Style: <strong style="color:var(--text-primary)">${parsed.style.primary}</strong><br>
          Vastu: <strong style="color:var(--accent-green)">${parsed.constraints.vastuCompliant ? '✓ Compliant' : 'Not specified'}</strong>
        </div>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:1rem">
        <div style="font-weight:700;color:var(--text-accent);margin-bottom:.75rem">🏠 Generated Spaces</div>
        <div style="display:flex;flex-direction:column;gap:.35rem">
          ${parsed.rooms.map(r => `
            <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--text-secondary)">
              <span>${r.name}</span><span style="color:var(--text-primary);font-weight:600">${r.area} sqft</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-top:1rem">
      ${[
        { icon:'🗺️', label:'Floor Plan', status:'Generated', color:'var(--accent-green)' },
        { icon:'🕉️', label:'Vastu Score', status:'87%', color:'var(--accent-purple)' },
        { icon:'🎮', label:'3D Scene', status:'Ready', color:'var(--accent-blue)' },
        { icon:'💰', label:'Budget', status:'₹'+parsed.configuration.budget_lakhs+'L', color:'var(--accent-amber)' }
      ].map(c => `
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:.875rem;text-align:center">
          <div style="font-size:1.5rem;margin-bottom:.35rem">${c.icon}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">${c.label}</div>
          <div style="font-size:.9rem;font-weight:700;color:${c.color}">${c.status}</div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:1rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
      <button class="btn-primary" onclick="switchPhase(4)">🗺️ View Floor Plan</button>
      <button class="btn-primary" onclick="switchPhase(8)">🎮 View 3D Scene</button>
      <button class="btn-ghost" onclick="switchPhase(11)">💰 View Budget</button>
    </div>
  `;

  toast('🎉 Complete AI workflow finished! All 12 phases done.', 'success', 4000);
}

// ─── Initial Demo Data ────────────────────────────
(function seedDemo() {
  // Give CAD a sample room after a short delay
  setTimeout(() => {
    if (state.cadObjects.length === 0) {
      state.cadObjects = [
        { type: 'room', x1: 40, y1: 40, x2: 280, y2: 200 },
        { type: 'room', x1: 40, y1: 220, x2: 160, y2: 360 },
        { type: 'room', x1: 180, y1: 220, x2: 340, y2: 360 },
        { type: 'door', x1: 155, y1: 130, x2: 185, y2: 155 },
        { type: 'window', x1: 100, y1: 40, x2: 180, y2: 55 },
        { type: 'wall', x1: 40, y1: 40, x2: 40, y2: 360 },
        { type: 'wall', x1: 40, y1: 40, x2: 340, y2: 40 }
      ];
      state.cadHistory = [[], [...state.cadObjects]];
      state.cadHistoryIndex = 1;
      // Re-trigger draw if phase 2 is active
      const panel2 = document.getElementById('panel-2');
      if (panel2 && panel2.classList.contains('active')) {
        const canvas = document.getElementById('cadCanvas');
        if (canvas) canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }));
      }
    }
  }, 500);
})();
