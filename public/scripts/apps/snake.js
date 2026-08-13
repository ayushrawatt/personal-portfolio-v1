// Snake Game Application Plugin

export default function(container, win) {
  // HTML layout
  container.innerHTML = `
    <div class="game-container">
      <div class="game-header" style="max-width: 300px;">
        <span>Score: <span id="snake-score">0</span></span>
        <span>High Score: <span id="snake-highscore">0</span></span>
      </div>
      <div class="game-canvas-wrapper">
        <canvas id="snake-canvas" width="300" height="300"></canvas>
        <div id="snake-overlay" class="game-overlay">
          <div class="game-overlay-title">SNAKE</div>
          <div style="font-size:11px; color:#aaa; margin-bottom:10px;">WASD / Arrows: Control Snake direction</div>
          <button class="game-btn" id="snake-start-btn">START GAME</button>
        </div>
      </div>
      <div class="snake-controls" style="display:flex; flex-direction:column; align-items:center; gap:5px; margin-top:10px;">
        <button class="game-btn" id="btn-up" style="width:40px; height:30px;">▲</button>
        <div style="display:flex; gap:40px;">
          <button class="game-btn" id="btn-left" style="width:40px; height:30px;">◀</button>
          <button class="game-btn" id="btn-right" style="width:40px; height:30px;">▶</button>
        </div>
        <button class="game-btn" id="btn-down" style="width:40px; height:30px;">▼</button>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = container.querySelector('#snake-score');
  const highscoreEl = container.querySelector('#snake-highscore');
  const overlay = container.querySelector('#snake-overlay');
  const startBtn = container.querySelector('#snake-start-btn');

  const GRID_SIZE = 15;
  const TILE_COUNT = 20; // 300 / 15 = 20 columns/rows
  
  let snake = [];
  let food = { x: 0, y: 0 };
  let dx = 0;
  let dy = 0;
  let score = 0;
  let highscore = localStorage.getItem('snake_highscore') || 0;
  let gameOver = true;
  let gameInterval = null;
  let speed = 250; // ms per update

  highscoreEl.textContent = highscore;

  function resetGame() {
    snake = [
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 }
    ];
    
    dx = 1;
    dy = 0;
    score = 0;
    speed = 250;
    gameOver = false;
    
    scoreEl.textContent = score;
    spawnFood();
    overlay.style.display = 'none';

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameStep, speed);
  }

  function spawnFood() {
    let foodX, foodY;
    let onSnake = true;
    
    while (onSnake) {
      foodX = Math.floor(Math.random() * TILE_COUNT);
      foodY = Math.floor(Math.random() * TILE_COUNT);
      onSnake = snake.some(part => part.x === foodX && part.y === foodY);
    }
    
    food = { x: foodX, y: foodY };
  }

  function gameStep() {
    if (gameOver) return;

    // Move snake head
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Boundary collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
      endGame();
      return;
    }

    // Body collision
    if (snake.some(part => part.x === head.x && part.y === head.y)) {
      endGame();
      return;
    }

    // Add head
    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      if (score > highscore) {
        highscore = score;
        highscoreEl.textContent = highscore;
        localStorage.setItem('snake_highscore', highscore);
      }
      spawnFood();
      
      // Speed increase
      if (score % 50 === 0 && speed > 60) {
        speed -= 10;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameStep, speed);
      }
    } else {
      // Remove tail
      snake.pop();
    }

    draw();
  }

  function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    overlay.innerHTML = `
      <div class="game-overlay-title">GAME OVER</div>
      <div style="font-size:14px; color:#ff3333; margin-bottom:10px;">Final Score: ${score}</div>
      <button class="game-btn" id="snake-restart-btn">PLAY AGAIN</button>
    `;
    overlay.style.display = 'flex';
    
    overlay.querySelector('#snake-restart-btn').addEventListener('click', resetGame);
  }

  function draw() {
    // Canvas background
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(58, 75, 124, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }

    // Draw snake body
    snake.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? '#ffff00' : '#00ff41';
      ctx.fillRect(part.x * GRID_SIZE + 1, part.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    // Draw food
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(food.x * GRID_SIZE + GRID_SIZE/2, food.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Keyboard control listener bound to window body
  const keyHandler = (e) => {
    if (gameOver) return;
    
    // Only capture events if this window is currently focused
    if (!win.classList.contains('focused')) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        if (dy === 0) { dx = 0; dy = -1; }
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
        if (dy === 0) { dx = 0; dy = 1; }
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
        if (dx === 0) { dx = -1; dy = 0; }
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
        if (dx === 0) { dx = 1; dy = 0; }
        e.preventDefault();
        break;
    }
  };

  const handleUp = (e) => { if (!gameOver && dy === 0) { dx = 0; dy = -1; }; e?.preventDefault(); };
  const handleDown = (e) => { if (!gameOver && dy === 0) { dx = 0; dy = 1; }; e?.preventDefault(); };
  const handleLeft = (e) => { if (!gameOver && dx === 0) { dx = -1; dy = 0; }; e?.preventDefault(); };
  const handleRight = (e) => { if (!gameOver && dx === 0) { dx = 1; dy = 0; }; e?.preventDefault(); };

  container.querySelector('#btn-up').addEventListener('mousedown', handleUp);
  container.querySelector('#btn-down').addEventListener('mousedown', handleDown);
  container.querySelector('#btn-left').addEventListener('mousedown', handleLeft);
  container.querySelector('#btn-right').addEventListener('mousedown', handleRight);

  container.querySelector('#btn-up').addEventListener('touchstart', handleUp, {passive: false});
  container.querySelector('#btn-down').addEventListener('touchstart', handleDown, {passive: false});
  container.querySelector('#btn-left').addEventListener('touchstart', handleLeft, {passive: false});
  container.querySelector('#btn-right').addEventListener('touchstart', handleRight, {passive: false});

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
