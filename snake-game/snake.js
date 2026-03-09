// 贪吃蛇游戏 JavaScript
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.normalFoodElement = document.getElementById('normalFood');
        this.speedFoodElement = document.getElementById('speedFood');
        this.slowFoodElement = document.getElementById('slowFood');
        
        // 游戏配置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.snake = [];
        this.food = { x: 0, y: 0, type: 'normal' };
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.gameSpeed = 150; // 初始速度（毫秒）
        this.gameRunning = false;
        this.gamePaused = false;
        this.foodCount = { normal: 0, speed: 0, slow: 0 };
        
        // 食物类型配置
        this.foodTypes = {
            normal: { color: '#FF5252', emoji: '🍎', points: 10 },
            speed: { color: '#FF9800', emoji: '🍒', points: 20 },
            slow: { color: '#9C27B0', emoji: '🍇', points: 15 }
        };
        
        // 初始化
        this.init();
        this.setupEventListeners();
        this.updateFoodCountDisplay();
    }
    
    init() {
        // 初始化蛇
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // 初始化方向
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // 重置分数
        this.score = 0;
        this.gameSpeed = 150;
        this.foodCount = { normal: 0, speed: 0, slow: 0 };
        
        // 生成第一个食物
        this.generateFood();
        
        // 更新显示
        this.updateScore();
        this.gameStatusElement.textContent = '点击开始游戏';
        this.updateFoodCountDisplay();
        
        // 绘制初始状态
        this.draw();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                    break;
                case ' ':
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.resetGame();
                    break;
            }
        });
        
        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // 移动端控制
        document.getElementById('upBtn').addEventListener('click', () => {
            if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
        });
        document.getElementById('downBtn').addEventListener('click', () => {
            if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
        });
        document.getElementById('leftBtn').addEventListener('click', () => {
            if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
        });
        document.getElementById('rightBtn').addEventListener('click', () => {
            if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
        });
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameStatusElement.textContent = '游戏进行中...';
            this.gameLoop();
        }
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.gameStatusElement.textContent = this.gamePaused ? '游戏已暂停' : '游戏进行中...';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.init();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // 更新方向
        this.direction = { ...this.nextDirection };
        
        // 移动蛇
        this.moveSnake();
        
        // 检查碰撞
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }
        
        // 检查是否吃到食物
        this.checkFood();
        
        // 绘制游戏
        this.draw();
        
        // 继续游戏循环
        setTimeout(() => this.gameLoop(), this.gameSpeed);
    }
    
    moveSnake() {
        // 创建新的头部
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 添加到蛇的头部
        this.snake.unshift(head);
        
        // 如果没有吃到食物，移除尾部
        const ateFood = head.x === this.food.x && head.y === this.food.y;
        if (!ateFood) {
            this.snake.pop();
        }
    }
    
    checkCollision() {
        const head = this.snake[0];
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // 检查自身碰撞
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    checkFood() {
        const head = this.snake[0];
        
        if (head.x === this.food.x && head.y === this.food.y) {
            // 增加分数
            const foodType = this.foodTypes[this.food.type];
            this.score += foodType.points;
            this.foodCount[this.food.type]++;
            
            // 更新食物计数显示
            this.updateFoodCountDisplay();
            
            // 根据食物类型调整速度
            if (this.food.type === 'speed') {
                this.gameSpeed = Math.max(50, this.gameSpeed - 20);
            } else if (this.food.type === 'slow') {
                this.gameSpeed = Math.min(300, this.gameSpeed + 30);
            }
            
            // 更新分数显示
            this.updateScore();
            
            // 生成新食物
            this.generateFood();
        }
    }
    
    generateFood() {
        let foodPositionValid = false;
        let newFood = {};
        
        while (!foodPositionValid) {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: this.getRandomFoodType()
            };
            
            // 检查食物是否在蛇身上
            foodPositionValid = true;
            for (const segment of this.snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    foodPositionValid = false;
                    break;
                }
            }
        }
        
        this.food = newFood;
    }
    
    getRandomFoodType() {
        const rand = Math.random();
        if (rand < 0.6) return 'normal';    // 60% 普通食物
        if (rand < 0.8) return 'speed';     // 20% 加速食物
        return 'slow';                      // 20% 减速食物
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateFoodCountDisplay() {
        this.normalFoodElement.textContent = this.foodCount.normal;
        this.speedFoodElement.textContent = this.foodCount.speed;
        this.slowFoodElement.textContent = this.foodCount.slow;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gameStatusElement.textContent = `游戏结束！最终得分: ${this.score}`;
        
        // 绘制游戏结束效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`得分: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('点击"重新开始"按钮', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 0.5;
        
        // 绘制垂直线
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        // 绘制蛇身
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            // 蛇头用不同颜色
            if (i === 0) {
                this.ctx.fillStyle = '#4CAF50'; // 头部颜色
            } else {
                // 身体渐变颜色
                const intensity = 200 - Math.min(150, i * 5);
                this.ctx.fillStyle = `rgb(76, ${intensity}, 80)`;
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 1, 
                this.gridSize - 1
            );
            
            // 绘制边框
            this.ctx.strokeStyle = '#388E3C';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 1, 
                this.gridSize - 1
            );
            
            // 绘制眼睛（头部）
            if (i === 0) {
                this.ctx.fillStyle = 'white';
                const eyeSize = 3;
                
                // 根据方向绘制眼睛位置
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                if (this.direction.x === 1) { // 向右
                    leftEyeX = segment.x * this.gridSize + this.gridSize - 6;
                    leftEyeY = segment.y * this.gridSize + 6;
                    rightEyeX = segment.x * this.gridSize + this.gridSize - 6;
                    rightEyeY = segment.y * this.gridSize + this.gridSize - 6;
                } else if (this.direction.x === -1) { // 向左
                    leftEyeX = segment.x * this.gridSize + 6;
                    leftEyeY = segment.y * this.gridSize + 6;
                    rightEyeX = segment.x * this.gridSize + 6;
                    rightEyeY = segment.y * this.gridSize + this.gridSize - 6;
                } else if (this.direction.y === 1) { // 向下
                    leftEyeX = segment.x * this.gridSize + 6;
                    leftEyeY = segment.y * this.gridSize + this.gridSize - 6;
                    rightEyeX = segment.x * this.gridSize + this.gridSize - 6;
                    rightEyeY = segment.y * this.gridSize + this.gridSize - 6;
                } else { // 向上
                    leftEyeX = segment.x * this.gridSize + 6;
                    leftEyeY = segment.y * this.gridSize + 6;
                    rightEyeX = segment.x * this.gridSize + this.gridSize - 6;
                    rightEyeY = segment.y * this.gridSize + 6;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawFood() {
        const foodType = this.foodTypes[this.food.type];
        
        // 绘制食物方块
        this.ctx.fillStyle = foodType.color;
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 1, 
            this.gridSize - 1
        );
        
        // 绘制食物边框
        this.ctx.strokeStyle = this.darkenColor(foodType.color, 20);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 1, 
            this.gridSize - 1
        );
        
        // 绘制食物闪烁效果
        if (Math.floor(Date.now() / 300) % 2 === 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(
                this.food.x * this.gridSize + 4, 
                this.food.y * this.gridSize + 4, 
                this.gridSize - 9, 
                this.gridSize - 9
            );
        }
    }
    
    darkenColor(color, percent) {
        // 简化版的颜色变暗函数
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
    }
}

// 初始化游戏
const game = new SnakeGame();

// 导出游戏实例（用于调试）
window.snakeGame = game;