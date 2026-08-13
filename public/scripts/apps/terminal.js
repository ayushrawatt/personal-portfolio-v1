// Terminal Application Plugin

const VIRTUAL_FS = {
  '/': {
    'About': { isDir: true },
    'Projects': { isDir: true },
    'Games': { isDir: true },
    'System': { isDir: true }
  },
  '/About': {
    'bio.txt': { isDir: false, content: 'Ayush Rawat is a Full Stack Engineer based in New Delhi, India.\nSpecializing in frontend architecture, node, python, cloud and web APIs.' },
    'contact.txt': { isDir: false, content: 'Email: ayush.rawat@example.com\nGitHub: github.com/AyushRawat\nLinkedIn: linkedin.com/in/AyushRawat' }
  },
  '/Projects': {
    'ai_agent.exe': { isDir: false, content: 'Executable program. Type "open projects" to view the project catalog.' },
    'crypto_dashboard.txt': { isDir: false, content: 'Real-time crypto stats platform with WebSockets and D3 charts.' },
    'todo_os.txt': { isDir: false, content: 'Mini WebOS-inspired desktop for organizing tasks in a browser.' }
  },
  '/Games': {
    'Tetris.exe': { isDir: false, content: 'Double-click icon or run "open tetris" to play Tetris.' },
    'Snake.exe': { isDir: false, content: 'Double-click icon or run "open snake" to play Snake.' },
    'Minesweeper.exe': { isDir: false, content: 'Double-click icon or run "open minesweeper" to play Minesweeper.' }
  },
  '/System': {
    'kernel.dll': { isDir: false, content: 'PORTFOLIO OS v2.0 Kernel Engine' },
    'skills.log': { isDir: false, content: 'Languages: JavaScript, TypeScript, HTML/CSS, Python, SQL, C++\nFrameworks: React, Astro, Next.js, Express, FastAPI\nTools: AWS, Docker, Git, Linux, Web Audio API' }
  }
};

