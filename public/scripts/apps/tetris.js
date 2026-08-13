// Tetris Game Application Plugin

export default function(container, win) {
  // HTML layout
  container.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <span>Score: <span id="tetris-score">0</span></span>
        <span>Lines: <span id="tetris-lines">0</span></span>
        <span>Lv: <span id="tetris-level">1</span></span>
      </div>
      <div class="game-canvas-wrapper">
        <canvas id="tetris-canvas" width="160" height="320"></canvas>
        <div id="tetris-overlay" class="game-overlay">
          <div class="game-overlay-title">TETRIS</div>
          <div style="font-size:11px; color:#aaa; margin-bottom:10px;">Arrows: Move | Up: Rotate | Space: Drop</div>
          <button class="game-btn" id="tetris-start-btn">START GAME</button>
        </div>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#tetris-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('#tetris-score');
  const linesEl = container.querySelector('#tetris-lines');
  const levelEl = container.querySelector('#tetris-level');
  const overlay = container.querySelector('#tetris-overlay');
  const startBtn = container.querySelector('#tetris-start-btn');

  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 16;
  
  let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
  let score = 0;
  let lines = 0;
  let level = 1;
  let gameOver = true;
  let gameInterval = null;
  let speed = 800; // ms per drop
  
  // Shapes definition
  const SHAPES = [
    [], // empty
    [[1, 1, 1, 1]], // I (cyan)
    [[1, 1, 1], [0, 1, 0]], // T (purple)
    [[1, 1, 1], [1, 0, 0]], // L (orange)
    [[1, 1, 1], [0, 0, 1]], // J (blue)
    [[1, 1], [1, 1]], // O (yellow)
    [[1, 1, 0], [0, 1, 1]], // Z (red)
    [[0, 1, 1], [1, 1, 0]]  // S (green)
  ];

  const COLORS = [
    '#000000',
    '#00e5ff', // cyan
    '#9c27b0', // purple
    '#ff9800', // orange
    '#2196f3', // blue
    '#ffeb3b', // yellow
    '#f44336', // red
    '#4caf50'  // green
  ];

  let currentPiece = null;
  
  function resetGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    speed = 800;
    gameOver = false;
    
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
    
    spawnPiece();
    overlay.style.display = 'none';
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameStep, speed);
  }

  function spawnPiece() {
    const id = Math.floor(Math.random() * 7) + 1;
    currentPiece = {
      id: id,
      matrix: SHAPES[id],
      x: Math.floor((COLS - SHAPES[id][0].length) / 2),
      y: 0
    };
    
    // Check initial collision (game over)
    if (checkCollision(currentPiece.matrix, currentPiece.x, currentPiece.y)) {
      endGame();
    }
  }

  function checkCollision(matrix, px, py) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const nextX = px + c;
          const nextY = py + r;
          
          if (nextX < 0 || nextX >= COLS || nextY >= ROWS) return true;
          if (nextY >= 0 && board[nextY][nextX]) return true;
        }
      }
    }
    return false;
  }

  function rotateMatrix(matrix) {
    const N = matrix.length;
    const M = matrix[0].length;
    const rotated = Array(M).fill().map(() => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < M; c++) {
        rotated[c][N - 1 - r] = matrix[r][c];
      }
    }
    return rotated;
  }

  function rotatePiece() {
    if (gameOver) return;
    const rotated = rotateMatrix(currentPiece.matrix);
    let originalX = currentPiece.x;
    
    // Kick wall adjustments
    if (currentPiece.x + rotated[0].length > COLS) {
      currentPiece.x = COLS - rotated[0].length;
    }
    
    if (!checkCollision(rotated, currentPiece.x, currentPiece.y)) {
      currentPiece.matrix = rotated;
    } else {
      currentPiece.x = originalX; // Revert
    }
    draw();
  }

  function moveLeft() {
    if (gameOver) return;
    if (!checkCollision(currentPiece.matrix, currentPiece.x - 1, currentPiece.y)) {
      currentPiece.x--;
    }
    draw();
  }

  function moveRight() {
    if (gameOver) return;
    if (!checkCollision(currentPiece.matrix, currentPiece.x + 1, currentPiece.y)) {
      currentPiece.x++;
    }
    draw();
  }

  function moveDown() {
    if (gameOver) return;
    if (!checkCollision(currentPiece.matrix, currentPiece.x, currentPiece.y + 1)) {
      currentPiece.y++;
    } else {
      lockPiece();
    }
    draw();
  }

  function hardDrop() {
    if (gameOver) return;
    while (!checkCollision(currentPiece.matrix, currentPiece.x, currentPiece.y + 1)) {
      currentPiece.y++;
    }
    lockPiece();
    draw();
  }

  function getGhostY() {
    let gy = currentPiece.y;
    while (!checkCollision(currentPiece.matrix, currentPiece.x, gy + 1)) {
      gy++;
    }
    return gy;
  }

  function lockPiece() {
    const m = currentPiece.matrix;
    for (let r = 0; r < m.length; r++) {
      for (let c = 0; c < m[r].length; c++) {
        if (m[r][c]) {
          board[currentPiece.y + r][currentPiece.x + c] = currentPiece.id;
        }
      }
    }
    
    clearLines();
    spawnPiece();
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(val => val > 0)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(0));
        cleared++;
        r++; // Check same row index again
      }
    }

    if (cleared > 0) {
      lines += cleared;
      // Classic scoring system
      const scoreTable = [0, 40, 100, 300, 1200];
      score += scoreTable[cleared] * level;
      
      level = Math.floor(lines / 10) + 1;
      speed = Math.max(100, 800 - (level * 70));
      
      scoreEl.textContent = score;
      linesEl.textContent = lines;
      levelEl.textContent = level;
      
      clearInterval(gameInterval);
      gameInterval = setInterval(gameStep, speed);
    }
  }

  function gameStep() {
    if (gameOver) return;
    moveDown();
  }

  function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    overlay.innerHTML = `
      <div class="game-overlay-title">GAME OVER</div>
      <div style="font-size:14px; color:#ff3333; margin-bottom:10px;">Final Score: ${score}</div>
      <button class="game-btn" id="tetris-restart-btn">PLAY AGAIN</button>
    `;
    overlay.style.display = 'flex';
    
    overlay.querySelector('#tetris-restart-btn').addEventListener('click', resetGame);
  }

  function draw() {
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid board
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          ctx.fillStyle = COLORS[board[r][c]];
          ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }

    if (!currentPiece) return;

    // Draw ghost piece
    const ghostY = getGhostY();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    const m = currentPiece.matrix;
    for (let r = 0; r < m.length; r++) {
      for (let c = 0; c < m[r].length; c++) {
        if (m[r][c]) {
          ctx.strokeRect((currentPiece.x + c) * BLOCK_SIZE, (ghostY + r) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }

    // Draw active piece
    ctx.fillStyle = COLORS[currentPiece.id];
    for (let r = 0; r < m.length; r++) {
      for (let c = 0; c < m[r].length; c++) {
        if (m[r][c]) {
          ctx.fillRect((currentPiece.x + c) * BLOCK_SIZE, (currentPiece.y + r) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }
  }

  // Keyboard controls listener bound to window body
  const keyHandler = (e) => {
    if (gameOver) return;
    
    // Only capture events if this window is currently focused
    if (!win.classList.contains('focused')) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        e.preventDefault();
        moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
        e.preventDefault();
        moveRight();
        break;
      case 'ArrowDown':
      case 's':
        e.preventDefault();
        moveDown();
        break;
      case 'ArrowUp':
      case 'w':
        e.preventDefault();
        rotatePiece();
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
    }
  };

  win.querySelector('.window-body').addEventListener('keydown', keyHandler);
  startBtn.addEventListener('click', resetGame);
  
  // Initial draw
  draw();

  return {
    destroy: () => {
      clearInterval(gameInterval);
    }
  };
}
