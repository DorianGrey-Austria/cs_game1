class BodyPilotGame {
    constructor() {
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('poseCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameArea = document.getElementById('gameArea');
        this.player = document.getElementById('player');
        
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            currentScore: document.getElementById('currentScore'),
            collectiblesCount: document.getElementById('collectibles'),
            timeLeft: document.getElementById('timeLeft'),
            highscoreList: document.getElementById('highscoreList')
        };
        
        this.detector = null;
        this.stream = null;
        this.isRunning = false;
        this.isPaused = false;
        this.gameTimer = null;
        
        this.score = 0;
        this.collectibles = 0;
        this.timeLeft = 60;
        this.highscores = [];
        
        this.playerPos = { x: 200, y: 300 };
        this.playerState = {
            isBoosting: false,
            hasShield: false,
            hasPowerUp: false,
            specialActive: false
        };
        
        this.handGestures = {
            leftHandUp: false,
            rightHandUp: false,
            bothHandsUp: false
        };
        
        this.calibration = {
            isCalibrated: false,
            shoulderWidth: 0,
            neutralY: 0
        };
        
        this.gameObjects = [];
        this.particles = [];
        
        this.setupEventListeners();
        this.loadHighscores();
        this.updatePlayerVisual();
    }
    
    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    async startGame() {
        if (this.isPaused) {
            this.resumeGame();
            return;
        }
        
        console.log('🎮 Starting Body Pilot Game...');
        
        try {
            await this.initializeWebcam();
            await this.initializePoseDetection();
            
            this.isRunning = true;
            this.score = 0;
            this.collectibles = 0;
            this.timeLeft = 60;
            
            console.log('✅ Game initialized successfully!');
            
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            alert('Game initialization failed. Please check webcam permissions and refresh.');
            return;
        }
        
        this.elements.startBtn.textContent = 'Running...';
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        
        this.startGameTimer();
        this.startSpawning();
        this.startPoseDetection();
        this.gameLoop();
        
        this.updateUI();
    }
    
    async initializeWebcam() {
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        };
        
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.video.srcObject = this.stream;
        
        return new Promise((resolve) => {
            this.video.onloadeddata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                resolve();
            };
        });
    }
    
    async initializePoseDetection() {
        await tf.ready();
        console.log('✅ TensorFlow ready');
        
        this.detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            }
        );
        console.log('✅ MoveNet detector ready');
    }
    
    startPoseDetection() {
        const detectLoop = async () => {
            if (!this.isRunning || this.isPaused) return;
            
            try {
                const poses = await this.detector.estimatePoses(this.video);
                
                if (poses.length > 0) {
                    this.processPose(poses[0]);
                    this.drawPose(poses[0]);
                }
                
            } catch (error) {
                console.error('Detection error:', error);
            }
            
            setTimeout(detectLoop, 50);
        };
        
        detectLoop();
    }
    
    processPose(pose) {
        const keypoints = this.getValidKeypoints(pose);
        
        if (!this.calibration.isCalibrated && keypoints.left_shoulder && keypoints.right_shoulder) {
            this.calibratePose(keypoints);
        }
        
        if (this.calibration.isCalibrated) {
            this.updatePlayerFromPose(keypoints);
            this.detectHandGestures(keypoints);
        }
    }
    
    getValidKeypoints(pose) {
        const keypoints = {};
        pose.keypoints.forEach(kp => {
            if (kp.score > 0.3) {
                keypoints[kp.name] = kp;
            }
        });
        return keypoints;
    }
    
    calibratePose(keypoints) {
        const leftShoulder = keypoints.left_shoulder;
        const rightShoulder = keypoints.right_shoulder;
        
        this.calibration.shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
        this.calibration.neutralY = (leftShoulder.y + rightShoulder.y) / 2;
        this.calibration.isCalibrated = true;
        
        console.log('🎯 Pose calibrated for Body Pilot');
    }
    
    updatePlayerFromPose(keypoints) {
        const gameRect = this.gameArea.getBoundingClientRect();
        const gameWidth = gameRect.width;
        const gameHeight = gameRect.height;
        
        if (keypoints.nose) {
            const headX = keypoints.nose.x;
            const headY = keypoints.nose.y;
            
            const normalizedX = headX / this.video.videoWidth;
            const targetX = Math.max(20, Math.min(gameWidth - 20, normalizedX * gameWidth));
            
            if (this.calibration.isCalibrated) {
                const yDiff = headY - this.calibration.neutralY;
                const normalizedY = 0.5 + (yDiff / (this.calibration.shoulderWidth * 2));
                const targetY = Math.max(20, Math.min(gameHeight - 20, normalizedY * gameHeight));
                
                this.playerState.isBoosting = yDiff > this.calibration.shoulderWidth * 0.2;
                
                const smoothing = this.playerState.isBoosting ? 0.8 : 0.6;
                this.playerPos.x = this.playerPos.x * (1 - smoothing) + targetX * smoothing;
                this.playerPos.y = this.playerPos.y * (1 - smoothing) + targetY * smoothing;
            }
        }
        
        this.updatePlayerVisual();
    }
    
    detectHandGestures(keypoints) {
        const leftWrist = keypoints.left_wrist;
        const rightWrist = keypoints.right_wrist;
        const leftShoulder = keypoints.left_shoulder;
        const rightShoulder = keypoints.right_shoulder;
        
        this.handGestures.leftHandUp = false;
        this.handGestures.rightHandUp = false;
        this.handGestures.bothHandsUp = false;
        
        if (leftWrist && leftShoulder) {
            this.handGestures.leftHandUp = leftWrist.y < leftShoulder.y - 30;
        }
        
        if (rightWrist && rightShoulder) {
            this.handGestures.rightHandUp = rightWrist.y < rightShoulder.y - 30;
        }
        
        this.handGestures.bothHandsUp = this.handGestures.leftHandUp && this.handGestures.rightHandUp;
        
        this.applyHandGestureEffects();
    }
    
    applyHandGestureEffects() {
        this.playerState.hasShield = this.handGestures.leftHandUp && !this.handGestures.bothHandsUp;
        this.playerState.hasPowerUp = this.handGestures.rightHandUp && !this.handGestures.bothHandsUp;
        
        if (this.handGestures.bothHandsUp && !this.playerState.specialActive) {
            this.activateSpecialAbility();
        }
    }
    
    activateSpecialAbility() {
        console.log('✨ Special ability activated!');
        this.playerState.specialActive = true;
        
        this.gameObjects = this.gameObjects.filter(obj => obj.type !== 'obstacle');
        this.clearGameObjectsByType('obstacle');
        
        this.addScore(50);
        this.createParticleExplosion(this.playerPos.x, this.playerPos.y, '#4ade80', 20);
        
        setTimeout(() => {
            this.playerState.specialActive = false;
        }, 2000);
    }
    
    updatePlayerVisual() {
        this.player.style.left = (this.playerPos.x - 20) + 'px';
        this.player.style.top = (this.playerPos.y - 20) + 'px';
        
        this.player.className = 'player';
        if (this.playerState.isBoosting) this.player.classList.add('boosting');
        
        let color = '#4ade80';
        if (this.playerState.hasShield) color = '#3b82f6';
        if (this.playerState.hasPowerUp) color = '#f59e0b';
        if (this.playerState.specialActive) color = '#a855f7';
        
        this.player.style.background = `radial-gradient(circle, ${color} 0%, ${color}aa 70%)`;
        this.player.style.boxShadow = `0 0 20px ${color}`;
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            if (this.isPaused) return;
            
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    startSpawning() {
        const spawn = () => {
            if (!this.isRunning || this.isPaused) return;
            
            this.spawnRandomObject();
            
            const spawnDelay = Math.max(800, 2000 - (60 - this.timeLeft) * 20);
            setTimeout(spawn, spawnDelay);
        };
        
        spawn();
    }
    
    spawnRandomObject() {
        const gameRect = this.gameArea.getBoundingClientRect();
        const gameWidth = gameRect.width;
        const gameHeight = gameRect.height;
        
        const isCollectible = Math.random() < 0.7;
        
        const obj = {
            id: Date.now() + Math.random(),
            type: isCollectible ? 'collectible' : 'obstacle',
            x: gameWidth + 50,
            y: Math.random() * (gameHeight - 100) + 50,
            width: isCollectible ? 25 : 30 + Math.random() * 20,
            height: isCollectible ? 25 : 30 + Math.random() * 20,
            speed: 2 + Math.random() * 3,
            element: null
        };
        
        obj.element = this.createGameObjectElement(obj);
        this.gameObjects.push(obj);
        this.gameArea.appendChild(obj.element);
    }
    
    createGameObjectElement(obj) {
        const element = document.createElement('div');
        element.className = obj.type;
        element.style.left = obj.x + 'px';
        element.style.top = obj.y + 'px';
        element.style.width = obj.width + 'px';
        element.style.height = obj.height + 'px';
        
        return element;
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        if (!this.isPaused) {
            this.updateGameObjects();
            this.checkCollisions();
            this.updateParticles();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateGameObjects() {
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.gameObjects[i];
            
            obj.x -= obj.speed;
            obj.element.style.left = obj.x + 'px';
            
            if (obj.x < -100) {
                obj.element.remove();
                this.gameObjects.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        const playerRect = {
            x: this.playerPos.x - 20,
            y: this.playerPos.y - 20,
            width: 40,
            height: 40
        };
        
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.gameObjects[i];
            
            if (this.isColliding(playerRect, obj)) {
                this.handleCollision(obj, i);
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    handleCollision(obj, index) {
        if (obj.type === 'collectible') {
            this.collectibles++;
            const points = this.playerState.hasPowerUp ? 20 : 10;
            this.addScore(points);
            
            this.createParticleExplosion(obj.x, obj.y, '#ffd700', 8);
            console.log(`💰 Collected! +${points} points`);
            
        } else if (obj.type === 'obstacle') {
            if (this.playerState.hasShield) {
                console.log('🛡️ Shield blocked obstacle!');
                this.createParticleExplosion(obj.x, obj.y, '#3b82f6', 6);
            } else {
                this.addScore(-5);
                this.createParticleExplosion(obj.x, obj.y, '#dc2626', 10);
                console.log('💥 Hit by obstacle! -5 points');
            }
        }
        
        obj.element.remove();
        this.gameObjects.splice(index, 1);
        
        this.updateUI();
    }
    
    createParticleExplosion(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const particle = {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                element: document.createElement('div')
            };
            
            particle.element.className = 'particle';
            particle.element.style.background = color;
            particle.element.style.left = x + 'px';
            particle.element.style.top = y + 'px';
            
            this.gameArea.appendChild(particle.element);
            this.particles.push(particle);
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            
            p.element.style.left = p.x + 'px';
            p.element.style.top = p.y + 'px';
            p.element.style.opacity = p.life;
            
            if (p.life <= 0) {
                p.element.remove();
                this.particles.splice(i, 1);
            }
        }
    }
    
    addScore(points) {
        this.score = Math.max(0, this.score + points);
    }
    
    updateUI() {
        this.elements.currentScore.textContent = this.score;
        this.elements.collectiblesCount.textContent = this.collectibles;
        this.elements.timeLeft.textContent = this.timeLeft;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.elements.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        console.log(this.isPaused ? '⏸️ Game paused' : '▶️ Game resumed');
    }
    
    resumeGame() {
        this.isPaused = false;
        this.elements.startBtn.textContent = 'Running...';
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.pauseBtn.textContent = 'Pause';
        
        this.startPoseDetection();
        this.gameLoop();
    }
    
    endGame() {
        console.log('🏁 Game Over! Final Score:', this.score);
        
        this.isRunning = false;
        
        if (this.gameTimer) clearInterval(this.gameTimer);
        
        this.saveHighscore(this.score);
        this.showGameOverScreen();
        
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
    }
    
    showGameOverScreen() {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>🎮 Game Over!</h2>
            <div class="final-score">${this.score}</div>
            <p>Collectibles: ${this.collectibles}</p>
            <p>Time survived: ${60 - this.timeLeft}s</p>
            <button class="btn" onclick="this.parentElement.remove(); window.game.resetGame();">Play Again</button>
        `;
        
        this.gameArea.appendChild(gameOverDiv);
    }
    
    resetGame() {
        console.log('🔄 Resetting game...');
        
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.gameTimer) clearInterval(this.gameTimer);
        
        this.clearGameObjects();
        
        this.playerPos = { x: 200, y: 300 };
        this.updatePlayerVisual();
        
        this.score = 0;
        this.collectibles = 0;
        this.timeLeft = 60;
        this.updateUI();
        
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.pauseBtn.textContent = 'Pause';
        
        const gameOver = this.gameArea.querySelector('.game-over');
        if (gameOver) gameOver.remove();
    }
    
    clearGameObjects() {
        this.gameObjects.forEach(obj => obj.element.remove());
        this.gameObjects = [];
        
        this.particles.forEach(p => p.element.remove());
        this.particles = [];
    }
    
    clearGameObjectsByType(type) {
        const elements = this.gameArea.querySelectorAll(`.${type}`);
        elements.forEach(el => el.remove());
    }
    
    drawPose(pose) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        pose.keypoints.forEach(kp => {
            if (kp.score > 0.3) {
                this.ctx.beginPath();
                this.ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
                
                let color = '#4ade80';
                if (kp.name === 'left_wrist' && this.handGestures.leftHandUp) color = '#3b82f6';
                if (kp.name === 'right_wrist' && this.handGestures.rightHandUp) color = '#f59e0b';
                if ((kp.name === 'left_wrist' || kp.name === 'right_wrist') && this.handGestures.bothHandsUp) color = '#a855f7';
                
                this.ctx.fillStyle = color;
                this.ctx.fill();
            }
        });
        
        this.drawSkeleton(pose.keypoints);
    }
    
    drawSkeleton(keypoints) {
        const connections = [
            ['left_shoulder', 'right_shoulder'],
            ['left_shoulder', 'left_elbow'],
            ['right_shoulder', 'right_elbow'],
            ['left_elbow', 'left_wrist'],
            ['right_elbow', 'right_wrist']
        ];
        
        const keypointMap = {};
        keypoints.forEach(kp => {
            if (kp.score > 0.3) {
                keypointMap[kp.name] = kp;
            }
        });
        
        this.ctx.strokeStyle = '#4ade80';
        this.ctx.lineWidth = 2;
        
        connections.forEach(([pointA, pointB]) => {
            const kpA = keypointMap[pointA];
            const kpB = keypointMap[pointB];
            
            if (kpA && kpB) {
                this.ctx.beginPath();
                this.ctx.moveTo(kpA.x, kpA.y);
                this.ctx.lineTo(kpB.x, kpB.y);
                this.ctx.stroke();
            }
        });
    }
    
    loadHighscores() {
        const saved = localStorage.getItem('bodyPilotHighscores');
        this.highscores = saved ? JSON.parse(saved) : [0, 0, 0, 0, 0];
        this.updateHighscoreDisplay();
    }
    
    saveHighscore(score) {
        this.highscores.push(score);
        this.highscores.sort((a, b) => b - a);
        this.highscores = this.highscores.slice(0, 5);
        
        localStorage.setItem('bodyPilotHighscores', JSON.stringify(this.highscores));
        this.updateHighscoreDisplay();
    }
    
    updateHighscoreDisplay() {
        this.elements.highscoreList.innerHTML = this.highscores
            .map((score, index) => `
                <div class="highscore-entry ${score === this.score ? 'current' : ''}">
                    <span>${index + 1}. Player</span>
                    <span>${score}</span>
                </div>
            `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Body Pilot Game...');
    
    setTimeout(() => {
        if (typeof tf === 'undefined' || typeof poseDetection === 'undefined') {
            alert('Required libraries not loaded. Please refresh the page.');
            return;
        }
        
        window.game = new BodyPilotGame();
        console.log('✅ Body Pilot Game ready!');
        
    }, 1000);
});