export default function(container, win) {
  let currentPath = '/';
  let commandHistory = [];
  let historyIdx = -1;

  container.innerHTML = `
    <div class="terminal-container">
      <div class="terminal-history"></div>
      <div class="terminal-prompt-container">
        <span class="terminal-prompt">visitor@portfolio:${currentPath}$</span>
        <input type="text" class="terminal-input" autofocus autocomplete="off" spellcheck="false">
      </div>
    </div>
  `;

  const historyDiv = container.querySelector('.terminal-history');
  const inputEl = container.querySelector('.terminal-input');
  const promptSpan = container.querySelector('.terminal-prompt');

  // Print welcome lines on start
  writeLine('Welcome to Portfolio OS v2.0 Terminal Prompt.', 'system');
  writeLine('Type "help" to see available executable commands.', 'warning');
  writeLine('', '');

  // Print a line in the terminal
  function writeLine(text, type = '') {
    const p = document.createElement('div');
    p.className = `terminal-line ${type}`;
    p.textContent = text;
    historyDiv.appendChild(p);
    historyDiv.scrollTop = historyDiv.scrollHeight;
  }

  // Handle autocompletion (Tab)
  const COMMANDS = ['help', 'whoami', 'ls', 'cat', 'cd', 'clear', 'echo', 'date', 'uptime', 'neofetch', 'skills', 'projects', 'contact', 'open', 'sudo', 'matrix', 'hack'];
  
  function getAutocompleteMatches(typed) {
    const args = typed.split(' ');
    const cmd = args[0];
    
    // Complete commands
    if (args.length === 1) {
      return COMMANDS.filter(c => c.startsWith(cmd));
    }
    
    // Complete files/dirs if command takes path arguments
    if (args.length === 2 && (cmd === 'cd' || cmd === 'cat')) {
      const target = args[1];
      const contents = VIRTUAL_FS[currentPath] || {};
      return Object.keys(contents).filter(f => f.startsWith(target));
    }
    return [];
  }

  // Handle execution
  function executeCommand(rawInput) {
    const input = rawInput.trim();
    if (!input) return;

    commandHistory.push(input);
    historyIdx = commandHistory.length;

    writeLine(`visitor@portfolio:${currentPath}$ ${input}`, 'command');

    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    switch(cmd) {
      case 'help':
        writeLine('SYSTEM UTILITY COMMANDS:');
        writeLine('  help       - Show help listing');
        writeLine('  whoami     - Print visitor character record');
        writeLine('  neofetch   - Display system logo and specifications');
        writeLine('  uptime     - Display system execution session duration');
        writeLine('  clear      - Clear terminal console');
        writeLine('  date       - Output date and time logs');
        writeLine('  echo [str] - Echo argument text');
        writeLine('FILESYSTEM COMMANDS:');
        writeLine('  ls         - List directories and elements');
        writeLine('  cd [dir]   - Change directory pathway');
        writeLine('  cat [file] - Read plaintext content of files');
        writeLine('PORTFOLIO UTILITIES:');
        writeLine('  skills     - Render skill monitor details');
        writeLine('  projects   - Render projects list');
        writeLine('  contact    - Open social and communications panels');
        writeLine('  open [app] - Boot applications (about, filemanager, projects, skills, notepad, tetris, snake, minesweeper, music)');
        writeLine('EASTER EGGS:');
        writeLine('  matrix     - Change workspace background to Matrix rain');
        writeLine('  hack       - Initiate fake network decrypt process');
        writeLine('  sudo rm -rf / - WARNING: CRITICAL SYSTEM WIPE');
        break;

      case 'whoami':
        writeLine('User: visitor_guest');
        writeLine('Permissions: Read-Only (Non-Root)');
        writeLine('Address: Web Session Port 80');
        break;

      case 'clear':
        historyDiv.innerHTML = '';
        break;

      case 'date':
        writeLine(new Date().toString(), 'info');
        break;

      case 'uptime': {
        const diff = Date.now() - performance.timeOrigin;
        const seconds = Math.floor(diff / 1000) % 60;
        const minutes = Math.floor(diff / (1000 * 60)) % 60;
        writeLine(`Uptime: ${minutes}m ${seconds}s`, 'info');
        break;
      }

      case 'neofetch':
        writeLine('  ______   ______   ______  ', 'system');
        writeLine(' /\\  __ \\ /\\  ___\\ /\\  ___\\ ', 'system');
        writeLine(' \\ \\  __ \\\\ \\___  \\\\ \\___  \\', 'system');
        writeLine('  \\ \\_\\ \\_\\\\/\\_____\\\\/\\_____\\', 'system');
        writeLine('   \\/_/\\/_/ \\/_____/ \\/_____/', 'system');
        writeLine('-----------------------------');
        writeLine('OS: Portfolio OS v2.0 (Gemini Edition)');
        writeLine('Host: Intel Web Core Processor');
        writeLine('Shell: JavaScript ES6 Terminal Shell');
        writeLine('Resolution: ' + window.innerWidth + 'x' + window.innerHeight);
        writeLine('Theme: ' + (window.OS ? window.OS.activeTheme.toUpperCase() : 'CLASSIC'));
        writeLine('Processor: Gemini 3.5 Flash Core');
        break;

      case 'echo':
        writeLine(arg, 'info');
        break;

      case 'ls': {
        const contents = VIRTUAL_FS[currentPath];
        if (!contents) {
          writeLine('Error: Directory not found in inode index.', 'error');
        } else {
          const names = Object.entries(contents).map(([name, info]) => {
            return info.isDir ? `${name}/` : name;
          });
          writeLine(names.length > 0 ? names.join('   ') : '(Empty Directory)', 'info');
        }
        break;
      }

      case 'cd': {
        if (!arg || arg === '.' || arg === '/') {
          currentPath = '/';
        } else if (arg === '..') {
          currentPath = '/'; // Flat tree simplicity
        } else {
          // Normalize paths
          let target = arg;
          if (target.startsWith('/')) target = target.slice(1);
          
          const fullPath = `/${target}`;
          if (VIRTUAL_FS[fullPath]) {
            currentPath = fullPath;
          } else {
            // Check folders under /
            const rootDirs = VIRTUAL_FS['/'];
            if (currentPath === '/' && rootDirs[target] && rootDirs[target].isDir) {
              currentPath = `/${target}`;
            } else {
              writeLine(`cd: no such file or directory: ${arg}`, 'error');
            }
          }
        }
        promptSpan.textContent = `visitor@portfolio:${currentPath}$`;
        break;
      }

      case 'cat': {
        if (!arg) {
          writeLine('Usage: cat [filename]', 'error');
          break;
        }
        const contents = VIRTUAL_FS[currentPath];
        if (contents && contents[arg] && !contents[arg].isDir) {
          writeLine(contents[arg].content, 'info');
        } else {
          // Try looking directly in the path if they typed e.g. cat About/bio.txt
          let fileContents = null;
          if (arg.includes('/')) {
            const pathParts = arg.split('/');
            const folder = '/' + pathParts[0];
            const file = pathParts[1];
            if (VIRTUAL_FS[folder] && VIRTUAL_FS[folder][file]) {
              fileContents = VIRTUAL_FS[folder][file].content;
            }
          }
          if (fileContents) {
            writeLine(fileContents, 'info');
          } else {
            writeLine(`cat: ${arg}: No such file or file type is directory`, 'error');
          }
        }
        break;
      }

      case 'skills':
        writeLine('SKILLS RESOURCE REPORT:');
        writeLine('  * Languages: JS/TS, Python, HTML/CSS, SQL, Shell Scripting');
        writeLine('  * Frameworks: React, Next.js, Astro, Vue, Express, Django');
        writeLine('  * Developer Tools: Git, Docker, Kubernetes, AWS, Serverless');
        writeLine('  * Databases: PostgreSQL, MongoDB, Redis, MySQL');
        writeLine('Type "open skills" to boot visual radar chart.');
        break;

      case 'projects':
        writeLine('PROJECT CATALOG:');
        writeLine('  - AI Agent Platform: Multi-agent orchestrator written in TypeScript.');
        writeLine('  - WebOS Desktop: Retro OS style online interface.');
        writeLine('  - Crypto Dashboard: Live websocket chart visualization tool.');
        writeLine('Type "open projects" to load portfolio showcase window.');
        break;

      case 'contact':
        writeLine('TRANSMIT DIRECTIVES:');
        writeLine('  GitHub: https://github.com/AyushRawat');
        writeLine('  LinkedIn: https://linkedin.com/in/AyushRawat');
        writeLine('  Email: ayush.rawat@example.com');
        break;

      case 'open':
        if (!arg) {
          writeLine('Usage: open [about | terminal | filemanager | projects | skills | notepad | tetris | snake | minesweeper | music]', 'error');
        } else {
          const app = arg.toLowerCase();
          if (['about', 'terminal', 'filemanager', 'projects', 'skills', 'notepad', 'tetris', 'snake', 'minesweeper', 'music'].includes(app)) {
            if (window.OS && typeof window.OS.apps !== 'undefined') {
              window.createWindow(app);
              writeLine(`Opening application executable ${app}.exe...`, 'success');
            } else {
              writeLine('System error: DWM not found.', 'error');
            }
          } else {
            writeLine(`open: unknown executable binary: ${arg}.exe`, 'error');
          }
        }
        break;

      case 'matrix':
        if (window.OS) {
          document.getElementById('theme-matrix').click();
          writeLine('Applying Matrix Theme. System initialized.', 'success');
        } else {
          writeLine('Kernel theme hook unavailable.', 'error');
        }
        break;

      case 'hack':
        startFakeHacking();
        break;

      case 'sudo':
        if (arg === 'rm -rf /') {
          triggerFakeBSOD();
        } else {
          writeLine('Permission Denied: guest user is not in the sudoers file. This incident will be reported.', 'error');
        }
        break;

      default:
        writeLine(`bash: command not found: ${cmd}. Try typing "help" for a list of directives.`, 'error');
    }
  }

  // Fake hacking animation
  function startFakeHacking() {
    inputEl.disabled = true;
    writeLine('CONNECTING TO REMOTE GATEWAY ...', 'warning');
    
    let lineIdx = 0;
    const hackLines = [
      '>> Handshake protocol established (IPv4: 198.162.24.120)',
      '>> Sending decrypt vectors ... [0x43FA, 0x12FF, 0x88BC]',
      '>> Accessing server root logs ... SUCCESS',
      '>> Downloading private repository assets ...',
      '████████████████████████ 100% OK',
      '>> Fetching developer credential tokens ...',
      '>> DECRYPTED CREDENTIALS FOUND:',
      '   User: Ayush Rawat',
      '   Key ID: SHA-256-420A11',
      '   Privilege level: SYSTEM AUTHORIZED',
      '>> PORTFOLIO INJECTED SUCCESSFULLY. SYSTEM ACCESS GRANTED.'
    ];

    const hackInterval = setInterval(() => {
      if (lineIdx < hackLines.length) {
        writeLine(hackLines[lineIdx], 'success');
        lineIdx++;
      } else {
        clearInterval(hackInterval);
        inputEl.disabled = false;
        inputEl.focus();
        writeLine('', '');
      }
    }, 400);
  }

  // Easter Egg: Fake BSOD
  function triggerFakeBSOD() {
    inputEl.disabled = true;
    writeLine('WIPING SYSTEM VOLUMES ...', 'error');
    writeLine('DELETING SYSTEM DIRECTORY C:\\System ...', 'error');
    writeLine('DELETING FILESYSTEM TABLE ...', 'error');
    writeLine('FATAL STORAGE READ FAILURE.', 'error');

    setTimeout(() => {
      // Create BSOD screen overlay
      const bsod = document.createElement('div');
      bsod.style.position = 'fixed';
      bsod.style.top = '0';
      bsod.style.left = '0';
      bsod.style.width = '100vw';
      bsod.style.height = '100vh';
      bsod.style.backgroundColor = '#0000aa';
      bsod.style.color = '#ffffff';
      bsod.style.fontFamily = 'monospace';
      bsod.style.fontSize = '16px';
      bsod.style.padding = '40px';
      bsod.style.zIndex = '9999999';
      bsod.style.lineHeight = '1.6';
      
      bsod.innerHTML = `
        <div style="background-color:#ffffff; color:#0000aa; display:inline-block; padding: 0 10px; font-weight:bold; margin-bottom:20px;">SYSTEM_HALT</div>
        <p>A fatal exception 0E has occurred at 0028:C0011A3D in VXD VMM(01) + 00010A3D.</p>
        <p>The system has been halted because of command authorization: SUDO_RM_RF_SLASH.</p>
        <p>This was reported as a user-initiated wipe operation of C:\\ drive sector index.</p>
        <br>
        <p>* Press any key to terminate your current session (this will close your browser tab).</p>
        <p>* Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved information in all applications.</p>
        <br>
        <p style="color:#ffff00;">SYSTEM REBOOTING IN <span id="bsod-countdown">5</span> SECONDS...</p>
      `;

      document.body.appendChild(bsod);

      let count = 5;
      const countdown = setInterval(() => {
        count--;
        const el = document.getElementById('bsod-countdown');
        if (el) el.textContent = count;
        if (count <= 0) {
          clearInterval(countdown);
          sessionStorage.removeItem('os_booted');
          window.location.reload();
        }
      }, 1000);
    }, 1200);
  }

  // Key Event Listeners
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = inputEl.value;
      inputEl.value = '';
      executeCommand(val);
    }
    
    // Up Arrow (history recall)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIdx > 0) {
        historyIdx--;
        inputEl.value = commandHistory[historyIdx];
      }
    }

    // Down Arrow (history recall)
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < commandHistory.length - 1) {
        historyIdx++;
        inputEl.value = commandHistory[historyIdx];
      } else {
        historyIdx = commandHistory.length;
        inputEl.value = '';
      }
    }

    // Tab autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      const val = inputEl.value;
      const matches = getAutocompleteMatches(val);
      if (matches.length === 1) {
        // Only one match, autofill
        const args = val.split(' ');
        if (args.length === 1) {
          inputEl.value = matches[0] + ' ';
        } else {
          args[args.length - 1] = matches[0];
          inputEl.value = args.join(' ') + ' ';
        }
      } else if (matches.length > 1) {
        // Multiple matches, show options
        writeLine(`visitor@portfolio:${currentPath}$ ${val}`, 'command');
        writeLine(matches.join('    '), 'info');
      }
    }
  });

  // Keep focus in terminal window
  win.addEventListener('click', () => {
    inputEl.focus();
  });

  return {
    destroy: () => {}
  };
}
