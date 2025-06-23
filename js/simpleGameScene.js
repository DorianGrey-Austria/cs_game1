// 🎮 SIMPLE GAME SCENE - Clean Restart
// Senior Developer Approach: Focus on Functionality

class SimpleGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SimpleGameScene' });
        
        // Game state
        this.isGameActive = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        
        // Game objects
        this.player = null;
        this.obstacles = [];
        
        // Spawning
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2 seconds
        
        // External references
        this.poseTracker = null;
        this.gameManager = null;
        
        console.log('🎮 SimpleGameScene created');
    }
    
    preload() {
        // No assets needed - pure procedural graphics
        console.log('📦 SimpleGameScene: No assets to preload');
    }
    
    create() {
        console.log('🎮 Creating simple game scene...');
        
        // Simple background
        this.createSimpleBackground();
        
        // Create player
        this.createPlayer();
        
        // Setup physics (manual)
        this.setupSimplePhysics();
        
        console.log('✅ Simple game scene created');
    }
    
    createSimpleBackground() {
        // Simple gradient background
        const graphics = this.add.graphics();
        
        // Sky gradient
        graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xffffff, 0xffffff, 1);
        graphics.fillRect(0, 0, this.game.config.width, this.game.config.height * 0.7);
        
        // Ground
        graphics.fillStyle(0x228b22);
        graphics.fillRect(0, this.game.config.height * 0.7, this.game.config.width, this.game.config.height * 0.3);
        
        // Simple horizon line
        graphics.lineStyle(2, 0x000000);
        graphics.beginPath();
        graphics.moveTo(0, this.game.config.height * 0.7);
        graphics.lineTo(this.game.config.width, this.game.config.height * 0.7);
        graphics.strokePath();
        
        console.log('🌄 Simple background created');
    }
    
    createPlayer() {
        const startX = this.game.config.width * 0.2; // Left side
        const startY = this.game.config.height * 0.6; // Above ground
        
        this.player = new SimplePlayer(this, startX, startY);
        
        console.log('👤 Simple player created');
    }
    
    setupSimplePhysics() {
        // Manual physics - no complex physics engine needed
        console.log('⚡ Simple physics setup complete');
    }
    
    update(time, delta) {
        if (!this.isGameActive || this.isPaused) return;
        
        // Update player from pose
        this.updatePlayerFromPose();
        
        // Update obstacles
        this.updateObstacles(delta);
        
        // Handle spawning
        this.updateSpawning(delta);
        
        // Check collisions
        this.checkCollisions();
    }
    
    updatePlayerFromPose() {
        if (!this.poseTracker) return;
        
        const poseData = this.poseTracker.getPlayerPosition();
        
        // Convert pose to game coordinates
        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height;
        
        // Player movement - FIXED: Player moves, not world
        let targetX = poseData.x * gameWidth * 0.6 + gameWidth * 0.1; // Keep in left 70%
        let targetY = poseData.y * gameHeight * 0.4 + gameHeight * 0.4; // Keep in playable area
        
        // Smooth movement
        const currentX = this.player.x;
        const currentY = this.player.y;
        const lerpFactor = 0.1;
        
        const newX = currentX + (targetX - currentX) * lerpFactor;
        const newY = currentY + (targetY - currentY) * lerpFactor;
        
        this.player.moveTo(newX, newY);
        this.player.updateState(poseData.state);
        
        // Debug logging (occasional)
        if (Math.random() < 0.02) {
            console.log('🎯 Player moved to:', Math.round(newX), Math.round(newY), 'State:', poseData.state);
        }
    }
    
    updateSpawning(delta) {
        this.spawnTimer += delta;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }
    }
    
    spawnObstacle() {
        const gameWidth = this.game.config.width;
        const gameHeight = this.game.config.height;
        
        // Spawn from right side
        const x = gameWidth + 50;
        const y = Math.random() * (gameHeight * 0.4) + gameHeight * 0.4; // In playable area
        
        const types = ['box', 'circle', 'triangle'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        const obstacle = new SimpleObstacle(this, x, y, randomType);
        this.obstacles.push(obstacle);
        
        console.log('✨ Spawned obstacle:', randomType, 'at', x, y);
    }
    
    updateObstacles(delta) {
        // Update all obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            if (obstacle.isActive) {
                obstacle.update(delta);
            } else {
                // Remove inactive obstacles
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        if (!this.player) return;
        
        const playerBounds = this.player.getBounds();
        
        for (let obstacle of this.obstacles) {
            if (obstacle.checkCollision(playerBounds)) {
                console.log('💥 Collision detected!');
                
                // Handle collision
                this.handleCollision(obstacle);
                break;
            }
        }
    }
    
    handleCollision(obstacle) {
        // Remove obstacle
        obstacle.destroy();
        
        // Reduce score or lives (simple implementation)
        console.log('❤️ Player hit! Game over logic here...');
        
        // For now, just continue
        if (this.gameManager) {
            // this.gameManager.gameOver(this.score);
        }
    }
    
    startGame() {
        console.log('🚀 Starting simple game...');
        this.isGameActive = true;
        this.isPaused = false;
        this.score = 0;
        
        // Clear existing obstacles
        this.obstacles.forEach(obs => obs.destroy());
        this.obstacles = [];
    }
    
    pauseGame() {
        this.isPaused = !this.isPaused;
        console.log('⏸️ Game paused:', this.isPaused);
    }
    
    stopGame() {
        this.isGameActive = false;
        this.isPaused = false;
        
        // Clear obstacles
        this.obstacles.forEach(obs => obs.destroy());
        this.obstacles = [];
        
        console.log('🛑 Game stopped');
    }
    
    // External API
    setPoseTracker(poseTracker) {
        this.poseTracker = poseTracker;
        console.log('🤖 Pose tracker connected to simple scene');
    }
    
    setGameManager(gameManager) {
        this.gameManager = gameManager;
        console.log('🎮 Game manager connected to simple scene');
    }
}

// Export
window.SimpleGameScene = SimpleGameScene;

console.log('🎮 SimpleGameScene loaded - Clean & Functional');