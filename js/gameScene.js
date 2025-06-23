class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 1;
        this.isGameActive = false;
        this.isPaused = false;
        
        // Game objects
        this.player = null;
        this.flyingObjects = [];
        this.background = null;
        
        // Spawning system
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2 seconds
        this.minSpawnInterval = 500; // Minimum spawn time
        
        // References to external systems
        this.poseTracker = null;
        this.gameManager = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        
        // Visual Effects System
        this.visualEffects = null;
    }

    preload() {
        console.log('🎮 Preloading game assets...');
        
        // Load 3D-rendered sprites with error handling
        this.load.image('car_obstacle', 'assets/car_obstacle.png');
        this.load.image('tree_obstacle', 'assets/tree_obstacle.png');
        this.load.image('sign_obstacle', 'assets/sign_obstacle.png');
        this.load.image('barrier_obstacle', 'assets/barrier_obstacle.png');
        this.load.image('female_character_sprite', 'assets/female_character_sprite.png');
        this.load.image('street_background', 'assets/street_background.png');
        
        // Error handling for asset loading
        this.load.on('filecomplete', (key, type, data) => {
            console.log('✅ Asset loaded:', key, type);
        });
        
        this.load.on('loaderror', (file) => {
            console.error('❌ Failed to load asset:', file.key, file.src);
        });
        
        // Create a simple white pixel for particles
        this.add.graphics()
            .fillStyle(0xffffff)
            .fillRect(0, 0, 1, 1)
            .generateTexture('pixel', 1, 1);
    }

    create() {
        console.log('🎮 Creating game scene...');
        
        // Get game dimensions
        this.gameWidth = this.cameras.main.width;
        this.gameHeight = this.cameras.main.height;
        
        // Create background
        this.createBackground();
        
        // Create player
        this.createPlayer();
        
        // Initialize input (for debugging)
        this.createInputs();
        
        // Setup physics if available
        this.setupPhysics();
        
        // Initialize Visual Effects System
        this.initializeVisualEffects();
        
        console.log('✅ Game scene created successfully');
    }

    createBackground() {
        // Use 3D street background if available, fallback to animated background
        if (this.textures.exists('street_background')) {
            this.background = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'street_background');
            this.background.setDisplaySize(this.gameWidth, this.gameHeight);
            this.background.setDepth(-10); // Behind everything
            
            // Subtle parallax effect
            this.tweens.add({
                targets: this.background,
                x: this.gameWidth / 2 - 20,
                duration: 5000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else {
            // Create street-style background procedurally
            this.createStreetBackground();
        }
        
        // Add environmental elements
        this.createEnvironmentalElements();
        
        // Add cyberpunk background effects
        this.createCyberpunkBackground();
    }

    updateBackground() {
        this.background.clear();
        
        // Gradient background
        for (let i = 0; i < this.gameHeight; i += 2) {
            const alpha = 0.1 + (i / this.gameHeight) * 0.2;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                { r: 15, g: 15, b: 35 },  // Dark blue
                { r: 22, g: 26, b: 46 },  // Slightly lighter
                this.gameHeight,
                i
            );
            
            this.background.lineStyle(2, 
                Phaser.Display.Color.GetColor(color.r, color.g, color.b), 
                alpha
            );
            this.background.lineBetween(0, i, this.gameWidth, i);
        }
    }

    createStreetBackground() {
        this.background = this.add.graphics();
        
        // Sky gradient
        for (let i = 0; i < this.gameHeight * 0.6; i += 2) {
            const alpha = 0.3 + (i / (this.gameHeight * 0.6)) * 0.4;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                { r: 135, g: 206, b: 235 },  // Sky blue
                { r: 255, g: 165, b: 0 },    // Orange sunset
                this.gameHeight * 0.6,
                i
            );
            
            this.background.lineStyle(2, 
                Phaser.Display.Color.GetColor(color.r, color.g, color.b), 
                alpha
            );
            this.background.lineBetween(0, i, this.gameWidth, i);
        }
        
        // Street surface
        this.background.fillStyle(0x404040);
        this.background.fillRect(0, this.gameHeight * 0.6, this.gameWidth, this.gameHeight * 0.4);
        
        // Street lines with perspective
        this.background.lineStyle(4, 0xffffff, 0.8);
        const lineSpacing = 80;
        for (let i = 0; i < this.gameWidth + 200; i += lineSpacing) {
            const startX = i - 100;
            const endX = i;
            const startY = this.gameHeight * 0.7;
            const endY = this.gameHeight * 0.75;
            
            this.background.lineBetween(startX, startY, endX, endY);
        }
        
        // Sidewalk
        this.background.fillStyle(0x696969);
        this.background.fillRect(0, this.gameHeight * 0.75, this.gameWidth, this.gameHeight * 0.25);
        
        // Animate street movement
        this.tweens.add({
            targets: this.background,
            x: -20,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createEnvironmentalElements() {
        this.environmentalElements = this.add.group();
        
        // Street lamps
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * this.gameWidth;
            const y = this.gameHeight * 0.75;
            
            const lamp = this.add.graphics();
            lamp.fillStyle(0x808080);
            lamp.fillRect(x - 2, y - 60, 4, 60);
            
            // Light
            lamp.fillStyle(0xffff99);
            lamp.fillCircle(x, y - 65, 8);
            
            this.environmentalElements.add(lamp);
        }
        
        // Background buildings
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.gameWidth;
            const height = Math.random() * 100 + 50;
            const width = Math.random() * 60 + 40;
            
            const building = this.add.graphics();
            building.fillStyle(0x2f2f2f);
            building.fillRect(x, this.gameHeight * 0.6 - height, width, height);
            
            // Windows
            building.fillStyle(0xffff99, 0.6);
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < Math.floor(height / 20); k++) {
                    if (Math.random() > 0.4) {
                        building.fillRect(
                            x + 5 + j * 15, 
                            this.gameHeight * 0.6 - height + 5 + k * 20, 
                            8, 12
                        );
                    }
                }
            }
            
            building.setDepth(-5);
            this.environmentalElements.add(building);
        }
        
        // Moving clouds
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * this.gameWidth;
            const y = Math.random() * (this.gameHeight * 0.3) + 50;
            
            const cloud = this.add.graphics();
            cloud.fillStyle(0xffffff, 0.7);
            cloud.fillCircle(x, y, 20);
            cloud.fillCircle(x + 15, y, 15);
            cloud.fillCircle(x - 15, y, 15);
            cloud.fillCircle(x + 8, y - 10, 12);
            
            // Slowly moving clouds
            this.tweens.add({
                targets: cloud,
                x: x + 100,
                duration: 20000 + Math.random() * 10000,
                repeat: -1,
                ease: 'Linear'
            });
            
            this.environmentalElements.add(cloud);
        }
    }

    createPlayer() {
        // Create player in center of screen
        const startX = this.gameWidth * 0.2; // Left side of screen
        const startY = this.gameHeight * 0.5; // Middle height
        
        this.player = new Player(this, startX, startY);
        
        console.log('👤 Player created at:', startX, startY);
    }

    createInputs() {
        // Keyboard controls for debugging
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // WASD controls
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Space for manual object spawn (debug)
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    setupPhysics() {
        // Enable physics for collision detection
        if (this.physics && this.physics.world) {
            console.log('⚡ Physics enabled');
        } else {
            console.log('⚠️ Physics not available, using manual collision detection');
        }
    }

    startGame() {
        console.log('🚀 Starting game...');
        this.isGameActive = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 1;
        
        // Clear existing objects
        this.clearFlyingObjects();
        
        // Reset player
        this.player.reset();
        
        // Start spawning
        this.spawnTimer = 0;
    }

    pauseGame() {
        this.isPaused = !this.isPaused;
        console.log('⏸️ Game paused:', this.isPaused);
    }

    stopGame() {
        console.log('🛑 Stopping game...');
        this.isGameActive = false;
        this.isPaused = false;
        
        // Clear all objects
        this.clearFlyingObjects();
    }

    update(time, delta) {
        if (!this.isGameActive || this.isPaused) return;
        
        // Update performance tracking
        this.updatePerformanceStats(time);
        
        // Update player position from pose tracker
        this.updatePlayerFromPose();
        
        // Handle object spawning
        this.updateSpawning(delta);
        
        // Update flying objects
        this.updateFlyingObjects(delta);
        
        // Check collisions
        this.checkCollisions();
        
        // Update game difficulty
        this.updateGameDifficulty();
        
        // Handle debug input
        this.handleDebugInput();
    }

    updatePerformanceStats(time) {
        this.frameCount++;
        
        if (time - this.lastFPSUpdate > 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = time;
            
            // Update debug display
            if (this.gameManager) {
                this.gameManager.updateDebugInfo({
                    fps: this.currentFPS,
                    objectCount: this.flyingObjects.length
                });
            }
        }
    }

    updatePlayerFromPose() {
        if (!this.poseTracker) return;
        
        const playerPosition = this.poseTracker.getGameCoordinates(this.gameWidth, this.gameHeight);
        
        // Constrain player to left side of screen
        playerPosition.x = Math.min(playerPosition.x, this.gameWidth * 0.4);
        playerPosition.x = Math.max(playerPosition.x, this.gameWidth * 0.1);
        
        this.player.updatePosition(playerPosition);
    }

    updateSpawning(delta) {
        this.spawnTimer += delta;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnFlyingObject();
            this.spawnTimer = 0;
        }
    }

    spawnFlyingObject() {
        // Random spawn position on right side of screen
        const x = this.gameWidth + 50;
        const y = Math.random() * (this.gameHeight - 100) + 50;
        
        // Choose random object type - temporarily favor 3D obstacle for testing
        const types = Object.values(OBJECT_TYPES);
        let randomType;
        
        // Normal random spawning
        randomType = types[Math.floor(Math.random() * types.length)];
        
        // Create flying object
        const obj = new FlyingObject(this, x, y, randomType);
        this.flyingObjects.push(obj);
        
        console.log('✨ Spawned object:', randomType.name, 'at', x, y);
    }

    updateFlyingObjects(delta) {
        // Update all flying objects
        for (let i = this.flyingObjects.length - 1; i >= 0; i--) {
            const obj = this.flyingObjects[i];
            
            if (obj.isActive) {
                obj.update(delta);
            } else {
                // Remove inactive objects
                this.flyingObjects.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        if (!this.player) return;
        
        const playerBounds = this.player.getBounds();
        
        for (let i = this.flyingObjects.length - 1; i >= 0; i--) {
            const obj = this.flyingObjects[i];
            
            if (obj.isActive && obj.checkCollision(playerBounds)) {
                // Collision detected
                this.handleCollision(obj);
                break; // Only handle one collision per frame
            }
        }
    }

    handleCollision(obj) {
        console.log('💥 Collision with:', obj.type.name);
        
        // Create enhanced explosion effect
        if (this.visualEffects) {
            this.visualEffects.createCyberpunkExplosion(
                obj.sprite.x, obj.sprite.y, 
                obj.type.color || 0xff0080, 
                1.0
            );
            this.visualEffects.triggerGlitchEffect(300);
        }
        
        // Player takes damage
        const damageTaken = this.player.takeDamage();
        
        if (damageTaken) {
            // Enhanced screen shake
            if (this.visualEffects) {
                this.visualEffects.triggerScreenShake(1.2);
            } else {
                this.cameras.main.shake(200, 0.01);
            }
            
            // Check game over
            if (this.player.getLives() <= 0) {
                this.gameOver();
            } else {
                // Update UI
                if (this.gameManager) {
                    this.gameManager.updateLives(this.player.getLives());
                }
            }
        }
    }

    addScore(points) {
        this.score += points;
        
        if (this.gameManager) {
            this.gameManager.updateScore(this.score);
        }
        
        console.log('🎯 Score:', this.score);
    }

    updateGameDifficulty() {
        // Increase difficulty based on score
        const newLevel = Math.floor(this.score / 100) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = 1 + (this.level - 1) * 0.2;
            
            // Decrease spawn interval (more objects)
            this.spawnInterval = Math.max(
                this.minSpawnInterval,
                2000 - (this.level - 1) * 200
            );
            
            console.log('📈 Level up!', this.level, 'Speed:', this.gameSpeed);
            
            if (this.gameManager) {
                this.gameManager.updateLevel(this.level);
            }
        }
    }

    handleDebugInput() {
        // Manual player movement for testing
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.x = Math.max(50, this.player.x - 5);
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.x = Math.min(this.gameWidth - 50, this.player.x + 5);
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.y = Math.max(50, this.player.y - 5);
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.y = Math.min(this.gameHeight - 50, this.player.y + 5);
        }
        
        // Manual object spawning
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.spawnFlyingObject();
        }
    }

    gameOver() {
        console.log('💀 Game Over! Final Score:', this.score);
        
        this.isGameActive = false;
        
        // Stop all objects
        this.flyingObjects.forEach(obj => obj.destroy());
        this.flyingObjects = [];
        
        // Notify game manager
        if (this.gameManager) {
            this.gameManager.gameOver(this.score);
        }
    }

    clearFlyingObjects() {
        this.flyingObjects.forEach(obj => obj.destroy());
        this.flyingObjects = [];
    }

    // External API for game manager
    setPoseTracker(poseTracker) {
        this.poseTracker = poseTracker;
    }

    setGameManager(gameManager) {
        this.gameManager = gameManager;
    }

    // Initialize Visual Effects System
    initializeVisualEffects() {
        if (typeof VisualEffectsManager !== 'undefined') {
            this.visualEffects = new VisualEffectsManager(this);
            console.log('✨ Visual Effects System initialized');
        } else {
            console.warn('⚠️ Visual Effects Manager not loaded');
        }
    }

    // Create Cyberpunk Background Effects
    createCyberpunkBackground() {
        // Add animated scanlines
        this.createScanlines();
        
        // Add floating particles
        this.createFloatingParticles();
        
        // Add grid overlay
        this.createGridOverlay();
    }

    createScanlines() {
        const scanlineContainer = this.add.graphics();
        scanlineContainer.setDepth(-5);
        
        // Create horizontal scanlines
        for (let y = 0; y < this.gameHeight; y += 4) {
            scanlineContainer.lineStyle(1, 0x00ffff, 0.1);
            scanlineContainer.lineBetween(0, y, this.gameWidth, y);
        }
        
        // Animate scanlines moving down
        this.tweens.add({
            targets: scanlineContainer,
            y: 4,
            duration: 2000,
            repeat: -1,
            ease: 'Linear',
            onRepeat: () => {
                scanlineContainer.y = -4;
            }
        });
    }

    createFloatingParticles() {
        // Create ambient floating particles
        for (let i = 0; i < 15; i++) {
            const particle = this.add.rectangle(
                Math.random() * this.gameWidth,
                Math.random() * this.gameHeight,
                2, 2,
                Math.random() > 0.5 ? 0x00ffff : 0xff0080,
                0.6
            );
            particle.setDepth(-3);
            
            // Float animation
            this.tweens.add({
                targets: particle,
                y: particle.y - 100,
                x: particle.x + (Math.random() - 0.5) * 50,
                alpha: 0,
                duration: 5000 + Math.random() * 3000,
                repeat: -1,
                ease: 'Power1',
                onRepeat: () => {
                    particle.x = Math.random() * this.gameWidth;
                    particle.y = this.gameHeight + 10;
                    particle.alpha = 0.6;
                }
            });
        }
    }

    createGridOverlay() {
        const grid = this.add.graphics();
        grid.setDepth(-4);
        grid.lineStyle(1, 0x00ffff, 0.05);
        
        // Vertical lines
        for (let x = 0; x < this.gameWidth; x += 40) {
            grid.lineBetween(x, 0, x, this.gameHeight);
        }
        
        // Horizontal lines
        for (let y = 0; y < this.gameHeight; y += 40) {
            grid.lineBetween(0, y, this.gameWidth, y);
        }
        
        // Subtle pulse animation
        this.tweens.add({
            targets: grid,
            alpha: 0.1,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    getGameState() {
        return {
            score: this.score,
            level: this.level,
            lives: this.player ? this.player.getLives() : 0,
            isActive: this.isGameActive,
            isPaused: this.isPaused,
            objectCount: this.flyingObjects.length,
            fps: this.currentFPS
        };
    }
}