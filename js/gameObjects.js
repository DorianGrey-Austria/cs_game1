// Bonus Object Types
const BONUS_TYPES = {
    STAR_COIN: {
        name: 'star_coin',
        color: 0xffd700,
        size: 25,
        speed: 150,
        score: 50,
        sprite: 'star_coin'
    },
    DIAMOND: {
        name: 'diamond',
        color: 0x00ffff,
        size: 20,
        speed: 120,
        score: 100,
        sprite: 'diamond'
    },
    HEART: {
        name: 'heart',
        color: 0xff1493,
        size: 22,
        speed: 130,
        score: 75,
        sprite: 'heart'
    }
};

// Flying Object Types - Street Obstacles
const OBJECT_TYPES = {
    CAR: {
        name: 'car',
        color: 0xff4444,
        size: 80,
        width: 120,
        height: 60,
        speed: 250,
        score: 20,
        sprite: 'car_obstacle'
    },
    TREE: {
        name: 'tree',
        color: 0x228b22,
        size: 70,
        width: 50,
        height: 100,
        speed: 180,
        score: 15,
        sprite: 'tree_obstacle'
    },
    TRAFFIC_SIGN: {
        name: 'traffic_sign',
        color: 0xffa500,
        size: 50,
        width: 60,
        height: 120,
        speed: 200,
        score: 10,
        sprite: 'sign_obstacle'
    },
    BARRIER: {
        name: 'barrier',
        color: 0xff6b6b,
        size: 40,
        width: 100,
        height: 30,
        speed: 220,
        score: 12,
        sprite: 'barrier_obstacle'
    },
    // Fallback objects for when 3D sprites are not available
    BALL: {
        name: 'ball',
        color: 0xff6b6b,
        size: 40,
        speed: 200,
        score: 10
    },
    BOX: {
        name: 'box',
        color: 0x4ecdc4,
        size: 45,
        speed: 180,
        score: 15
    }
};

class FlyingObject {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;
        this.isActive = true;
        this.hasCollided = false;
        
        // Create visual representation
        this.sprite = this.createSprite(x, y, type);
        
        // Set physics properties
        this.setupPhysics();
        
        // Animation and effects
        this.setupAnimations();
        
