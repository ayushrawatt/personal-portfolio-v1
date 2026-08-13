// OS Kernel / Window Manager for Ayush Rawat OS Portfolio

// Global state
const OS = {
  windows: {},
  zIndexCounter: 10,
  activeTheme: 'classic',
  bootSkipped: false,
  apps: {}, // App initializers registry
  activeAppStates: {} // To store runtime states of active apps
};

// Expose OS globally for apps to interact with
window.OS = OS;

// Registry of available apps
const APP_REGISTRY = {
  about: { title: 'About Me', icon: '👤', width: 450, height: 350 },
  terminal: { title: 'Terminal', icon: '💻', width: 500, height: 380 },
  filemanager: { title: 'Files', icon: '📁', width: 480, height: 320 },
  projects: { title: 'Projects', icon: '📂', width: 600, height: 400 },
  skills: { title: 'Skills', icon: '⚙️', width: 520, height: 360 },
  tetris: { title: 'Tetris', icon: '🎮', width: 320, height: 450 },
  snake: { title: 'Snake', icon: '🐍', width: 320, height: 420 },
  minesweeper: { title: 'Minesweeper', icon: '💣', width: 300, height: 380 },
  notepad: { title: 'Notepad', icon: '📝', width: 450, height: 300 },
  music: { title: 'Music', icon: '🎵', width: 300, height: 200 }
};

// ==========================================
// 1. BOOT SEQUENCE
// ==========================================
function initBootSequence() {
  const bootScreen = document.getElementById('boot-screen');
  const logContainer = document.getElementById('boot-log');
  const progressBar = document.getElementById('boot-progress');

  if (sessionStorage.getItem('os_booted') === 'true') {
    bootScreen.style.display = 'none';
    initOS();
    return;
  }

  const logs = [
    'Initializing kernel subsystems ... OK',
    'Checking filesystem integrity ... OK',
    'Loading environment variables ... OK',
    'Mounting virtual drive C:\\ ... OK',
    'Initializing Desktop Window Manager ... OK',
    'Loading standard theme assets ... OK',
    'Starting graphical interface ... OK'
  ];

  let currentLogIdx = 0;
  let progress = 0;

  const logInterval = setInterval(() => {
    if (OS.bootSkipped) return;
    if (currentLogIdx < logs.length) {
      const p = document.createElement('div');
      p.textContent = `> ${logs[currentLogIdx]}`;
      logContainer.appendChild(p);
      logContainer.scrollTop = logContainer.scrollHeight;
      currentLogIdx++;
    }
  }, 300);

  const progressInterval = setInterval(() => {
    if (OS.bootSkipped) return;
    progress += Math.random() * 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      clearInterval(logInterval);
      completeBoot();
    }
    progressBar.style.width = `${progress}%`;
  }, 100);

  // Esc key skips boot sequence
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      OS.bootSkipped = true;
      clearInterval(progressInterval);
      clearInterval(logInterval);
      completeBoot();
      window.removeEventListener('keydown', escHandler);
    }
  };
  window.addEventListener('keydown', escHandler);
}

function completeBoot() {
  const bootScreen = document.getElementById('boot-screen');
  bootScreen.classList.add('fade-out');
  sessionStorage.setItem('os_booted', 'true');
  setTimeout(() => {
    bootScreen.style.display = 'none';
    initOS();
  }, 800);
}

// ==========================================
// 2. WALLPAPER ANIMATIONS
// ==========================================
let wallpaperAnimationId = null;

