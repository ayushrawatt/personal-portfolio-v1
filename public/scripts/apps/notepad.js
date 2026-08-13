// Notepad Application Plugin

export default function(container, win) {
  let fileName = 'Untitled.txt';
  let defaultContent = `WELCOME TO NOTEPAD v1.0
------------------------
Write whatever you like here.

SECRET EASTER EGG SYSTEM POEM:
-------------------------------
In phosphor grids of cyber blue,
We build the shells of old and new.
A mouse click here, a keyboard drag,
With every line, a pixel flag.
Antigravity moves, the grid is spun,
A digital web beneath the sun.

Click 'File -> Save' to copy this buffer to clipboard.`;

  // Check if File Manager passed a file to load
  if (window.OS && window.OS.pendingNotepadFile) {
    fileName = window.OS.pendingNotepadFile.name;
    defaultContent = window.OS.pendingNotepadFile.content;
    
    // Clear pending file
    window.OS.pendingNotepadFile = null;
  }

  // Update window title if possible
  if (win) {
    const titleEl = win.querySelector('.window-title');
    if (titleEl) titleEl.textContent = `${fileName} - Notepad`;
  }

  container.innerHTML = `
    <div class="notepad-container">
      <div class="notepad-menu">
        <span class="notepad-menu-item" id="notepad-save">File:Save</span>
        <span>|</span>
        <span class="notepad-menu-item" id="notepad-clear">Edit:Clear</span>
        <span>|</span>
        <span class="notepad-menu-item" id="notepad-about">Help:About</span>
      </div>
      <textarea class="notepad-textarea" spellcheck="false">${defaultContent}</textarea>
    </div>
  `;

  const textarea = container.querySelector('.notepad-textarea');

  // Save to Clipboard action
  container.querySelector('#notepad-save').addEventListener('click', () => {
    const text = textarea.value;
    navigator.clipboard.writeText(text).then(() => {
      if (window.OS && typeof window.OS.windows.terminal !== 'undefined') {
        window.OS.windows.terminal.querySelector('.terminal-history').innerHTML += `\n[Notepad] Document buffer saved to clipboard.\n`;
      }
      alert('File successfully saved/copied to clipboard!');
    });
  });

  // Clear action
  container.querySelector('#notepad-clear').addEventListener('click', () => {
    if (confirm('Clear the notepad editor? Any unsaved edits will be lost.')) {
      textarea.value = '';
    }
  });

  // About action
  container.querySelector('#notepad-about').addEventListener('click', () => {
    alert('Retro Web Notepad v1.0\nCreated as a portfolio component by Ayush Rawat.');
  });

  return {
    destroy: () => {}
  };
}
