// 🎨 SIMPLE GRAPHICS SYSTEM - Clean Restart
// Senior Developer Approach: Minimal, Functional, Maintainable

class SimplePlayer {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        
        // Simple states
        this.state = 'idle';
        this.isCollecting = false;
        
        // Create simple stick figure sprite
        this.sprite = this.createStickFigure();
        
        console.log('✅ Simple Player created at:', x, y);
    }
    
    createStickFigure() {
        // Create a simple 2D stick figure using graphics
        const graphics = this.scene.add.graphics();
        
        // Head (circle)
        graphics.fillStyle(0x000000);
        graphics.fillCircle(0, -25, 8);
        
        // Body (line)
        graphics.lineStyle(3, 0x000000);
        graphics.beginPath();
        graphics.moveTo(0, -17);
        graphics.lineTo(0, 10);
        graphics.strokePath();
        
        // Arms (lines) - default position
        graphics.beginPath();
        graphics.moveTo(0, -10);
        graphics.lineTo(-15, 0);
        graphics.moveTo(0, -10);
        graphics.lineTo(15, 0);
        graphics.strokePath();
        
        // Legs (lines)
        graphics.beginPath();
        graphics.moveTo(0, 10);
        graphics.lineTo(-10, 25);
        graphics.moveTo(0, 10);
        graphics.lineTo(10, 25);
        graphics.strokePath();
        
        graphics.x = this.x;
        graphics.y = this.y;
        
        return graphics;
    }
    
    updateState(newState) {
        if (this.state === newState) return;
        
        this.state = newState;
        this.redrawCharacter();
        
        console.log('🎭 Player state changed to:', newState);
    }
    
    redrawCharacter() {
        // Clear previous drawing
        this.sprite.clear();
        
        // Base color based on state
        let color = 0x000000; // Black default
        switch (this.state) {
            case 'jumping': color = 0xffff00; break; // Yellow
            case 'ducking': color = 0x00ffff; break; // Cyan
            case 'collecting': color = 0xffd700; break; // Gold
            case 'moving_left': color = 0xff8888; break; // Light red
            case 'moving_right': color = 0x8888ff; break; // Light blue
        }
        
        this.sprite.fillStyle(color);
        this.sprite.lineStyle(3, color);
        
        // Head
        this.sprite.fillCircle(0, -25, 8);
        
        // Body
        this.sprite.beginPath();
        this.sprite.moveTo(0, -17);
        if (this.state === 'ducking') {
            // Shorter body when ducking
            this.sprite.lineTo(0, 5);
        } else if (this.state === 'jumping') {
            // Normal body, but different leg position
            this.sprite.lineTo(0, 10);
        } else {
            this.sprite.lineTo(0, 10);
        }
        this.sprite.strokePath();
        
        // Arms based on state
        this.sprite.beginPath();
        this.sprite.moveTo(0, -10);
        
        if (this.state === 'collecting') {
            // Arms up
            this.sprite.lineTo(-10, -20);
            this.sprite.moveTo(0, -10);
            this.sprite.lineTo(10, -20);
        } else if (this.state === 'jumping') {
            // Arms slightly up
            this.sprite.lineTo(-12, -15);
            this.sprite.moveTo(0, -10);
            this.sprite.lineTo(12, -15);
        } else {
            // Arms normal
            this.sprite.lineTo(-15, 0);
            this.sprite.moveTo(0, -10);
            this.sprite.lineTo(15, 0);
        }
        this.sprite.strokePath();
        
        // Legs based on state
        this.sprite.beginPath();
        this.sprite.moveTo(0, 10);
        
        if (this.state === 'jumping') {
            // Legs up
            this.sprite.lineTo(-8, 15);
            this.sprite.moveTo(0, 10);
            this.sprite.lineTo(8, 15);
        } else if (this.state === 'ducking') {
            // Legs bent
            this.sprite.lineTo(-12, 20);
            this.sprite.moveTo(0, 10);
            this.sprite.lineTo(12, 20);
        } else {
            // Legs normal
            this.sprite.lineTo(-10, 25);
            this.sprite.moveTo(0, 10);
            this.sprite.lineTo(10, 25);
        }
        this.sprite.strokePath();
    }
    
    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.sprite.x = x;
        this.sprite.y = y;
    }
    
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}

class SimpleObstacle {
    constructor(scene, x, y, type = 'box') {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = 200;
        this.isActive = true;
        
        this.sprite = this.createSimpleSprite();
    }
    
    createSimpleSprite() {
        const graphics = this.scene.add.graphics();
        
        switch (this.type) {
            case 'box':
                graphics.fillStyle(0xff4444);
                graphics.fillRect(-15, -15, 30, 30);
                graphics.lineStyle(2, 0x000000);
                graphics.strokeRect(-15, -15, 30, 30);
                break;
                
            case 'circle':
                graphics.fillStyle(0x44ff44);
                graphics.fillCircle(0, 0, 15);
                graphics.lineStyle(2, 0x000000);
                graphics.strokeCircle(0, 0, 15);
                break;
                
            default:
                graphics.fillStyle(0x4444ff);
                graphics.fillTriangle(-15, 15, 0, -15, 15, 15);
                graphics.lineStyle(2, 0x000000);
                graphics.strokeTriangle(-15, 15, 0, -15, 15, 15);
        }
        
        graphics.x = this.x;
        graphics.y = this.y;
        
        return graphics;
    }
    
    update(delta) {
        if (!this.isActive) return;
        
        // Move left
        this.x -= this.speed * delta / 1000;
        this.sprite.x = this.x;
        
        // Remove if off-screen
        if (this.x < -50) {
            this.destroy();
        }
    }
    
    checkCollision(playerBounds) {
        if (!this.isActive) return false;
        
        const myBounds = {
            x: this.x - 15,
            y: this.y - 15,
            width: 30,
            height: 30
        };
        
        return (
            myBounds.x < playerBounds.x + playerBounds.width &&
            myBounds.x + myBounds.width > playerBounds.x &&
            myBounds.y < playerBounds.y + playerBounds.height &&
            myBounds.y + myBounds.height > playerBounds.y
        );
    }
    
    destroy() {
        this.isActive = false;
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}

// Export classes
window.SimplePlayer = SimplePlayer;
window.SimpleObstacle = SimpleObstacle;

console.log('🎨 Simple Graphics System loaded - Clean & Minimal');