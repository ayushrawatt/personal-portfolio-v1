// Skills (Resource Monitor) Application Plugin

const SKILLS_DATA = [
  { name: 'JavaScript / TS', level: 95, category: 'Languages' },
  { name: 'Python / Scripting', level: 80, category: 'Languages' },
  { name: 'React / Next.js', level: 90, category: 'Frontend' },
  { name: 'Astro / CSS', level: 85, category: 'Frontend' },
  { name: 'Node.js / Express', level: 90, category: 'Backend' },
  { name: 'PostgreSQL / NoSQL', level: 80, category: 'Databases' },
  { name: 'AWS Cloud / Deploy', level: 75, category: 'DevOps' },
  { name: 'Docker / Linux', level: 80, category: 'DevOps' }
];

export default function(container, win) {
  container.innerHTML = `
    <div class="skills-container">
      <div style="font-size: 12px; color: var(--os-text-yellow); margin-bottom: 10px;">
        OS CORE MONITOR: ALL HARDWARE SYSTEMS REPORTING OPTIMAL LOAD.
      </div>
      <div class="skills-layout">
        <div class="skills-radar-panel">
          <canvas id="skills-canvas" width="220" height="220"></canvas>
        </div>
        
        <div class="skills-bar-panel">
          ${SKILLS_DATA.map((s, idx) => `
            <div class="skill-bar-item">
              <div class="skill-bar-header">
                <span>[${s.category}] ${s.name}</span>
                <span>${s.level}%</span>
              </div>
              <div class="skill-bar-container">
                <div class="skill-bar-fill" id="skill-fill-${idx}" style="width: 0%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#skills-canvas');
  let animationFrameId = null;

  // Trigger progress bar fill animations
  setTimeout(() => {
    SKILLS_DATA.forEach((s, idx) => {
      const bar = container.querySelector(`#skill-fill-${idx}`);
      if (bar) {
        bar.style.width = `${s.level}%`;
        // Set class color based on level
        if (s.level >= 90) bar.classList.add('high');
        else if (s.level >= 80) bar.classList.add('medium');
        else bar.classList.add('low');
      }
    });
  }, 100);

  // Draw Radar Chart on Canvas
  function drawRadar() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 30;
    
    // Skill Axes
    const axes = ['LANG', 'FRONT', 'BACK', 'DATA', 'DEVOPS'];
    const totalAxes = axes.length;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid rings (concentric polygons)
    const rings = 4;
    ctx.strokeStyle = 'rgba(58, 75, 124, 0.4)';
    ctx.lineWidth = 1;
    
    for (let r = 1; r <= rings; r++) {
      const ringRadius = radius * (r / rings);
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
        const x = cx + ringRadius * Math.cos(angle);
        const y = cy + ringRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      
      // Draw grid ring text indicators
      ctx.fillStyle = 'rgba(95, 116, 160, 0.5)';
      ctx.font = '8px monospace';
      ctx.fillText(String(r * 25), cx - 15, cy - ringRadius + 3);
    }

    // Draw Spokes (axes lines)
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      
      // Draw labels
      ctx.fillStyle = 'var(--os-text-yellow)';
      ctx.font = '10px "Share Tech Mono", monospace';
      const labelX = cx + (radius + 18) * Math.cos(angle) - 15;
      const labelY = cy + (radius + 12) * Math.sin(angle) + 4;
      ctx.fillText(axes[i], labelX, labelY);
    }
    ctx.stroke();

    // Map skills data to categories
    const categoriesMapped = {
      'LANG': (SKILLS_DATA[0].level + SKILLS_DATA[1].level) / 2, // Languages
      'FRONT': (SKILLS_DATA[2].level + SKILLS_DATA[3].level) / 2, // Frontend
      'BACK': SKILLS_DATA[4].level, // Backend
      'DATA': SKILLS_DATA[5].level, // Databases
      'DEVOPS': (SKILLS_DATA[6].level + SKILLS_DATA[7].level) / 2 // DevOps
    };

    // Plot skill points
    ctx.fillStyle = 'rgba(0, 255, 65, 0.25)';
    ctx.strokeStyle = 'var(--os-text-green)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < totalAxes; i++) {
      const name = axes[i];
      const level = categoriesMapped[name] || 50;
      const ringRadius = radius * (level / 100);
      const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
      const x = cx + ringRadius * Math.cos(angle);
      const y = cy + ringRadius * Math.sin(angle);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      // Small plot dot
      ctx.fillStyle = 'var(--os-text-white)';
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.fillStyle = 'rgba(0, 255, 65, 0.25)';
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Double check resize / draw
  drawRadar();
  
  // Refresh loop just to ensure canvas stays clean
  let lastDraw = 0;
  function update(time) {
    if (time - lastDraw > 500) {
      drawRadar();
      lastDraw = time;
    }
    animationFrameId = requestAnimationFrame(update);
  }
  animationFrameId = requestAnimationFrame(update);

  return {
    destroy: () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  };
}