function initWallpaper() {
  const canvas = document.getElementById('wallpaper-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  
  window.addEventListener('resize', () => {
    resizeCanvas();
  });
  resizeCanvas();

  // Grid/particles state
  let offset = 0;
  
  // Matrix rain columns
  const fontSize = 14;
  let columns = Math.floor(canvas.width / fontSize) + 1;
  let rainDrops = [];
  
  function reinitMatrix() {
    columns = Math.floor(canvas.width / fontSize) + 1;
    rainDrops = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * -100;
    }
  }
  reinitMatrix();
  window.addEventListener('resize', reinitMatrix);

  // Synthwave horizontal lines scroll
  let synthwaveLines = [];
  for (let i = 0; i < 20; i++) {
    synthwaveLines.push(i * 30);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (OS.activeTheme === 'classic') {
      // Draw grid pattern (Scrolling Cyber Grid)
      ctx.strokeStyle = 'rgba(58, 75, 124, 0.15)';
      ctx.lineWidth = 1;
      
      const gridGap = 40;
      offset = (offset + 0.5) % gridGap;
      
      // Vertical grid lines
      for (let x = offset; x < canvas.width; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let y = offset; y < canvas.height; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw ambient dots
      ctx.fillStyle = 'rgba(95, 116, 160, 0.2)';
      for (let x = gridGap; x < canvas.width; x += gridGap) {
        for (let y = gridGap; y < canvas.height; y += gridGap) {
          if ((x + y) % 3 === 0) {
            ctx.beginPath();
            ctx.arc(x + offset, y + offset, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

    } else if (OS.activeTheme === 'matrix') {
      // Draw Matrix Rain
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(0, 255, 65, 0.35)'; // Glowy green
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        // Random character
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i] += 0.8;
      }

    } else if (OS.activeTheme === 'synthwave') {
      // Draw Synthwave Sunset & Grid
      const horizonY = canvas.height * 0.6;
      
      // Draw Neon Sunset Sun
      const sunRadius = Math.min(canvas.width, canvas.height) * 0.25;
      const sunX = canvas.width / 2;
      const sunY = horizonY;
      
      // Gradient for sun
      const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY);
      sunGrad.addColorStop(0, '#ffff00');
      sunGrad.addColorStop(1, '#ff007f');
      
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, Math.PI, 0);
      ctx.fill();
      
      // Horizontal bands in sun (synthwave effect)
      ctx.fillStyle = '#0a0f1d';
      let bandWidth = 4;
      for (let y = sunY - sunRadius; y < sunY; y += 18) {
        const relativeHeight = (y - (sunY - sunRadius)) / sunRadius;
        bandWidth = 2 + relativeHeight * 8; // bands get wider lower down
        ctx.fillRect(sunX - sunRadius - 10, y, sunRadius * 2 + 20, bandWidth);
      }

      // Draw Grid below horizon (perspective lines)
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
      ctx.lineWidth = 2;
      
      // Horizontal perspective grid lines
      offset = (offset + 1) % 40;
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.3)';
      for (let i = 0; i < canvas.height - horizonY; i += 25) {
        const y = horizonY + i + (offset * (i / (canvas.height - horizonY)));
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical perspective perspective lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      const linesCount = 20;
      const step = canvas.width / linesCount;
      for (let i = -5; i <= linesCount + 5; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, horizonY);
        // compute projected position at bottom
        const bottomX = i * step;
        ctx.lineTo(bottomX, canvas.height);
        ctx.stroke();
      }
    }

    wallpaperAnimationId = requestAnimationFrame(animate);
  }
  
  if (wallpaperAnimationId) cancelAnimationFrame(wallpaperAnimationId);
  animate();
}

