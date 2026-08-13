// Projects Catalog Application Plugin

const PROJECTS_DATA = [
  {
    title: 'AI Agent Platform',
    category: 'ai',
    desc: 'An orchestration framework for multi-agent systems. Executes autonomous workflows, task delegation, and vector-backed memory search using LLMs.',
    tags: ['TypeScript', 'Node.js', 'LLMs', 'VectorDB'],
    github: 'https://github.com/AyushRawat/ai-agent-platform',
    demo: 'https://github.com/AyushRawat/ai-agent-platform'
  },
  {
    title: 'Crypto WebSocket Tracker',
    category: 'web',
    desc: 'Real-time cryptocurrency statistics platform using WebSockets for streaming tick-by-tick order book data and rendering interactive D3.js charts.',
    tags: ['React', 'WebSocket', 'D3.js', 'TailwindCSS'],
    github: 'https://github.com/AyushRawat/crypto-tracker',
    demo: 'https://github.com/AyushRawat/crypto-tracker'
  },
  {
    title: 'WebOS Desktop Environment',
    category: 'web',
    desc: 'Interactive retro browser operating system. Supports window draggable manager, chiptune synth loops, scanline CRT screen overlays, and retro mini-games.',
    tags: ['Astro', 'Vanilla JS', 'Canvas', 'Web Audio'],
    github: 'https://github.com/AyushRawat/todo-project',
    demo: '/'
  },
  {
    title: 'Compiler Shell',
    category: 'cli',
    desc: 'A custom command-line compiler driver written in C++ for lexical analysis and AST parsing of simplified C-like language syntax trees.',
    tags: ['C++', 'Lex/Yacc', 'Compilers', 'CLI'],
    github: 'https://github.com/AyushRawat/compiler-shell',
    demo: 'https://github.com/AyushRawat/compiler-shell'
  }
];

export default function(container, win) {
  let activeFilter = 'all';

  function render() {
    const filtered = PROJECTS_DATA.filter(p => activeFilter === 'all' || p.category === activeFilter);

    container.innerHTML = `
      <div class="projects-container">
        <div class="projects-filter">
          <button class="projects-filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">ALL.EXE</button>
          <button class="projects-filter-btn ${activeFilter === 'web' ? 'active' : ''}" data-filter="web">WEB_APPS.SYS</button>
          <button class="projects-filter-btn ${activeFilter === 'ai' ? 'active' : ''}" data-filter="ai">AI_AGENTS.DLL</button>
          <button class="projects-filter-btn ${activeFilter === 'cli' ? 'active' : ''}" data-filter="cli">CLI_TOOLS.COM</button>
        </div>
        <div class="projects-grid">
          ${filtered.map(p => `
            <div class="project-card">
              <div class="project-title">❖ ${p.title}</div>
              <div class="project-desc">${p.desc}</div>
              <div class="project-tags">
                ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
              </div>
              <div class="project-links">
                <a href="${p.github}" target="_blank" class="project-link">Source Code</a>
                ${p.demo ? `<a href="${p.demo}" target="_blank" class="project-link">Launch Demo</a>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add filter button event listeners
    container.querySelectorAll('.projects-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter');
        render();
      });
    });
  }

  // Initial render
  render();

  return {
    destroy: () => {}
  };
}
