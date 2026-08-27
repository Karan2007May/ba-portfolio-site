// Shared Logic: Top Navigation, Mobile Drawer, Theme, Global Search, and Anime Ocean/Beach Canvas Engine

document.addEventListener('DOMContentLoaded', () => {
  // 1. Detect page nesting depth to resolve root prefix
  const path = window.location.pathname;
  const isSubpage = path.includes('/projects/') || path.includes('/blog/');
  const rootPrefix = isSubpage ? '../' : './';

  // 2. Initialize Theme with Ocean Abyss (Dark) and Seaside Beach (Light)
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(toggle => {
    updateThemeToggleUI(toggle, savedTheme);
    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
      themeToggles.forEach(t => updateThemeToggleUI(t, newTheme));
    });
  });

  function updateThemeToggleUI(el, theme) {
    const label = el.querySelector('.theme-toggle-label') || el;
    if (theme === 'light') {
      label.innerHTML = '<i class="fas fa-umbrella-beach"></i> Seaside Beach';
    } else {
      label.innerHTML = '<i class="fas fa-water"></i> Ocean Abyss';
    }
  }

  // Sanitize any corrupted encoding characters across the document DOM
  function sanitizeEncoding() {
    const walkText = (node) => {
      if (node.nodeType === 3) {
        if (node.nodeValue.includes('Â©')) {
          node.nodeValue = node.nodeValue.replace(/Â©/g, '©');
        }
        if (node.nodeValue.includes('â€“')) {
          node.nodeValue = node.nodeValue.replace(/â€“/g, '–');
        }
      } else {
        for (let child of node.childNodes) walkText(child);
      }
    };
    walkText(document.body);
  }
  sanitizeEncoding();

  // 3. Mobile Navigation Drawer Toggle
  const menuBtn = document.querySelector('.menu-toggle-btn');
  const drawer = document.querySelector('.mobile-menu-drawer');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      drawer.classList.toggle('open');
      const icon = menuBtn.querySelector('i');
      if (icon) icon.className = drawer.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });
    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && e.target !== menuBtn) {
        drawer.classList.remove('open');
        const icon = menuBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  }

  // 4. Global Search Engine Setup
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    let searchResults = document.getElementById('search-results');
    if (!searchResults) {
      searchResults = document.createElement('div');
      searchResults.id = 'search-results';
      searchResults.className = 'search-results-overlay';
      searchInput.parentNode.appendChild(searchResults);
    }

    let searchCache = { projects: [], documents: [], blog: [] };
    let isDataLoaded = false;

    async function loadSearchData() {
      if (isDataLoaded) return;
      try {
        if (typeof DataLoader !== 'undefined') {
          const [projects, documents, blog] = await Promise.all([
            DataLoader.getProjects().catch(() => []),
            DataLoader.getDocuments().catch(() => []),
            DataLoader.getBlogPosts().catch(() => [])
          ]);
          searchCache.projects = projects || [];
          searchCache.documents = documents || [];
          searchCache.blog = blog || [];
          isDataLoaded = true;
        }
      } catch (err) {
        console.error('Error loading search data:', err);
      }
    }

    // Preload data on focus or click
    searchInput.addEventListener('focus', loadSearchData);
    searchInput.addEventListener('click', loadSearchData);

    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) { 
        searchResults.classList.remove('active'); 
        searchResults.innerHTML = ''; 
        return; 
      }

      await loadSearchData();

      const matches = [];

      // Search Projects
      if (searchCache.projects && searchCache.projects.length > 0) {
        searchCache.projects.forEach(project => {
          const titleMatch = project.title && project.title.toLowerCase().includes(query);
          const subMatch = project.subtitle && project.subtitle.toLowerCase().includes(query);
          const indMatch = project.industry && project.industry.toLowerCase().includes(query);
          const catMatch = project.category && project.category.toLowerCase().includes(query);
          const techMatch = project.techStack && Array.isArray(project.techStack) && project.techStack.some(t => t.toLowerCase().includes(query));
          
          if (titleMatch || subMatch || indMatch || catMatch || techMatch) {
            const targetUrl = project.notionUrl || `${rootPrefix}projects.html`;
            matches.push({ 
              title: project.title, 
              desc: `${project.industry || 'Project'} | ${project.subtitle || project.category || 'Solution'}`, 
              url: targetUrl,
              isExternal: !!project.notionUrl
            });
          }
        });
      }

      // Search Documents / Resources
      if (searchCache.documents && searchCache.documents.length > 0) {
        searchCache.documents.forEach(doc => {
          const nameMatch = doc.name && doc.name.toLowerCase().includes(query);
          const typeMatch = doc.type && doc.type.toLowerCase().includes(query);
          const descMatch = doc.description && doc.description.toLowerCase().includes(query);
          
          if (nameMatch || typeMatch || descMatch) {
            matches.push({ 
              title: doc.name, 
              desc: `Document | ${doc.type} (${doc.industry || 'Resource'})`, 
              url: `${rootPrefix}documents/document.html?id=${doc.id}`,
              isExternal: false
            });
          }
        });
      }

      // Search Blog Posts
      if (searchCache.blog && searchCache.blog.length > 0) {
        searchCache.blog.forEach(post => {
          const titleMatch = post.title && post.title.toLowerCase().includes(query);
          const summaryMatch = (post.summary || post.excerpt || '').toLowerCase().includes(query);
          const catMatch = post.category && post.category.toLowerCase().includes(query);
          
          if (titleMatch || summaryMatch || catMatch) {
            const articleUrl = (post.url && post.url.endsWith('.html') && !post.url.includes('post.html')) 
              ? `${rootPrefix}${post.url}` 
              : `${rootPrefix}blog/post.html?id=${post.id}`;

            matches.push({ 
              title: post.title, 
              desc: `Insight Blog | ${post.date || 'Article'}`, 
              url: articleUrl,
              isExternal: false
            });
          }
        });
      }

      if (matches.length > 0) {
        searchResults.innerHTML = matches.slice(0, 6).map(match => {
          const clickAction = match.isExternal 
            ? `window.open('${match.url}', '_blank')` 
            : `window.location.href='${match.url}'`;
          return `
            <div class="search-result-item" onclick="${clickAction}">
              <div class="search-result-title" style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${match.title}</div>
              <div class="search-result-desc" style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${match.desc}</div>
            </div>`;
        }).join('');
        searchResults.classList.add('active');
      } else {
        searchResults.innerHTML = `<div class="search-result-item" style="cursor: default; color: var(--text-muted); font-size: 0.85rem; padding: 12px;">No matching items for "${query}"</div>`;
        searchResults.classList.add('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. ADVANCED ANIME OCEAN & SEASIDE BEACH CANVAS BACKGROUND ENGINE
  // ─────────────────────────────────────────────────────────────────────────────
  let canvas = document.getElementById('canvas-bubbles');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'canvas-bubbles';
    document.body.prepend(canvas);
  }
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    zIndex: '-1', pointerEvents: 'none'
  });

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth  * dpr;
    H = canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Mouse tracking ──
  const mouse = { x: -9999, y: -9999, radius: 180 };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout',  () => { mouse.x = -9999; mouse.y = -9999; });

  // ── Click ripple wave ──
  const ripples = [];
  window.addEventListener('click', e => {
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, max: 140, alpha: 0.7 });
  });

  function getThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      return [
        { r: 0,   g: 119, b: 182 }, // Anime Deep Lapis Blue
        { r: 0,   g: 180, b: 216 }, // Shining Ocean Water
        { r: 72,  g: 202, b: 228 }, // Tropical Crystal Cyan
        { r: 244, g: 122, b: 96 },  // Coral Shell Pink
        { r: 233, g: 196, b: 106 }, // Sunlit Sand Gold
        { r: 255, g: 255, b: 255 }, // Sea Foam White
      ];
    }
    return [
      { r: 0,   g: 242, b: 254 }, // Electric Abyss Cyan
      { r: 255, g: 42,  b: 141 }, // Neon Coral Pink
      { r: 255, g: 126, b: 80 },  // Glowing Sea Anemone Orange
      { r: 0,   g: 255, b: 183 }, // Bioluminescent Algae Green
      { r: 157, g: 78,  b: 221 }, // Deep Trench Violet
    ];
  }

  // ── Anime Water Surface Ripples (Light Mode) ──
  function drawAnimeWaterRipples(t) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (!isLight) return;

    const vW = window.innerWidth;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1.8;

    for (let i = 0; i < 4; i++) {
      const y = 60 + i * 40 + Math.sin(t * 0.01 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= vW; x += 50) {
        const waveY = y + Math.sin((x * 0.018) + (t * 0.02) + i) * 6;
        ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Anime Sparkle Flares (Light Mode Surface Sparkles) ──
  const sparkles = Array.from({ length: 22 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * (window.innerHeight * 0.55),
    size: Math.random() * 8 + 4,
    alpha: 0,
    speed: Math.random() * 0.02 + 0.01,
    phase: Math.random() * Math.PI * 2
  }));

  function drawAnimeSparkles(t) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (!isLight) return;

    sparkles.forEach(sp => {
      sp.alpha = Math.max(0, Math.sin(t * sp.speed + sp.phase));
      if (sp.alpha < 0.05) {
        sp.x = Math.random() * window.innerWidth;
        sp.y = Math.random() * (window.innerHeight * 0.55);
      }

      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(t * 0.01);
      ctx.fillStyle = `rgba(255, 255, 255, ${sp.alpha * 0.85})`;

      // 4-point anime star
      ctx.beginPath();
      ctx.moveTo(0, -sp.size);
      ctx.quadraticCurveTo(0, 0, sp.size, 0);
      ctx.quadraticCurveTo(0, 0, 0, sp.size);
      ctx.quadraticCurveTo(0, 0, -sp.size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -sp.size);
      ctx.fill();
      ctx.restore();
    });
  }

  // ── Anime Bioluminescent Jellyfish (Dark Mode) ──
  class Jellyfish {
    constructor() {
      this.reset(true);
    }

    reset(startRandom) {
      this.x = Math.random() * window.innerWidth;
      this.y = startRandom ? Math.random() * window.innerHeight : window.innerHeight + 60;
      this.r = Math.random() * 16 + 14;
      this.vy = -(Math.random() * 0.35 + 0.15);
      this.vx = (Math.random() - 0.5) * 0.2;
      this.phase = Math.random() * Math.PI * 2;
      const palette = getThemeColors();
      this.color = palette[Math.floor(Math.random() * palette.length)];
    }

    update(t) {
      this.y += this.vy;
      this.x += this.vx + Math.sin(t * 0.01 + this.phase) * 0.3;
      if (this.y < -80) this.reset(false);
    }

    draw(t) {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) return;

      const contract = 0.15 * Math.sin(t * 0.04 + this.phase);
      const rX = this.r * (1 + contract);
      const rY = this.r * (1 - contract);
      const { r, g, b } = this.color;

      ctx.save();
      ctx.translate(this.x, this.y);

      // ── Layer 1: Glass Body Refraction Gradient ──
      const bellGrd = ctx.createRadialGradient(0, -rY * 0.1, rX * 0.1, 0, 0, rX);
      bellGrd.addColorStop(0,   `rgba(255, 255, 255, 0.18)`);
      bellGrd.addColorStop(0.4, `rgba(${r},${g},${b},0.08)`);
      bellGrd.addColorStop(0.85,`rgba(${r},${g},${b},0.24)`);
      bellGrd.addColorStop(1,   `rgba(${r},${g},${b},0.02)`);

      ctx.beginPath();
      ctx.ellipse(0, 0, rX, rY, 0, Math.PI, 0);
      ctx.fillStyle = bellGrd;
      ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
      ctx.shadowBlur = 14;
      ctx.fill();

      // ── Layer 2: 3D Curved Glass Specular Highlight Sheen (Bubble Glass Effect) ──
      const specX = -rX * 0.35, specY = -rY * 0.35;
      const specGrd = ctx.createRadialGradient(specX, specY, 0, specX, specY, rX * 0.55);
      specGrd.addColorStop(0,   `rgba(255, 255, 255, 0.85)`);
      specGrd.addColorStop(0.3, `rgba(255, 255, 255, 0.4)`);
      specGrd.addColorStop(0.7, `rgba(255, 255, 255, 0.05)`);
      specGrd.addColorStop(1,   `rgba(255, 255, 255, 0)`);

      ctx.beginPath();
      ctx.ellipse(specX * 0.5, specY * 0.5, rX * 0.45, rY * 0.35, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = specGrd;
      ctx.fill();

      // ── Layer 3: Glass Prismatic Rim Edge ──
      const rimGrd = ctx.createLinearGradient(-rX, -rY, rX, rY);
      rimGrd.addColorStop(0,   `rgba(255, 255, 255, 0.9)`);
      rimGrd.addColorStop(0.4, `rgba(${r},${g},${b},0.8)`);
      rimGrd.addColorStop(1,   `rgba(0, 242, 254, 0.6)`);

      ctx.beginPath();
      ctx.ellipse(0, 0, rX, rY, 0, Math.PI, 0);
      ctx.strokeStyle = rimGrd;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // ── Layer 4: Inner Bioluminescent Core Node ──
      ctx.beginPath();
      ctx.arc(0, -rY * 0.15, rX * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, 0.6)`;
      ctx.shadowColor = `rgba(${r},${g},${b},1)`;
      ctx.shadowBlur = 18;
      ctx.fill();

      // ── Layer 5: Glass Filament Tentacles ──
      for (let i = -2; i <= 2; i++) {
        const tX = i * (rX * 0.32);
        const sway = Math.sin(t * 0.05 + i + this.phase) * 7;
        
        ctx.beginPath();
        ctx.moveTo(tX, 0);
        ctx.quadraticCurveTo(tX + sway, rY * 1.3, tX + sway * 1.6, rY * 2.4);
        
        const tentGrd = ctx.createLinearGradient(tX, 0, tX + sway, rY * 2.4);
        tentGrd.addColorStop(0,   `rgba(255, 255, 255, 0.7)`);
        tentGrd.addColorStop(0.4, `rgba(${r},${g},${b},0.5)`);
        tentGrd.addColorStop(1,   `rgba(0, 242, 254, 0.05)`);
        
        ctx.strokeStyle = tentGrd;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
        ctx.shadowBlur = 6;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  const jellyfishList = Array.from({ length: 7 }, () => new Jellyfish());

  // ── Bioluminescent Plankton / Floating Spores ──
  const planktons = Array.from({ length: 30 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.5 + 1.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.4 + 0.1),
    pulseSpeed: Math.random() * 0.03 + 0.01,
    phase: Math.random() * Math.PI * 2,
    colorIndex: Math.floor(Math.random() * 5)
  }));

  function drawPlanktons(t) {
    const colors = getThemeColors();
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    planktons.forEach(p => {
      p.x += p.vx + Math.sin(t * 0.01 + p.phase) * 0.25;
      p.y += p.vy;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;

      const alpha = isLight ? 0.35 + 0.25 * Math.sin(t * p.pulseSpeed + p.phase) : 0.55 + 0.4 * Math.sin(t * p.pulseSpeed + p.phase);
      const c = colors[p.colorIndex % colors.length];

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
      ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},0.8)`;
      ctx.shadowBlur = isLight ? 6 : 12;
      ctx.fill();
      ctx.restore();
    });
  }

  // ── Underwater Sunlight Caustics & Anime Beams ──
  function drawCaustics(t) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const vW = window.innerWidth;
    const vH = window.innerHeight;
    ctx.save();
    const beamCount = 5;
    for (let i = 0; i < beamCount; i++) {
      const xOrigin = (vW / (beamCount + 1)) * (i + 1) + Math.sin(t * 0.008 + i) * 70;
      const opacity = isLight ? 0.08 + 0.04 * Math.sin(t * 0.01 + i) : 0.05 + 0.025 * Math.sin(t * 0.01 + i);
      const beamGrd = ctx.createLinearGradient(xOrigin, 0, xOrigin + 140, vH);
      const colorStr = isLight ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 242, 254, ${opacity})`;
      beamGrd.addColorStop(0, colorStr);
      beamGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.moveTo(xOrigin - 40, 0);
      ctx.lineTo(xOrigin + 40, 0);
      ctx.lineTo(xOrigin + 260, vH);
      ctx.lineTo(xOrigin + 160, vH);
      ctx.closePath();
      ctx.fillStyle = beamGrd;
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Bubble class ──
  class Bubble {
    constructor(startRandom) {
      this.reset();
      if (startRandom) this.y = Math.random() * window.innerHeight;
    }

    reset() {
      const vW = window.innerWidth;
      const vH = window.innerHeight;

      // Depth layer: 0.5 = far/small, 2.0 = near/large
      this.z      = Math.random() * 1.5 + 0.5;
      this.radius = (Math.random() * 14 + 6) / (this.z * 0.85);
      this.x      = Math.random() * vW;
      this.y      = vH + this.radius + Math.random() * 60;

      // Drift velocity
      this.vx     = (Math.random() - 0.5) * 0.4 / this.z;
      this.vy     = -(Math.random() * 0.85 + 0.35) / this.z;

      // Sway oscillation
      this.swayAmp   = Math.random() * 0.6 + 0.2;
      this.swayFreq  = Math.random() * 0.015 + 0.006;
      this.swayPhase = Math.random() * Math.PI * 2;

      // Pick accent tint
      const palettes = getThemeColors();
      this.tint = palettes[Math.floor(Math.random() * palettes.length)];
    }

    update(t) {
      this.y += this.vy;
      this.x += this.vx + Math.sin(t * this.swayFreq + this.swayPhase) * this.swayAmp;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const rr   = mouse.radius / Math.max(this.z, 0.6);
      if (dist < rr && dist > 0) {
        const force = ((rr - dist) / rr) * (5.5 / this.z);
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * force;
        this.y += Math.sin(angle) * force;
      }

      const vW = window.innerWidth;
      const vH = window.innerHeight;
      if (this.y < -this.radius - 10 || this.x < -this.radius * 3 || this.x > vW + this.radius * 3) {
        this.reset();
      }
    }

    draw() {
      const x = this.x, y = this.y, r = this.radius;
      const { r: tr, g: tg, b: tb } = this.tint;

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      let alpha = 0.85 / (this.z * 0.9);
      if (isLight) alpha = 0.55;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();

      // ── Layer 1: Glass body tint ──
      const body = ctx.createRadialGradient(x, y + r * 0.15, r * 0.1, x, y, r);
      body.addColorStop(0,   `rgba(${tr},${tg},${tb},0)`);
      body.addColorStop(0.6, `rgba(${tr},${tg},${tb},${alpha * 0.03})`);
      body.addColorStop(1,   `rgba(${tr},${tg},${tb},${alpha * 0.08})`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();

      // ── Layer 2: Specular highlight ──
      const hlX = x - r * 0.36, hlY = y - r * 0.36;
      const spec = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, r * 0.52);
      spec.addColorStop(0,    `rgba(255,255,255,${alpha * 1.3})`);
      spec.addColorStop(0.25, `rgba(255,255,255,${alpha * 0.75})`);
      spec.addColorStop(0.6,  `rgba(255,255,255,${alpha * 0.18})`);
      spec.addColorStop(1,    `rgba(255,255,255,0)`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();

      // ── Layer 3: Colour refraction band ──
      const causX = x + r * 0.1, causY = y + r * 0.25;
      const caus = ctx.createRadialGradient(causX, causY, r * 0.05, causX, causY, r * 0.75);
      caus.addColorStop(0,   `rgba(${tr},${tg},${tb},${alpha * 0.38})`);
      caus.addColorStop(0.5, `rgba(${tr},${tg},${tb},${alpha * 0.18})`);
      caus.addColorStop(1,   `rgba(${tr},${tg},${tb},0)`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = caus;
      ctx.fill();

      ctx.restore();

      // ── Layer 4: Glass rim edge ──
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      const rimEdge = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
      if (isLight) {
        rimEdge.addColorStop(0,   `rgba(0, 119, 182, ${alpha * 0.8})`);
        rimEdge.addColorStop(1,   `rgba(244, 122, 96, ${alpha * 0.8})`);
      } else {
        rimEdge.addColorStop(0,    `rgba(255, 42, 141, ${alpha * 0.85})`);
        rimEdge.addColorStop(0.5,  `rgba(0, 242, 254, ${alpha * 0.85})`);
        rimEdge.addColorStop(1,    `rgba(0, 255, 183, ${alpha * 0.85})`);
      }
      ctx.strokeStyle = rimEdge;
      ctx.lineWidth   = Math.max(1.2, r * 0.08);
      ctx.stroke();
    }
  }

  // ── Create bubbles ──
  const BUBBLE_COUNT = 55;
  const bubbles = Array.from({ length: BUBBLE_COUNT }, () => new Bubble(true));

  // ── Canvas Bottom Seabed Elements ──
  function drawCanvasSeabed(t) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const vW = window.innerWidth;
    const vH = window.innerHeight;

    if (isLight) {
      // Light Mode Sand Dunes at canvas bottom
      ctx.beginPath();
      ctx.moveTo(0, vH);
      ctx.quadraticCurveTo(vW * 0.25, vH - 30, vW * 0.5, vH - 15);
      ctx.quadraticCurveTo(vW * 0.75, vH - 5, vW, vH - 22);
      ctx.lineTo(vW, vH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(233, 196, 106, 0.25)';
      ctx.fill();

      // Beach Scallop & Starfish on Canvas Bottom
      drawBeachShell(vW * 0.12, vH - 12, 14, '#f47a60');
      drawStarfish(vW * 0.45, vH - 10, 12, '#e76f51', t * 0.005);
      drawBeachShell(vW * 0.78, vH - 15, 16, '#0077b6');
      drawStarfish(vW * 0.88, vH - 8, 10, '#f47a60', -t * 0.005);
    } else {
      // Dark Mode Deep Ocean Seabed
      ctx.beginPath();
      ctx.moveTo(0, vH);
      ctx.quadraticCurveTo(vW * 0.2, vH - 28, vW * 0.45, vH - 14);
      ctx.quadraticCurveTo(vW * 0.7, vH - 35, vW, vH - 18);
      ctx.lineTo(vW, vH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(1, 12, 28, 0.65)';
      ctx.fill();

      // Waving Sea Kelp Fronds
      drawKelpStrand(vW * 0.08, vH, 80, 7, '#00ffb7', t, 0);
      drawKelpStrand(vW * 0.12, vH, 105, 8, '#00f2fe', t, 1.2);
      drawKelpStrand(vW * 0.82, vH, 95, 8, '#ff2a8d', t, 0.8);
      drawKelpStrand(vW * 0.88, vH, 75, 6, '#00ffb7', t, 2.1);
      drawKelpStrand(vW * 0.94, vH, 100, 9, '#ff7e50', t, 1.5);

      // Starfish & Bioluminescent Anemones
      drawStarfish(vW * 0.22, vH - 12, 14, '#ff2a8d', 0);
      drawStarfish(vW * 0.75, vH - 14, 12, '#00f2fe', 0.5);
    }
  }

  function drawKelpStrand(x, y, height, width, color, t, phase) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    const sway1 = Math.sin(t * 0.02 + phase) * 16;
    const sway2 = Math.cos(t * 0.015 + phase) * 26;
    ctx.bezierCurveTo(
      x + sway1 * 0.5, y - height * 0.4,
      x + sway2, y - height * 0.7,
      x + sway2 * 1.2, y - height
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawStarfish(cx, cy, r, color, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r, -Math.sin((18 + i * 72) * Math.PI / 180) * r);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (r * 0.4), -Math.sin((54 + i * 72) * Math.PI / 180) * (r * 0.4));
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.restore();
  }

  function drawBeachShell(cx, cy, r, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.restore();
  }

  // ── Draw click ripple waves ──
  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rpl = ripples[i];
      rpl.r     += 3.8;
      rpl.alpha -= 0.014;
      if (rpl.alpha <= 0) { ripples.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(rpl.x, rpl.y, rpl.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 242, 254, ${rpl.alpha})`;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }
  }

  // ── Main animation loop ──
  let animTime = 0;
  function animate() {
    animTime++;
    ctx.clearRect(0, 0, W / dpr, H / dpr);

    // Sunlight caustics
    drawCaustics(animTime);

    // Anime Water Surface Ripples & Sparkles (Light Mode)
    drawAnimeWaterRipples(animTime);
    drawAnimeSparkles(animTime);

    // Plankton / spores
    drawPlanktons(animTime);

    // Anime Jellyfish (Dark Mode)
    jellyfishList.forEach(j => { j.update(animTime); j.draw(animTime); });

    // Ripples
    drawRipples();

    // 3D glass bubbles
    bubbles.forEach(b => { b.update(animTime); b.draw(); });

    // Canvas seabed elements
    drawCanvasSeabed(animTime);

    requestAnimationFrame(animate);
  }

  animate();

  // 6. SCROLL REVEAL ANIMATIONS
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    });
  }, revealOptions);

  document.querySelectorAll('section, .card, .metric-card, .experience-node').forEach(el => {
    if (!el.closest('.hero-wrapper') && !el.classList.contains('hero-wrapper')) {
      el.style.opacity = '0';
      revealOnScroll.observe(el);
    }
  });

  // 7. TYPEWRITER EFFECT
  const typewriterEl = document.getElementById('typewriter-title');
  if (typewriterEl) {
    const titles = [
      "Business Analyst",
      "Product Consultant",
      "Solution Architect",
      "Digital Strategist"
    ];
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentTitle = titles[titleIndex];
      
      if (isDeleting) {
        charIndex--;
        typingSpeed = 40;
      } else {
        charIndex++;
        typingSpeed = 100;
      }

      typewriterEl.innerHTML = currentTitle.substring(0, charIndex) + '<span style="border-right: 3px solid var(--primary); padding-right: 4px; animation: blink 1s step-end infinite;"></span>';

      if (!isDeleting && charIndex === currentTitle.length) {
        isDeleting = true;
        typingSpeed = 2500;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        typingSpeed = 500;
      }

      setTimeout(type, typingSpeed);
    }
    
    setTimeout(type, 800);
  }

  // 8. AUTOMATIC SEAMLESS FOOTER & SEABED DECOR INJECTOR
  function injectSeabedDecor() {
    const footer = document.querySelector('footer, .app-footer');
    if (!footer) return;
    
    // Ensure footer has the sea-floor-banner prepended inside it
    if (!footer.querySelector('.sea-floor-banner')) {
      const banner = document.createElement('div');
      banner.className = 'sea-floor-banner';
      banner.innerHTML = `
        <svg class="sea-floor-svg" viewBox="0 0 1440 140" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path class="seabed-path-1" d="M0,110L60,102C120,94,240,78,360,82C480,86,600,110,720,115C840,120,960,102,1080,94C1200,86,1320,86,1380,86L1440,86L1440,140L1380,140C1320,140,1200,140,1080,140C960,140,840,140,720,140C600,140,480,140,360,140C240,140,120,140,60,140L0,140Z" fill="var(--seabed-fill)" opacity="0.75"></path>
          <path class="seabed-path-2" d="M0,55L48,68C96,82,192,110,288,110C384,110,480,82,576,73C672,64,768,73,864,87C960,101,1056,120,1152,119C1248,120,1344,101,1392,92L1440,82L1440,140L1392,140C1344,140,1248,140,1152,140C1056,140,960,140,864,140C768,140,672,140,576,140C480,140,384,140,288,140C192,140,96,140,48,140L0,140Z" fill="var(--seabed-fill)"></path>
          
          <!-- Detailed SVG Marine Elements (Corals, Shells & Starfish) -->
          <g class="coral-glow-element" transform="translate(180, 48)">
            <path d="M10,45 Q15,22 25,12 Q30,6 35,16 Q30,32 25,45 Z" fill="var(--coral-accent-1)"/>
            <path d="M22,45 Q30,18 42,10 Q48,14 40,28 Q35,38 30,45 Z" fill="var(--coral-accent-2)"/>
          </g>
          <g class="coral-glow-element" transform="translate(680, 42)">
            <path d="M15,40 Q25,15 35,8 Q40,12 32,25 Z" fill="var(--coral-accent-3)"/>
            <path d="M28,40 Q38,18 48,12 Q52,16 42,28 Z" fill="var(--coral-accent-4)"/>
          </g>
          <g class="coral-glow-element" transform="translate(1180, 45)">
            <path d="M10,50 Q20,25 35,12 Q42,16 32,32 Q25,45 20,50 Z" fill="var(--coral-accent-3)"/>
            <path d="M25,50 Q40,20 55,15 Q60,20 48,35 Q35,45 30,50 Z" fill="var(--coral-accent-1)"/>
          </g>
        </svg>
      `;
      footer.prepend(banner);
    }
  }
  injectSeabedDecor();

});