// ==========================================
// 3. WINDOW MANAGER CORE
// ==========================================
function createWindow(appId, customTitle = null) {
  // If window already open, focus/restore it
  if (OS.windows[appId]) {
    const win = OS.windows[appId];
    if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
      win.style.display = 'flex';
      const taskItem = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
      if (taskItem) taskItem.classList.add('active');
    }
    focusWindow(appId);
    return;
  }

  const appInfo = APP_REGISTRY[appId];
  if (!appInfo) return;

  const title = customTitle || appInfo.title;
  
  // Create Window Element
  const win = document.createElement('div');
  win.className = 'window';
  win.id = `win-${appId}`;
  win.setAttribute('data-app', appId);
  
  // Stagger window initial coordinates
  const openCount = Object.keys(OS.windows).length;
  const startX = 50 + (openCount * 25) % 150;
  const startY = 60 + (openCount * 25) % 150;
  
  win.style.width = `${appInfo.width}px`;
  win.style.height = `${appInfo.height}px`;
  win.style.left = `${startX}px`;
  win.style.top = `${startY}px`;

  // Window HTML Shell
  win.innerHTML = `
    <div class="window-header">
      <div class="window-title-container">
        <span class="window-icon">${appInfo.icon}</span>
        <span class="window-title">${title}</span>
      </div>
      <div class="window-controls">
        <button class="win-btn btn-min" title="Minimize">_</button>
        <button class="win-btn btn-max" title="Maximize">🗖</button>
        <button class="win-btn btn-close" title="Close">X</button>
      </div>
    </div>
    <div class="window-body" tabindex="0">
      <div style="display:flex; justify-content:center; align-items:center; height:100%; color:var(--os-text-muted);">
        Loading ${title}...
      </div>
    </div>
    <!-- 8 directional resize handles -->
    <div class="resize-handle n"></div>
    <div class="resize-handle s"></div>
    <div class="resize-handle e"></div>
    <div class="resize-handle w"></div>
    <div class="resize-handle ne"></div>
    <div class="resize-handle nw"></div>
    <div class="resize-handle se"></div>
    <div class="resize-handle sw"></div>
  `;

  // Append window to desktop workspace
  document.getElementById('desktop-workspace').appendChild(win);
  OS.windows[appId] = win;
  focusWindow(appId);

  // Setup Event Listeners
  setupWindowInteraction(appId, win);

  // Register in taskbar
  addTaskbarItem(appId, title, appInfo.icon);

  // Load app logic asynchronously
  loadAppContent(appId, win.querySelector('.window-body'));
}

