//由html标签来设置常量从而进行控制
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const resetButton = document.getElementById('reset');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 }; // 新增：缓冲方向
let score = 0;
let gameOver = false;
let gameSpeed = 100; // 初始速度
let lastFrameTime = 0;

// 生成不会出现在蛇身上的食物
function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

function init() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  score = 0;
  gameSpeed = 100;
  gameOver = false;
  scoreDisplay.textContent = score;
  lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function drawGame() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制渐变效果的蛇
  snake.forEach((segment, index) => {
    ctx.fillStyle = `hsl(${120 - index * 2}, 100%, 50%)`;
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  // 绘制闪烁的食物
  ctx.fillStyle = `hsl(${Math.sin(performance.now()/200)*360}, 100%, 50%)`;
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize/2,
    food.y * gridSize + gridSize/2,
    gridSize/2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 游戏结束显示
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
    ctx.font = '20px Arial';
    ctx.fillText('Click Restart to Play Again', canvas.width/2, canvas.height/2 + 40);
  }
}

function updateGame(currentTime) {
  // 如果游戏结束就直接返回
  if (gameOver) return;

  // 控制游戏速度
  if (currentTime - lastFrameTime < gameSpeed) return;
  lastFrameTime = currentTime;

  // 应用缓冲方向（防止快速按键冲突）
  direction = { ...nextDirection };

  const head = { 
    //x: (snake[0].x + direction.x + tileCount) % tileCount,
    //y: (snake[0].y + direction.y + tileCount) % tileCount
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // 碰壁检测
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver = true;
    return;
  }

  // 撞自身检测
  if (snake.length > 1 && snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver = true;
    return;
  }

  // 吃食物逻辑
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreDisplay.textContent = score;
    gameSpeed = Math.max(50, gameSpeed - 2); // 速度逐渐加快
    food = generateFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

function gameLoop(currentTime) {
  updateGame(currentTime);
  drawGame();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

// 改进的方向控制（禁止反向移动）
document.addEventListener('keydown', (event) => {
  const keyActions = {
    ArrowUp: () => direction.y === 0 && (nextDirection = { x: 0, y: -1 }),
    ArrowDown: () => direction.y === 0 && (nextDirection = { x: 0, y: 1 }),
    ArrowLeft: () => direction.x === 0 && (nextDirection = { x: -1, y: 0 }),
    ArrowRight: () => direction.x === 0 && (nextDirection = { x: 1, y: 0 })
  };

  if (keyActions[event.key]) {
    event.preventDefault();
    keyActions[event.key]();
  }
});

// 添加点击重新开始
canvas.addEventListener('click', () => {
  if (gameOver) init();
});

resetButton.addEventListener('click', init);

// 初始化游戏
init();