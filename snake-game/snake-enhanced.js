// 增强版贪吃蛇游戏 JavaScript - 完整版
class EnhancedSnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏元素
        this.scoreElement = document.getElementById('score');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.levelIndicator = document.getElementById('levelIndicator');
        this.currentLevelElement = document.getElementById('currentLevel');
        this.highScoreElement = document.getElementById('highScore');
        this.playTimeElement = document.getElementById('playTime');
        this.moveCountElement = document.getElementById('moveCount');
        this.timeRemainingElement = document.getElementById('timeRemaining');
        this.levelProgressElement = document.getElementById('levelProgress');
        this.achievementsContainer = document.getElementById('achievementsContainer');
        
        // 游戏配置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.snake = [];
        this.foods = []; // 多个食物
        this.obstacles = []; // 障碍物
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.level = 1;
        this.gameSpeed = 150;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.moveCount = 0;
        this.playTime = 0;
        this.levelTime = 60; // 每关60秒
        this.timeRemaining = this.levelTime;
        this.levelScoreTarget = 100; // 每关需要100分
        
        // 食物类型配置
        this.foodTypes = {
            normal: { color: '#FF5252', emoji: '🍎', points: 10, probability: 0.5 },
            speed: { color: '#FF9800', emoji: '🍒', points: 20, probability: 0.2 },
            slow: { color: '#9C27B0', emoji: '🍇', points: 15, probability: 0.15 },
            star: { color: '#FFD700', emoji: '⭐', points: 30, probability: 0.1 },
            bomb: { color: '#333333', emoji: '💣', points: -20, probability: 0.05 }
        };
        
        // 成就系统
        this.achievements = {
            firstLevel: { unlocked: false, icon: '🥇', name: '首关通关', desc: '通过第一关' },
            speedMaster: { unlocked: false, icon: '⚡', name: '速度达人', desc: '蛇速达到最快' },
            precisionMaster: { unlocked: false, icon: '🎯', name: '精准大师', desc: '连续吃10个食物不撞墙' },
            highScoreKing: { unlocked: false, icon: '🏆', name: '高分王者', desc: '得分超过500' },
            obstacleDodger: { unlocked: false, icon: '🛡️', name: '障碍躲避者', desc: '成功躲避10个障碍物' },
            timeMaster: { unlocked: false, icon: '⏱️', name: '时间大师', desc: '一关内时间剩余超过30秒' }
        };
        
        // 食物统计
        this.foodStats = {
            normal: 0,
            speed: 0,
            slow: 0,
            star: 0,
            bomb: 0
        };
        
        // 游戏计时器
        this.gameTimer = null;
        this.timeTimer = null;
        
        // 初始化
        this.init();
        this.setupEventListeners();
        this.updateHighScoreDisplay();
        this.updateAchievementsDisplay();
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
        
        // 重置状态
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 150;
        this.moveCount = 0;
        this.playTime = 0;
        this.timeRemaining = this.levelTime;
        this.gameOver = false;
        
        // 清空食物和障碍物
        this.foods = [];
        this.obstacles = [];
        
        // 重置食物统计
        this.foodStats = { normal: 0, speed: 0, slow: 0, star: 0, bomb: 0 };
        
        // 生成初始食物和障碍物
        this.generateFoods(3); // 初始3个食物
        if (this.level >= 2) {
            this.generateObstacles(3); // 第2关开始有障碍物
        }
        
        // 更新显示
        this.updateScore();
        this.updateLevelDisplay();
        this.updateTimeDisplay();
        this.updateProgressBar();
        this.gameStatusElement.textContent = '点击开始游戏';
        
        // 绘制初始状态
        this.draw();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                        this.moveCount++;
                        this.updateMoveCount();
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                        this.moveCount++;
                        this.updateMoveCount();
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                        this.moveCount++;
                        this.updateMoveCount();
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                        this.moveCount++;
                        this.updateMoveCount();
                    }
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
            if (this.direction.y === 0) {
                this.nextDirection = { x: 0, y: -1 };
                this.moveCount++;
                this.updateMoveCount();
            }
        });
        document.getElementById('downBtn').addEventListener('click', () => {
            if (this.direction.y === 0) {
                this.nextDirection = { x: 0, y: 1 };
                this.moveCount++;
                this.updateMoveCount();
            }
        });
        document.getElementById('leftBtn').addEventListener('click', () => {
            if (this.direction.x === 0) {
                this.nextDirection = { x: -1, y: 0 };
                this.moveCount++;
                this.updateMoveCount();
            }
        });
        document.getElementById('rightBtn').addEventListener('click', () => {
            if (this.direction.x === 0) {
                this.nextDirection = { x: 1, y: 0 };
                this.moveCount++;
                this.updateMoveCount();
            }
        });
    }
    
    startGame() {
        if (!this.gameRunning && !this.gameOver) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameStatusElement.textContent = `关卡 ${this.level} - 进行中...`;
            this.startTimers();
            this.gameLoop();
        }
    }
    
    startTimers() {
        // 游戏时间计时器
        this.gameTimer = setInterval(() => {
            this.playTime++;
            this.updatePlayTime();
        }, 1000);
        
        // 关卡时间计时器
        this.timeTimer = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.updateTimeDisplay();
                
                // 时间警告
                if (this.timeRemaining <= 10) {
                    this.timeRemainingElement.style.color = '#f44336';
                }
                
                // 时间到
                if (this.timeRemaining === 0) {
                    this.timeOut();
                }
            }
        }, 1000);
    }
    
    stopTimers() {
        if (this.gameTimer) clearInterval(this.gameTimer);
        if (this.timeTimer) clearInterval(this.timeTimer);
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        this.gameStatusElement.textContent = this.gamePaused ? '游戏已暂停' : `关卡 ${this.level} - 进行中...`;
        
        if (this.gamePaused) {
            this.stopTimers();
        } else {
            this.startTimers();
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.stopTimers();
        this.init();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        // 更新方向
        this.direction = { ...this.nextDirection };
        
        // 移动蛇
        this.moveSnake();
        
        // 检查碰撞
        if (this.checkCollision()) {
            this.gameOver = true;
            this.stopGame();
            return;
        }
        
        // 检查食物
        this.checkFoods();
        
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
        
        // 检查是否吃到食物
        let ateFood = false;
        for (let i = this.foods.length - 1; i >= 0; i--) {
            const food = this.foods[i];
            if (head.x === food.x && head.y === food.y) {
                ateFood = true;
                this.processFood(food);
                this.foods.splice(i, 1);
                break;
            }
        }
        
        // 如果没有吃到食物，移除尾部
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
        
        // 检查障碍物碰撞（第2关开始）
        if (this.level >= 2) {
            for (const obstacle of this.obstacles) {
                if (head.x === obstacle.x && head.y === obstacle.y) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    generateFoods(count) {
        for (let i = 0; i < count; i++) {
            this.generateFood();
        }
    }
    
    generateFood() {
        let foodPositionValid = false;
        let newFood = {};
        
        while (!foodPositionValid) {
            // 随机选择食物类型
            const rand = Math.random();
            let cumulativeProb = 0;
            let selectedType = 'normal';
            
            for (const [type, config] of Object.entries(this.foodTypes)) {
                cumulativeProb += config.probability;
                if (rand <= cumulativeProb) {
                    selectedType = type;
                    break;
                }
            }
            
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: selectedType
            };
            
            // 检查位置是否有效
            foodPositionValid = this.isPositionValid(newFood.x, newFood.y);
        }
        
        this.foods.push(newFood);
    }
    
    generateObstacles(count) {
        for (let i = 0; i < count; i++) {
            this.generateObstacle();
        }
    }
    
    generateObstacle() {
        let obstaclePositionValid = false;
        let obstacle = {};
        
        while (!obstaclePositionValid) {
            obstacle = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            // 检查位置是否有效（不在蛇身上，不在食物上）
            obstaclePositionValid = this.isPositionValid(obstacle.x, obstacle.y);
        }
        
        this.obstacles.push(obstacle);
    }
    
    isPositionValid(x, y) {
        // 检查是否在蛇身上
        for (const segment of this.snake) {
            if (segment.x === x && segment.y === y) {
                return false;
            }
        }
        
        // 检查是否在食物上
        for (const food of this.foods) {
            if (food.x === x && food.y === y) {
                return false;
            }
        }
        
        // 检查是否在障碍物上
        for (const obstacle of this.obstacles) {
            if (obstacle.x === x && obstacle.y === y) {
                return false;
            }
        }
        
        return true;
    }
    
    processFood(food) {
        const foodType = this.foodTypes[food.type];
        
        // 更新分数
        this.score += foodType.points;
        if (this.score < 0) this.score = 0;
        
        // 更新食物统计
        this.foodStats[food.type]++;
        
        // 根据食物类型处理特殊效果
        switch(food.type) {
            case 'speed':
                this.gameSpeed = Math.max(50, this.gameSpeed - 20);
                this.checkAchievement('speedMaster', this.gameSpeed <= 50);
                break;
            case 'slow':
                this.gameSpeed = Math.min(300, this.gameSpeed + 30);
                break;
            case 'star':
                // 星星食物直接进入下一关
                this.levelUp();
                break;
            case 'bomb':
                // 炸弹食物缩短蛇身
                if (this.snake.length > 3) {
                    this.snake.pop();
                    this.snake.pop();
                }
                break;
        }
        
        // 更新显示
        this.updateScore();
        this.updateProgressBar();
        
        // 生成新食物
        this.generateFood();
        
        // 检查关卡升级
        if (this.score >= this.level * this.levelScoreTarget) {
            this.levelUp();
        }
        
        // 检查成就
        this.checkAchievement('precisionMaster', this.foodStats.normal >= 10);
        this.checkAchievement('highScoreKing', this.score >= 500);
        this.checkAchievement('obstacleDodger', this.moveCount >= 10 && this.level >= 2);
        this.checkAchievement('timeMaster', this.timeRemaining >= 30);
    }
    
    checkFoods() {
        // 保持食物数量在3-5个之间
        if (this.foods.length < 3) {
            this.generateFoods(3 - this.foods.length);
        }
    }
    
    levelUp() {
        this.level++;
        this.gameSpeed = Math.max(50, 150 - (this.level - 1) * 20); // 每关加快速度
        this.timeRemaining = this.levelTime;
        this.timeRemainingElement.style.color = '#333';
        
        // 添加障碍物
        if (this.level >= 2) {
            const newObstacles = Math.min(5, this.level + 1);
            this.generateObstacles(newObstacles - this.obstacles.length);
        }
        
        // 更新显示
        this.updateLevelDisplay();
        this.updateTimeDisplay();
        this.updateProgressBar();
        this.gameStatusElement.textContent = `进入关卡 ${this.level}!`;
        
        // 检查成就
        if (this.level >= 2) {
            this.checkAchievement('firstLevel', true);
        }
    }
    
    timeOut() {
        this.gameOver = true;
        this.stopGame();
        this.gameStatusElement.textContent = '时间到！游戏结束';
    }
    
    stopGame() {
        this.gameRunning = false;
        this.stopTimers();
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
        
        // 显示游戏结束画面
        this.drawGameOver();
    }
    
    checkAchievement(achievementKey, condition) {
        if (!this.achievements[achievementKey].unlocked && condition) {
            this.achievements[achievementKey].unlocked = true;
            this.updateAchievementsDisplay();
            