function focusWindow(appId) {
  const targetWin = OS.windows[appId];
  if (!targetWin) return;

  // Remove focused class from all windows
  Object.values(OS.windows).forEach(win => {
    win.classList.remove('focused');
  });

  // Add focused class and update z-index
  targetWin.classList.add('focused');
  OS.zIndexCounter++;
  targetWin.style.zIndex = OS.zIndexCounter;

  // Make taskbar item active
  document.querySelectorAll('.taskbar-item').forEach(item => {
    if (item.getAttribute('data-app') === appId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Focus the window body so keyboard listeners trigger
  const body = targetWin.querySelector('.window-body');
  if (body) body.focus();
}

function minimizeWindow(appId) {
  const win = OS.windows[appId];
  if (!win) return;

  win.classList.add('minimized');
  win.style.display = 'none';

  const taskItem = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
  if (taskItem) taskItem.classList.remove('active');
}

function toggleMaximizeWindow(appId) {
  const win = OS.windows[appId];
  if (!win) return;

  if (win.classList.contains('maximized')) {
    // Restore
    win.classList.remove('maximized');
    win.style.top = win.getAttribute('data-prev-top');
    win.style.left = win.getAttribute('data-prev-left');
    win.style.width = win.getAttribute('data-prev-width');
    win.style.height = win.getAttribute('data-prev-height');
    win.querySelector('.btn-max').textContent = '🗖';
  } else {
    // Maximize
    win.setAttribute('data-prev-top', win.style.top);
    win.setAttribute('data-prev-left', win.style.left);
    win.setAttribute('data-prev-width', win.style.width);
    win.setAttribute('data-prev-height', win.style.height);

    win.classList.add('maximized');
    win.style.top = '0';
    win.style.left = '0';
    win.style.width = '100%';
    win.style.height = '100%';
    win.querySelector('.btn-max').textContent = '❐';
  }
}

function closeWindow(appId) {
  const win = OS.windows[appId];
  if (!win) return;

  // Call app destroy cleanup if available
  if (OS.activeAppStates[appId] && typeof OS.activeAppStates[appId].destroy === 'function') {
    try {
      OS.activeAppStates[appId].destroy();
    } catch (e) {
      console.error(`Error destroying app ${appId}:`, e);
    }
  }
  delete OS.activeAppStates[appId];

  // Remove elements
  win.remove();
  delete OS.windows[appId];

  // Remove taskbar entry
  removeTaskbarItem(appId);

  // Focus next window in stack
  const remainingApps = Object.keys(OS.windows);
  if (remainingApps.length > 0) {
    // Find window with highest z-index
    let highestZ = 0;
    let nextAppToFocus = null;
    remainingApps.forEach(id => {
      const w = OS.windows[id];
      const z = parseInt(w.style.zIndex) || 0;
      if (z > highestZ && !w.classList.contains('minimized')) {
        highestZ = z;
        nextAppToFocus = id;
      }
    });
    if (nextAppToFocus) focusWindow(nextAppToFocus);
  }
}

// ==========================================
// 4. INTERACTIVE HANDLERS (DRAG & RESIZE)
// ==========================================
function setupWindowInteraction(appId, win) {
  const header = win.querySelector('.window-header');
  
  // Close / Min / Max button listeners
  win.querySelector('.btn-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeWindow(appId);
  });
  
  win.querySelector('.btn-min').addEventListener('click', (e) => {
    e.stopPropagation();
    minimizeWindow(appId);
  });

  win.querySelector('.btn-max').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMaximizeWindow(appId);
  });

  // Focus click
  win.addEventListener('mousedown', () => {
    focusWindow(appId);
  });

  // Drag logic
  header.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-btn') || win.classList.contains('maximized')) return;
    
    e.preventDefault();
    focusWindow(appId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const winLeft = parseInt(win.style.left) || 0;
    const winTop = parseInt(win.style.top) || 0;
    
    function onMouseMove(moveEvent) {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      let newLeft = winLeft + dx;
      let newTop = winTop + dy;
      
      // Boundary safety check (against status bar)
      if (newTop < 24) newTop = 24;
      
      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    }
    
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Double click header to maximize
  header.addEventListener('dblclick', (e) => {
    if (e.target.classList.contains('win-btn')) return;
    toggleMaximizeWindow(appId);
  });

  // Resize logic
  const handles = win.querySelectorAll('.resize-handle');
  handles.forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      focusWindow(appId);

      const handleClass = Array.from(handle.classList).find(c => c !== 'resize-handle');
      
      const startX = e.clientX;
      const startY = e.clientY;
      
      const rect = win.getBoundingClientRect();
      const winWidth = rect.width;
      const winHeight = rect.height;
      const winLeft = rect.left;
      const winTop = rect.top;

      function onMouseMove(moveEvent) {
        if (win.classList.contains('maximized')) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let w = winWidth;
        let h = winHeight;
        let l = winLeft;
        let t = winTop;

        const minW = 280;
        const minH = 180;

        // horizontal directions
        if (handleClass.includes('e')) {
          w = Math.max(minW, winWidth + dx);
        }
        if (handleClass.includes('w')) {
          const newW = winWidth - dx;
          if (newW >= minW) {
            w = newW;
            l = winLeft + dx;
          }
        }
        // vertical directions
        if (handleClass.includes('s')) {
          h = Math.max(minH, winHeight + dy);
        }
        if (handleClass.includes('n')) {
          const newH = winHeight - dy;
          if (newH >= minH) {
            h = newH;
            t = winTop + dy;
            if (t < 24) t = 24; // Status bar top limit
          }
        }

        win.style.width = `${w}px`;
        win.style.height = `${h}px`;
        win.style.left = `${l}px`;
        win.style.top = `${t}px`;
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
}

// ==========================================
// 5. ASYNC APPLICATION LIFECYCLE
// ==========================================
async function loadAppContent(appId, container) {
  try {
    // If not registered yet, fetch script
    if (!OS.apps[appId]) {
      const module = await import(`./apps/${appId}.js`);
      if (module.default) {
        OS.apps[appId] = module.default;
      } else {
        throw new Error(`Default export not found in script: /scripts/apps/${appId}.js`);
      }
    }

    // Clear loading text and initialize app
    container.innerHTML = '';
    const state = OS.apps[appId](container, OS.windows[appId]);
    if (state) {
      OS.activeAppStates[appId] = state;
    }
  } catch (error) {
    console.error(`Failed to load app ${appId}:`, error);
    container.innerHTML = `
      <div style="padding:20px; color:#ff3333; font-family:monospace;">
        <h3>🛑 CRITICAL ERROR 0x0F</h3>
        <p style="margin-top:10px;">Failed to initialize executable dynamic library ${appId}.dll.</p>
        <p style="margin-top:10px; font-size:12px; color:var(--os-text-muted);">${error.message}</p>
      </div>
    `;
  }
}

// ==========================================
// 6. TASKBAR & START MENU MANAGEMENT
// ==========================================
function addTaskbarItem(appId, title, icon) {
  const container = document.getElementById('taskbar-items-container');
  const item = document.createElement('div');
  item.className = 'taskbar-item active';
  item.setAttribute('data-app', appId);
  item.innerHTML = `<span>${icon}</span> ${title}`;
  
  item.addEventListener('click', () => {
    const win = OS.windows[appId];
    if (!win) return;

    if (win.style.display === 'none' || win.classList.contains('minimized')) {
      // Restore
      win.classList.remove('minimized');
      win.style.display = 'flex';
      focusWindow(appId);
    } else if (win.classList.contains('focused')) {
      // Toggle minimize if already focused
      minimizeWindow(appId);
    } else {
      // Focus if visible but not focused
      focusWindow(appId);
    }
  });

  container.appendChild(item);
}

function removeTaskbarItem(appId) {
  const item = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
  if (item) item.remove();
}

function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  const btn = document.getElementById('start-button');
  const isActive = menu.classList.toggle('active');
  btn.classList.toggle('active', isActive);
}

function closeStartMenu() {
  const menu = document.getElementById('start-menu');
  const btn = document.getElementById('start-button');
  menu.classList.remove('active');
  btn.classList.remove('active');
}

// ==========================================
// 7. TOAST NOTIFICATIONS SYSTEM
// ==========================================
function showNotification(title, message) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = `
    <div class="notification-toast-header">${title}</div>
    <div>${message}</div>
  `;

  container.appendChild(toast);
  
  // Slide in
  setTimeout(() => {
    toast.classList.add('show');
    // Play subtle beep sound if enabled
    playBeepSound();
  }, 100);

  // Fade out and remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4500);
}

