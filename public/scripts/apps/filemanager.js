// File Explorer Application Plugin

const FILE_SYSTEM = {
  'C:\\': {
    type: 'dir',
    contents: {
      'About': { type: 'dir' },
      'Projects': { type: 'dir' },
      'Games': { type: 'dir' },
      'System': { type: 'dir' }
    }
  },
  'C:\\About': {
    type: 'dir',
    contents: {
      'bio.txt': { type: 'file', content: 'Ayush Rawat is a Full Stack Engineer based in New Delhi, India.\nSpecializing in frontend architecture, node, python, cloud and web APIs.' },
      'contact.txt': { type: 'file', content: 'Email: ayush.rawat@example.com\nGitHub: github.com/AyushRawat\nLinkedIn: linkedin.com/in/AyushRawat' }
    }
  },
  'C:\\Projects': {
    type: 'dir',
    contents: {
      'ai_agent.exe': { type: 'exe', app: 'projects' },
      'crypto_dashboard.txt': { type: 'file', content: 'Real-time crypto stats platform with WebSockets and D3 charts.' },
      'todo_os.txt': { type: 'file', content: 'Mini WebOS-inspired desktop for organizing tasks in a browser.' }
    }
  },
  'C:\\Games': {
    type: 'dir',
    contents: {
      'Tetris.exe': { type: 'exe', app: 'tetris' },
      'Snake.exe': { type: 'exe', app: 'snake' },
      'Minesweeper.exe': { type: 'exe', app: 'minesweeper' }
    }
  },
  'C:\\System': {
    type: 'dir',
    contents: {
      'kernel.dll': { type: 'dll' },
      'skills.log': { type: 'file', content: 'Languages: JavaScript, TypeScript, HTML/CSS, Python, SQL, C++\nFrameworks: React, Astro, Next.js, Express, FastAPI\nTools: AWS, Docker, Git, Linux, Web Audio API' }
    }
  }
};

export default function(container, win) {
  let currentPath = 'C:\\';
  let historyStack = ['C:\\'];
  let historyIdx = 0;
  let selectedItem = null;

  function render() {
    container.innerHTML = `
      <div class="filemanager-container">
        <div class="filemanager-toolbar">
          <button class="filemanager-btn btn-back" ${historyIdx === 0 ? 'disabled' : ''}>🠔 Back</button>
          <button class="filemanager-btn btn-up" ${currentPath === 'C:\\' ? 'disabled' : ''}>🠕 Up</button>
          <div class="filemanager-path">${currentPath}</div>
        </div>
        <div class="filemanager-workspace"></div>
        <div class="filemanager-statusbar">0 items</div>
      </div>
    `;

    const workspace = container.querySelector('.filemanager-workspace');
    const statusbar = container.querySelector('.filemanager-statusbar');
    
    // Bind buttons
    container.querySelector('.btn-back').addEventListener('click', () => {
      if (historyIdx > 0) {
        historyIdx--;
        currentPath = historyStack[historyIdx];
        render();
      }
    });

    container.querySelector('.btn-up').addEventListener('click', () => {
      if (currentPath !== 'C:\\') {
        currentPath = 'C:\\';
        // Add to history
        if (historyStack[historyIdx] !== currentPath) {
          historyStack = historyStack.slice(0, historyIdx + 1);
          historyStack.push(currentPath);
          historyIdx++;
        }
        render();
      }
    });

    // Load directory items
    const dirInfo = FILE_SYSTEM[currentPath];
    if (!dirInfo || dirInfo.type !== 'dir') return;

    const items = dirInfo.contents;
    const itemKeys = Object.keys(items);
    statusbar.textContent = `${itemKeys.length} object(s)`;

    itemKeys.forEach(name => {
      const item = items[name];
      const itemEl = document.createElement('div');
      itemEl.className = 'filemanager-item';
      
      let icon = '📄';
      if (item.type === 'dir') icon = '📁';
      else if (item.type === 'exe') icon = '⚙️';
      else if (item.type === 'dll') icon = '💾';

      itemEl.innerHTML = `
        <div class="filemanager-item-icon">${icon}</div>
        <div class="filemanager-item-name">${name}</div>
      `;

      // Selection state click
      itemEl.addEventListener('click', (e) => {
        e.stopPropagation();
        workspace.querySelectorAll('.filemanager-item').forEach(el => el.classList.remove('selected'));
        itemEl.classList.add('selected');
        selectedItem = { name, ...item };
        statusbar.textContent = `Selected: ${name}`;
      });

      // Double click to open folder/file
      itemEl.addEventListener('dblclick', () => {
        if (item.type === 'dir') {
          const nextPath = currentPath === 'C:\\' ? `${currentPath}${name}` : `${currentPath}\\${name}`;
          currentPath = nextPath;
          
          // Add to history
          historyStack = historyStack.slice(0, historyIdx + 1);
          historyStack.push(currentPath);
          historyIdx++;
          
          render();
        } else {
          openFile(name, item);
        }
      });

      workspace.appendChild(itemEl);
    });

    // Reset selection when workspace itself clicked
    workspace.addEventListener('click', () => {
      workspace.querySelectorAll('.filemanager-item').forEach(el => el.classList.remove('selected'));
      selectedItem = null;
      statusbar.textContent = `${itemKeys.length} object(s)`;
    });
  }

  function openFile(name, item) {
    if (item.type === 'file') {
      // Open in Notepad
      if (window.OS) {
        window.OS.pendingNotepadFile = {
          name: name,
          content: item.content
        };
        window.createWindow('notepad');
      }
    } else if (item.type === 'exe') {
      // Run Executable
      if (window.OS && item.app) {
        window.createWindow(item.app);
      }
    } else if (item.type === 'dll') {
      if (window.OS && typeof window.OS.windows.terminal !== 'undefined') {
        window.OS.windows.terminal.querySelector('.terminal-history').innerHTML += `\n[System] Access violation: Cannot load module DLL into dynamic runtime directly.\n`;
      }
      alert('Access Violation: DLL modules cannot be run from file explorer directly.');
    }
  }

  // Initial render
  render();

  return {
    destroy: () => {}
  };
}
