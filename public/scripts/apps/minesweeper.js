// Minesweeper Game Application Plugin

export default function(container, win) {
  // HTML layout
  container.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <span>Mines: <span id="mine-count">12</span></span>
        <button class="game-btn" id="minesweeper-reset-btn" style="font-size:16px; padding:2px 8px;">🙂</button>
        <span>Time: <span id="minesweeper-timer">000</span></span>
      </div>
      <div id="minesweeper-board" class="minesweeper-grid"></div>
      <div style="font-size:10px; color:#5f74a0; margin-top:5px; text-align:center;">
        Left Click: Reveal | Right Click: Flag
      </div>
    </div>
  `;

  const boardEl = container.querySelector('#minesweeper-board');
  const mineCountEl = container.querySelector('#mine-count');
  const timerEl = container.querySelector('#minesweeper-timer');
  const resetBtn = container.querySelector('#minesweeper-reset-btn');

  const SIZE = 10;
  const MINE_COUNT = 12;
  
  let grid = [];
  let revealedCount = 0;
  let flaggedCount = 0;
  let gameOver = false;
  let timerInterval = null;
  let timeElapsed = 0;
  let firstClick = true;

  // Board initialization
  function initBoard() {
    grid = [];
    revealedCount = 0;
    flaggedCount = 0;
    gameOver = false;
    timeElapsed = 0;
    firstClick = true;
    
    resetBtn.textContent = '🙂';
    mineCountEl.textContent = MINE_COUNT;
    timerEl.textContent = '000';
    
    if (timerInterval) clearInterval(timerInterval);

    // Build empty grid
    for (let r = 0; r < SIZE; r++) {
      grid[r] = [];
      for (let c = 0; c < SIZE; c++) {
        grid[r][c] = {
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        };
      }
    }

    renderGrid();
  }

  // Place mines (avoiding the first clicked cell for user friendliness)
  function placeMines(startRow, startCol) {
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      
      // Avoid placing mine on starting position or on top of existing mine
      if ((r === startRow && c === startCol) || grid[r][c].isMine) continue;
      
      grid[r][c].isMine = true;
      minesPlaced++;
    }

    // Compute neighbor mine count
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                if (grid[nr][nc].isMine) count++;
              }
            }
          }
          grid[r][c].neighborMines = count;
        }
      }
    }
  }

  // Draw grid buttons
  function renderGrid() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${SIZE}, 20px)`;
    
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = grid[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'minesweeper-cell unrevealed';
        cellEl.setAttribute('data-row', r);
        cellEl.setAttribute('data-col', c);

        // Bind events
        cellEl.addEventListener('click', (e) => {
          e.preventDefault();
          revealCell(r, c);
        });

        cellEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          flagCell(r, c);
        });

        boardEl.appendChild(cellEl);
      }
    }
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeElapsed++;
      let displayTime = String(timeElapsed).padStart(3, '0');
      if (timeElapsed > 999) displayTime = '999';
      timerEl.textContent = displayTime;
    }, 1000);
  }

  function flagCell(r, c) {
    if (gameOver) return;
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    
    const cellEl = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    
    if (cell.isFlagged) {
      cellEl.classList.add('flagged');
      flaggedCount++;
    } else {
      cellEl.classList.remove('flagged');
      flaggedCount--;
    }

    mineCountEl.textContent = MINE_COUNT - flaggedCount;
  }

  function revealCell(r, c) {
    if (gameOver) return;
    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      startTimer();
    }

    cell.isRevealed = true;
    revealedCount++;
    
    const cellEl = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    cellEl.classList.remove('unrevealed');

    if (cell.isMine) {
      // Game Over (Explosion)
      cellEl.classList.add('mine');
      endGame(false);
      return;
    }

    if (cell.neighborMines > 0) {
      cellEl.textContent = cell.neighborMines;
      cellEl.classList.add(`c-${cell.neighborMines}`);
    } else {
      // Flood fill zero neighbor cells
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
            revealCell(nr, nc);
          }
        }
      }
    }

    // Win condition check
    if (revealedCount === (SIZE * SIZE) - MINE_COUNT) {
      endGame(true);
    }
  }

  function endGame(isWin) {
    gameOver = true;
    clearInterval(timerInterval);
    resetBtn.textContent = isWin ? '😎' : '😵';

    // Reveal all mines
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = grid[r][c];
        const cellEl = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        
        if (cell.isMine) {
          cellEl.classList.remove('unrevealed');
          cellEl.classList.add('mine');
        } else if (cell.isFlagged) {
          // Bad flag indicator
          cellEl.style.backgroundColor = '#420a0a';
        }
      }
    }

    if (window.OS && typeof window.OS.windows.terminal !== 'undefined') {
      const text = isWin ? '[Minesweeper] Win detected! Score logged.' : '[Minesweeper] Game Over. Hit mine.';
      window.OS.windows.terminal.querySelector('.terminal-history').innerHTML += `\n${text}\n`;
    }
  }

  resetBtn.addEventListener('click', initBoard);

  // Load Initial Grid
  initBoard();

  return {
    destroy: () => {
      clearInterval(timerInterval);
    }
  };
}