        // Add cyberpunk glow effect
        this.addGlowEffect();
    }
    
    addGlowEffect() {
        // Add subtle glow effect to objects
        if (this.sprite.setFX) {
            this.sprite.setFX('glow', {
                color: this.type.color || 0x00ffff,
                strength: 0.3
            });
        }
    }

    createSprite(x, y, type) {
        let sprite;
        
        // Try to use 3D-rendered sprite first
        if (type.sprite && this.scene.textures.exists(type.sprite)) {
            sprite = this.scene.add.image(x, y, type.sprite);
            sprite.setDisplaySize(type.width || type.size, type.height || type.size);
            console.log('✅ Using 3D sprite:', type.sprite);
        } else {
            // Fallback to procedural 3D-style graphics
            sprite = this.create3DStyleSprite(x, y, type);
            console.log('⚠️ Using fallback 3D-style sprite for:', type.name);
        }
        
        return sprite;
    }

    create3DStyleSprite(x, y, type) {
        const container = this.scene.add.container(x, y);
        
        switch (type.name) {
            case 'car':
                return this.createCarSprite(x, y, type, container);
            case 'tree':
                return this.createTreeSprite(x, y, type, container);
            case 'traffic_sign':
                return this.createSignSprite(x, y, type, container);
            case 'barrier':
                return this.createBarrierSprite(x, y, type, container);
            case 'ball':
                return this.createBallSprite(x, y, type);
            case 'box':
                return this.createBoxSprite(x, y, type);
            default:
                return this.scene.add.circle(x, y, type.size / 2, type.color);
        }
    }

    createCarSprite(x, y, type, container) {
        // Car body with 3D perspective
        const body = this.scene.add.graphics();
        body.fillStyle(type.color);
        body.fillRect(-60, -25, 120, 50);
        
        // Car roof (darker)
        body.fillStyle(type.color * 0.7);
        body.fillRect(-45, -35, 90, 30);
        
        // Windshield
        body.fillStyle(0x87ceeb, 0.8);
        body.fillRect(-40, -32, 80, 25);
        
        // Wheels
        body.fillStyle(0x333333);
        body.fillCircle(-35, 25, 8);
        body.fillCircle(35, 25, 8);
        
        // Lights
        body.fillStyle(0xffff00);
        body.fillCircle(-55, -10, 5);
        body.fillCircle(-55, 10, 5);
        
        container.add(body);
        return container;
    }

    createTreeSprite(x, y, type, container) {
        // Tree trunk
        const trunk = this.scene.add.graphics();
        trunk.fillStyle(0x8b4513);
        trunk.fillRect(-8, 20, 16, 40);
        
        // Tree crown (layered for 3D effect)
        trunk.fillStyle(0x228b22);
        trunk.fillCircle(0, 0, 35);
        trunk.fillStyle(0x32cd32);
        trunk.fillCircle(-10, -10, 25);
        trunk.fillStyle(0x90ee90);
        trunk.fillCircle(10, -5, 20);
        
        container.add(trunk);
        return container;
    }

    createSignSprite(x, y, type, container) {
        // Sign post
        const post = this.scene.add.graphics();
        post.fillStyle(0x808080);
        post.fillRect(-3, 0, 6, 80);
        
        // Sign board
        post.fillStyle(type.color);
        post.fillRect(-25, -40, 50, 60);
        
        // Sign border
        post.lineStyle(2, 0xffffff);
        post.strokeRect(-25, -40, 50, 60);
        
        // Warning symbol
        post.fillStyle(0x000000);
        post.fillTriangle(0, -30, -15, 0, 15, 0);
        
        container.add(post);
        return container;
    }

    createBarrierSprite(x, y, type, container) {
        // Barrier base
        const barrier = this.scene.add.graphics();
        barrier.fillStyle(type.color);
        barrier.fillRect(-50, -10, 100, 20);
        
        // Diagonal stripes for realism
        barrier.lineStyle(3, 0xffffff);
        for (let i = -40; i < 40; i += 20) {
            barrier.lineBetween(i, -10, i + 10, 10);
        }
        
        // Support posts
        barrier.fillStyle(0x808080);
        barrier.fillRect(-45, -15, 8, 30);
        barrier.fillRect(37, -15, 8, 30);
        
        container.add(barrier);
        return container;
    }

    createBallSprite(x, y, type) {
        const ball = this.scene.add.circle(x, y, type.size / 2, type.color);
        // Add highlight for 3D effect
        const highlight = this.scene.add.circle(x - 8, y - 8, type.size / 4, 0xffffff, 0.6);
        ball.setStrokeStyle(2, 0xffffff, 0.8);
        return ball;
    }

    createBoxSprite(x, y, type) {
        const container = this.scene.add.container(x, y);
        
        // Main face
        const front = this.scene.add.rectangle(0, 0, type.size, type.size, type.color);
        
        // Top face for 3D effect
        const top = this.scene.add.polygon(0, 0, [
            -type.size/2, -type.size/2,
            -type.size/2 + 10, -type.size/2 - 10,
            type.size/2 + 10, -type.size/2 - 10,
            type.size/2, -type.size/2
        ], type.color * 1.2);
        
        // Right face for 3D effect
        const right = this.scene.add.polygon(0, 0, [
            type.size/2, -type.size/2,
            type.size/2 + 10, -type.size/2 - 10,
            type.size/2 + 10, type.size/2 - 10,
            type.size/2, type.size/2
        ], type.color * 0.8);
        
        container.add([front, top, right]);
        front.setStrokeStyle(2, 0xffffff, 0.8);
        
        return container;
    }

    createStar(x, y, size, color) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(color);
        graphics.lineStyle(2, 0xffffff, 0.8);
        
        // Draw star shape
        const points = [];
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.4;
        
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            points.push(x + Math.cos(angle) * radius);
            points.push(y + Math.sin(angle) * radius);
        }
        
        graphics.fillPoints(points);
        graphics.strokePoints(points);
        
        return graphics;
    }

    setupPhysics() {
        // Enable physics if available
        if (this.scene.physics && this.scene.physics.world) {
            this.scene.physics.world.enable(this.sprite);
            
            // Set velocity
            this.sprite.body.setVelocityX(-this.type.speed);
            
            // Add slight random vertical movement for variety
            const randomY = (Math.random() - 0.5) * 50;
            this.sprite.body.setVelocityY(randomY);
            
            // Set collision bounds
            this.sprite.body.setSize(this.type.size * 0.8, this.type.size * 0.8);
        } else {
            // Fallback manual movement
            this.velocity = { x: -this.type.speed, y: (Math.random() - 0.5) * 50 };
        }
    }

    setupAnimations() {
        // Rotation animation with neon glow
        this.scene.tweens.add({
            targets: this.sprite,
            rotation: Math.PI * 2,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Enhanced pulsing effect with color cycling
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add neon trail effect
        this.scene.time.addEvent({
            delay: 50,
            repeat: -1,
            callback: () => {
                if (this.scene.visualEffects && this.isActive) {
                    this.scene.visualEffects.createNeonTrail(this.sprite, this.type.color || 0x00ffff, 3);
                }
            }
        });
    }

    update(deltaTime) {
        if (!this.isActive) return;
        
        // Manual movement if physics not available
        if (!this.sprite.body) {
            this.sprite.x += this.velocity.x * deltaTime / 1000;
            this.sprite.y += this.velocity.y * deltaTime / 1000;
        }
        
        // Check if object is off-screen (left side)
        if (this.sprite.x < -this.type.size) {
            this.destroy();
        }
    }

    checkCollision(playerBounds) {
        if (!this.isActive || this.hasCollided) return false;
        
        const objectBounds = this.getBounds();
        
        // Simple AABB collision detection
        const collision = (
            objectBounds.x < playerBounds.x + playerBounds.width &&
            objectBounds.x + objectBounds.width > playerBounds.x &&
            objectBounds.y < playerBounds.y + playerBounds.height &&
            objectBounds.y + objectBounds.height > playerBounds.y
        );
        
        if (collision) {
            this.onCollision();
            return true;
        }
        
        return false;
    }

    getBounds() {
        return {
            x: this.sprite.x - this.type.size / 2,
            y: this.sprite.y - this.type.size / 2,
            width: this.type.size,
            height: this.type.size
        };
    }

    onCollision() {
        if (this.hasCollided) return;
        
        this.hasCollided = true;
        
        // Create explosion effect
        this.createExplosion();
        
        // Flash effect
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    createExplosion() {
        // Create particle explosion
        const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, 'pixel', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            quantity: 10
        });
        
        // Create simple particles if Phaser particles not available
        if (!particles) {
            this.createSimpleExplosion();
        } else {
            // Clean up particles after explosion
            this.scene.time.delayedCall(300, () => {
                particles.destroy();
            });
        }
    }

    createSimpleExplosion() {
        // Create simple explosion with circles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50;
            const x = this.sprite.x + Math.cos(angle) * distance;
            const y = this.sprite.y + Math.sin(angle) * distance;
            
            const particle = this.scene.add.circle(this.sprite.x, this.sprite.y, 3, this.type.color);
            
            this.scene.tweens.add({
                targets: particle,
                x: x,
                y: y,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    destroy() {
        this.isActive = false;
        
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    getScore() {
        return this.type.score;
    }
}

class BonusObject {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;
        this.isActive = true;
        this.hasBeenCollected = false;
        
        // Create visual representation
        this.sprite = this.createBonusSprite(x, y, type);
        
        // Set physics properties
        this.setupPhysics();
        
        // Animation and effects
        this.setupBonusAnimations();
    }

    createBonusSprite(x, y, type) {
        let sprite;
        
        // Try to use 3D-rendered sprite first
        if (type.sprite && this.scene.textures.exists(type.sprite)) {
            sprite = this.scene.add.image(x, y, type.sprite);
            sprite.setDisplaySize(type.size, type.size);
        } else {
            // Fallback to procedural bonus graphics
            sprite = this.createBonusGraphics(x, y, type);
        }
        
        return sprite;
    }

    createBonusGraphics(x, y, type) {
        switch (type.name) {
            case 'star_coin':
                return this.createStarCoin(x, y, type);
            case 'diamond':
                return this.createDiamond(x, y, type);
            case 'heart':
                return this.createHeart(x, y, type);
            default:
                return this.scene.add.circle(x, y, type.size / 2, type.color);
        }
    }

    createStarCoin(x, y, type) {
        const container = this.scene.add.container(x, y);
        
        // Outer golden circle
        const coin = this.scene.add.circle(0, 0, type.size / 2, 0xffd700);
        coin.setStrokeStyle(2, 0xffef94);
        
        // Inner star
        const star = this.scene.add.graphics();
        star.fillStyle(0xffffff);
        const points = [];
        const outerRadius = type.size / 3;
        const innerRadius = outerRadius * 0.4;
        
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            points.push(Math.cos(angle) * radius);
            points.push(Math.sin(angle) * radius);
        }
        
        star.fillPoints(points);
        
        container.add([coin, star]);
        return container;
    }

    createDiamond(x, y, type) {
        const container = this.scene.add.container(x, y);
        
        // Diamond shape
        const diamond = this.scene.add.graphics();
        diamond.fillStyle(type.color);
        diamond.fillPoints([
            0, -type.size/2,    // top
            type.size/3, 0,     // right
            0, type.size/2,     // bottom
            -type.size/3, 0     // left
        ]);
        diamond.setStrokeStyle(2, 0xffffff, 0.8);
        diamond.strokePoints([
            0, -type.size/2,
            type.size/3, 0,
            0, type.size/2,
            -type.size/3, 0,
            0, -type.size/2     // close path
        ]);
        
        // Inner sparkle
        const sparkle = this.scene.add.graphics();
        sparkle.fillStyle(0xffffff, 0.6);
        sparkle.fillPoints([
            0, -type.size/4,
            type.size/6, 0,
            0, type.size/4,
            -type.size/6, 0
        ]);
        
        container.add([diamond, sparkle]);
        return container;
    }

    createHeart(x, y, type) {
        const container = this.scene.add.container(x, y);
        
        // Heart shape using graphics
        const heart = this.scene.add.graphics();
        heart.fillStyle(type.color);
        
        const size = type.size / 2;
        // Draw heart shape
        heart.beginPath();
        heart.moveTo(0, size * 0.3);
        
        // Left curve
        heart.arc(-size * 0.3, -size * 0.1, size * 0.4, 0, Math.PI, false);
        // Right curve
        heart.arc(size * 0.3, -size * 0.1, size * 0.4, 0, Math.PI, false);
        
        heart.lineTo(0, size * 0.8);  // Bottom point
        heart.closePath();
        heart.fillPath();
        
        // Heart outline
        heart.lineStyle(2, 0xffffff, 0.8);
        heart.strokePath();
        
        // Inner highlight
        const highlight = this.scene.add.graphics();
        highlight.fillStyle(0xffffff, 0.4);
        highlight.fillCircle(-size * 0.2, -size * 0.2, size * 0.15);
        
        container.add([heart, highlight]);
        return container;
    }

    setupPhysics() {
        // Enable physics if available
        if (this.scene.physics && this.scene.physics.world) {
            this.scene.physics.world.enable(this.sprite);
            
            // Set velocity
            this.sprite.body.setVelocityX(-this.type.speed);
            
            // Floating motion
            const floatY = (Math.random() - 0.5) * 30;
            this.sprite.body.setVelocityY(floatY);
            
            // Set collision bounds
            this.sprite.body.setSize(this.type.size * 0.8, this.type.size * 0.8);
        } else {
            // Fallback manual movement
            this.velocity = { x: -this.type.speed, y: (Math.random() - 0.5) * 30 };
        }
    }

    setupBonusAnimations() {
        // Gentle floating motion
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Sparkle rotation
        this.scene.tweens.add({
            targets: this.sprite,
            rotation: Math.PI * 2,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Glow effect
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(deltaTime) {
        if (!this.isActive) return;
        
        // Manual movement if physics not available
        if (!this.sprite.body) {
            this.sprite.x += this.velocity.x * deltaTime / 1000;
            this.sprite.y += this.velocity.y * deltaTime / 1000;
        }
        
        // Check if object is off-screen (left side)
        if (this.sprite.x < -this.type.size) {
            this.destroy();
        }
    }

    checkCollection(playerBounds, playerIsCollecting) {
        if (!this.isActive || this.hasBeenCollected || !playerIsCollecting) return false;
        
        const bonusBounds = this.getBounds();
        
        // More generous collision detection for bonuses
        const collision = (
            bonusBounds.x < playerBounds.x + playerBounds.width + 10 &&
            bonusBounds.x + bonusBounds.width > playerBounds.x - 10 &&
            bonusBounds.y < playerBounds.y + playerBounds.height + 10 &&
            bonusBounds.y + bonusBounds.height > playerBounds.y - 10
        );
        
        if (collision) {
            this.onCollection();
            return true;
        }
        
        return false;
    }

    getBounds() {
        return {
            x: this.sprite.x - this.type.size / 2,
            y: this.sprite.y - this.type.size / 2,
            width: this.type.size,
            height: this.type.size
        };
    }

    onCollection() {
        if (this.hasBeenCollected) return;
        
        this.hasBeenCollected = true;
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Zoom and fade out
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    createCollectionEffect() {
        // Create sparkle particles
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 30;
            const x = this.sprite.x + Math.cos(angle) * distance;
            const y = this.sprite.y + Math.sin(angle) * distance;
            
            const sparkle = this.scene.add.circle(this.sprite.x, this.sprite.y, 2, 0xffffff);
            
            this.scene.tweens.add({
                targets: sparkle,
                x: x,
                y: y,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    sparkle.destroy();
                }
            });
        }
    }

    destroy() {
        this.isActive = false;
        
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    getScore() {
        return this.type.score;
    }
}

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        
        // Visual representation
        this.sprite = this.createSprite();
        
        // Game state
        this.lives = 3;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 1000; // 1 second
        this.isCollectingBonuses = false; // Hands up state
    }

    createSprite() {
        // Use 3D character sprite if available, fallback to realistic 2D
        if (this.scene.textures.exists('female_character_sprite')) {
            const sprite = this.scene.add.image(this.x, this.y, 'female_character_sprite');
            sprite.setDisplaySize(this.width, this.height);
            return sprite;
        } else {
            // Create realistic human-like character
            return this.createRealisticCharacter();
        }
    }

    createRealisticCharacter() {
        const container = this.scene.add.container(this.x, this.y);
        
        // Head
        const head = this.scene.add.circle(0, -this.height/2 - 15, 15, 0xffdbac);
        head.setStrokeStyle(1, 0xd4a574);
        
        // Hair
        const hair = this.scene.add.graphics();
        hair.fillStyle(0x8b4513);
        hair.fillEllipse(0, -this.height/2 - 20, 32, 25);
        
        // Body (torso)
        const torso = this.scene.add.graphics();
        torso.fillStyle(0x4169e1); // Blue shirt
        torso.fillRect(-this.width/3, -this.height/2, this.width*2/3, this.height*2/3);
        
        // Arms
        const leftArm = this.scene.add.graphics();
        leftArm.fillStyle(0xffdbac); // Skin color
        leftArm.fillRect(-this.width/2 - 8, -this.height/3, 12, this.height/2);
        
        const rightArm = this.scene.add.graphics();
        rightArm.fillStyle(0xffdbac);
        rightArm.fillRect(this.width/2 - 4, -this.height/3, 12, this.height/2);
        
        // Legs
        const leftLeg = this.scene.add.graphics();
        leftLeg.fillStyle(0x2f4f4f); // Dark pants
        leftLeg.fillRect(-this.width/4, this.height/4, this.width/4, this.height/3);
        
        const rightLeg = this.scene.add.graphics();
        rightLeg.fillStyle(0x2f4f4f);
        rightLeg.fillRect(0, this.height/4, this.width/4, this.height/3);
        
        // Shoes
        const leftShoe = this.scene.add.graphics();
        leftShoe.fillStyle(0x000000);
        leftShoe.fillEllipse(-this.width/8, this.height/2 + 8, 18, 8);
        
        const rightShoe = this.scene.add.graphics();
        rightShoe.fillStyle(0x000000);
        rightShoe.fillEllipse(this.width/8, this.height/2 + 8, 18, 8);
        
        // Eyes
        const leftEye = this.scene.add.circle(-5, -this.height/2 - 15, 2, 0x000000);
        const rightEye = this.scene.add.circle(5, -this.height/2 - 15, 2, 0x000000);
        
        container.add([
            hair,
            head, 
            torso,
            leftArm, rightArm,
            leftLeg, rightLeg,
            leftShoe, rightShoe,
            leftEye, rightEye
        ]);
        
        return container;
    }

    updatePosition(gamePosition) {
        // Smooth movement to new position
        const targetX = gamePosition.x;
        const targetY = gamePosition.y;
        
        // Kill any existing tweens to prevent conflicts
        this.scene.tweens.killTweensOf(this.sprite);
        
        this.scene.tweens.add({
            targets: this.sprite,
            x: targetX,
            y: targetY,
            duration: 100,
            ease: 'Power1'
        });
        
        // Update internal position immediately for collision detection
        this.x = targetX;
        this.y = targetY;
        
        // Update visual state based on pose
        this.updateVisualState(gamePosition.state, gamePosition.handState);
        
        // Debug: Flash player on position update to show it's working
        if (gamePosition.state !== 'neutral' && Math.random() < 0.1) {
            console.log('🎭 Player state:', gamePosition.state, 'at', Math.round(targetX), Math.round(targetY));
        }
    }

    updateVisualState(state, handState) {
        // Change player appearance based on pose state
        let scale = this.getScaleForState(state);
        
        // Modify scale based on hand state (hands up = bigger for bonus collection)
        if (handState === 'up') {
            scale.x *= 1.4;
            scale.y *= 1.4;
            this.isCollectingBonuses = true;
        } else {
            this.isCollectingBonuses = false;
        }
        
        const tint = this.getTintForState(state, handState);
        
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: scale.x,
            scaleY: scale.y,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        if (this.sprite.getAll) {
            this.sprite.getAll().forEach(child => {
                child.setTint(tint);
            });
        } else {
            this.sprite.setTint(tint);
        }
    }

    getScaleForState(state) {
        switch (state) {
            case 'ducking':
                return { x: 1.4, y: 0.5 }; // More dramatic ducking
            case 'jumping':
                return { x: 0.7, y: 1.6 }; // More dramatic jumping
            case 'leaning_left':
            case 'leaning_right':
                return { x: 1.3, y: 1.1 }; // Bigger leaning effect
            case 'shield':
                return { x: 2.0, y: 1.0 }; // Wide shield stance
            case 'power':
                return { x: 1.5, y: 1.5 }; // Bigger for power mode
            default:
                return { x: 1.0, y: 1.0 };
        }
    }

    getTintForState(state, handState) {
        // Special effects for advanced gestures
        if (handState === 'up') {
            return 0xffd700; // Gold for bonus collection
        }
        if (handState === 'spread') {
            return 0x00ffff; // Cyan for shield mode
        }
        if (handState === 'clap') {
            return 0xff00ff; // Magenta for power mode
        }
        
        switch (state) {
            case 'ducking':
                return 0x4ecdc4; // Cyan
            case 'jumping':
                return 0xffe66d; // Yellow
            case 'leaning_left':
            case 'leaning_right':
                return 0xffa8c5; // Pink
            case 'shield':
                return 0x00ffff; // Cyan shield
            case 'power':
                return 0xff4444; // Red power
            default:
                return 0x4ade80; // Green
        }
    }

    takeDamage() {
        if (this.isInvulnerable) return false;
        
        this.lives--;
        this.makeInvulnerable();
        
        // Flash effect
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.sprite.setAlpha(1);
            }
        });
        
        return true;
    }

    makeInvulnerable() {
        this.isInvulnerable = true;
        
        this.scene.time.delayedCall(this.invulnerabilityTime, () => {
            this.isInvulnerable = false;
        });
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    getLives() {
        return this.lives;
    }

    reset() {
        this.lives = 3;
        this.isInvulnerable = false;
        this.sprite.setAlpha(1);
        this.sprite.setScale(1);
    }
}