// Simple audio effect for system beeps
function playBeepSound() {
  if (window.AudioContext || window.webkitAudioContext) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime); // 800Hz beep
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  }
}

// ==========================================
// 8. CONTEXT MENU & THEMES
// ==========================================
function initContextMenus() {
  const desktop = document.getElementById('desktop-workspace');
  const cm = document.getElementById('context-menu');

  desktop.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (e.target !== desktop && !e.target.classList.contains('icon-grid') && e.target.id !== 'wallpaper-canvas') {
      return; // Only open on raw desktop surface
    }
    
    cm.style.left = `${e.clientX}px`;
    cm.style.top = `${e.clientY}px`;
    cm.style.display = 'flex';
  });

  // Hide context menu on left click anywhere
  document.addEventListener('click', (e) => {
    if (!cm.contains(e.target)) {
      cm.style.display = 'none';
    }
  });

  // Action listeners
  document.getElementById('cm-refresh').addEventListener('click', () => {
    cm.style.display = 'none';
    showNotification('System', 'Desktop workspace refreshed.');
  });

  document.getElementById('cm-terminal').addEventListener('click', () => {
    cm.style.display = 'none';
    createWindow('terminal');
  });

  document.getElementById('cm-notepad').addEventListener('click', () => {
    cm.style.display = 'none';
    createWindow('notepad');
  });

  document.getElementById('cm-reboot').addEventListener('click', () => {
    cm.style.display = 'none';
    rebootSystem();
  });

  document.getElementById('start-menu-reboot').addEventListener('click', () => {
    closeStartMenu();
    rebootSystem();
  });

  // Theme switches
  const desktopEnv = document.getElementById('desktop-environment');
  
  function applyTheme(themeName) {
    OS.activeTheme = themeName;
    desktopEnv.className = ''; // Reset
    
    if (themeName !== 'classic') {
      desktopEnv.classList.add(`${themeName}-theme`);
    }
    
    showNotification('Display settings', `Wallpaper theme changed to ${themeName.toUpperCase()}.`);
    initWallpaper(); // Redraw grid style
  }

  document.getElementById('theme-classic').addEventListener('click', () => {
    cm.style.display = 'none';
    applyTheme('classic');
  });

  document.getElementById('theme-matrix').addEventListener('click', () => {
    cm.style.display = 'none';
    applyTheme('matrix');
  });

  document.getElementById('theme-synthwave').addEventListener('click', () => {
    cm.style.display = 'none';
    applyTheme('synthwave');
  });
}

function rebootSystem() {
  sessionStorage.removeItem('os_booted');
  window.location.reload();
}

// ==========================================
// 9. SYSTEM INITIALIZER (MAIN ENTRY)
// ==========================================
function initOS() {
  // Setup clock ticking
  const clock = document.getElementById('tray-clock');
  setInterval(() => {
    const d = new Date();
    clock.textContent = d.toTimeString().split(' ')[0];
  }, 1000);

  // Setup desktop icon double clicks
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    // Desktop double-click to open apps
    icon.addEventListener('dblclick', () => {
      const appId = icon.getAttribute('data-app');
      createWindow(appId);
    });
    
    // Desktop single-click selection
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });
  });

  // Remove icon selection when clicking desktop
  document.getElementById('desktop-workspace').addEventListener('click', () => {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
  });

  // Start menu items click
  document.querySelectorAll('.start-menu-item').forEach(item => {
    const appId = item.getAttribute('data-app');
    if (appId) {
      item.addEventListener('click', () => {
        closeStartMenu();
        createWindow(appId);
      });
    }
  });

  // Start menu trigger button click
  document.getElementById('start-button').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });

  // Close start menu when clicking on desktop
  document.addEventListener('click', (e) => {
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.getElementById('start-button');
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
      closeStartMenu();
    }
  });

  // Volume indicator click
  document.getElementById('volume-indicator').addEventListener('click', () => {
    showNotification('System Audio', 'BEEP synthesizer is initialized and operational.');
  });

  // Scanline switch trigger
  document.getElementById('scanline-switch').addEventListener('click', () => {
    const crt = document.querySelector('.crt-overlay');
    const isVisible = crt.style.display !== 'none';
    crt.style.display = isVisible ? 'none' : 'block';
    showNotification('Display settings', `CRT overlay scanlines turned ${isVisible ? 'OFF' : 'ON'}.`);
  });

  // Initialize Wallpaper
  initWallpaper();

  // Initialize Context Menus
  initContextMenus();

  // Toast standard welcome toast
  setTimeout(() => {
    showNotification('Boot Successful', 'Welcome to Portfolio OS v2.0. Double click icons to explore!');
  }, 1000);

  // Auto-open terminal on startup to prompt interaction
  setTimeout(() => {
    createWindow('terminal');
  }, 2000);
}

// Register boot skipping for Skip instructions
document.getElementById('boot-screen').addEventListener('click', () => {
  OS.bootSkipped = true;
  completeBoot();
});

// Run bios boot sequence on load
window.addEventListener('load', () => {
  initBootSequence();
});
