// Advanced Visual Effects System for PushUp Panic
// Cyberpunk-style effects with performance optimization

class VisualEffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.effectPools = new Map();
        this.activeEffects = [];
        this.screenEffects = {
            chromatic: false,
            screenShake: false,
            scanlines: false,
            glitch: false
        };
        
        this.initializeEffectPools();
    }

    initializeEffectPools() {
        // Pool for explosion particles
        this.effectPools.set('explosion', []);
        this.effectPools.set('trail', []);
        this.effectPools.set('shockwave', []);
        this.effectPools.set('sparks', []);
        this.effectPools.set('hologram', []);
        
        console.log('✨ Visual Effects Manager initialized');
    }

    // Enhanced Collision Explosion
    createCyberpunkExplosion(x, y, color = 0xff0080, intensity = 1.0) {
        const effects = [];
        
        // Main explosion flash
        const flash = this.scene.add.circle(x, y, 0, 0xffffff, 0.8);
        this.scene.tweens.add({
            targets: flash,
            radius: 100 * intensity,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });

        // Neon particle burst
        for (let i = 0; i < 12 * intensity; i++) {
            const angle = (i / (12 * intensity)) * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const speed = 200 + Math.random() * 300;
            
            const particle = this.scene.add.rectangle(x, y, 4, 20, color);
            particle.setRotation(angle);
            
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;
            
            this.scene.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: 400 + Math.random() * 200,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
            
            effects.push(particle);
        }

        // Electric arcs
        this.createElectricArcs(x, y, intensity);
        
        // Shockwave
        this.createShockwave(x, y, intensity);
        
        // Screen shake
        this.triggerScreenShake(intensity * 0.5);
        
        return effects;
    }

    // Electric Arc Effects
    createElectricArcs(x, y, intensity = 1.0) {
        const numArcs = Math.floor(4 * intensity);
        
        for (let i = 0; i < numArcs; i++) {
            const arc = this.scene.add.graphics({ x, y });
            arc.lineStyle(2 + Math.random() * 3, 0x00ffff, 0.8);
            
            // Create jagged electric arc
            const segments = 8;
            const radius = 60 * intensity;
            const angle = (i / numArcs) * Math.PI * 2;
            
            arc.beginPath();
            arc.moveTo(0, 0);
            
            for (let j = 1; j <= segments; j++) {
                const segmentAngle = angle + (Math.random() - 0.5) * 0.5;
                const segmentRadius = (j / segments) * radius;
                const jitter = (Math.random() - 0.5) * 20;
                
                const px = Math.cos(segmentAngle) * segmentRadius + jitter;
                const py = Math.sin(segmentAngle) * segmentRadius + jitter;
                
                arc.lineTo(px, py);
            }
            
            arc.strokePath();
            
            // Animate arc
            this.scene.tweens.add({
                targets: arc,
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 300,
                ease: 'Power2',
                onComplete: () => arc.destroy()
            });
        }
    }

    // Shockwave Effect
    createShockwave(x, y, intensity = 1.0) {
        const shockwave = this.scene.add.graphics({ x, y });
        
        const colors = [0xff0080, 0x00ffff, 0xffff00];
        colors.forEach((color, index) => {
            shockwave.lineStyle(3 - index, color, 0.6 - index * 0.2);
            shockwave.strokeCircle(0, 0, 10);
        });
        
        this.scene.tweens.add({
            targets: shockwave,
            scaleX: 8 * intensity,
            scaleY: 8 * intensity,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => shockwave.destroy()
        });
    }

    // Screen Shake Effect
    triggerScreenShake(intensity = 1.0) {
        if (this.screenEffects.screenShake) return;
        
        this.screenEffects.screenShake = true;
        const camera = this.scene.cameras.main;
        const originalX = camera.scrollX;
        const originalY = camera.scrollY;
        
        const shakeAmount = 10 * intensity;
        const duration = 300;
        const intervals = 20;
        
        let shakeCount = 0;
        const shakeTimer = this.scene.time.addEvent({
            delay: duration / intervals,
            repeat: intervals,
            callback: () => {
                if (shakeCount % 2 === 0) {
                    camera.setScroll(
                        originalX + (Math.random() - 0.5) * shakeAmount,
                        originalY + (Math.random() - 0.5) * shakeAmount
                    );
                } else {
                    camera.setScroll(originalX, originalY);
                }
                shakeCount++;
            },
            callbackScope: this
        });
        
        this.scene.time.delayedCall(duration, () => {
            camera.setScroll(originalX, originalY);
            this.screenEffects.screenShake = false;
        });
    }

    // Trail Effect for Moving Objects
    createNeonTrail(object, color = 0x00ffff, length = 5) {
        if (!object.trailPoints) {
            object.trailPoints = [];
        }
        
        // Add current position to trail
        object.trailPoints.push({ x: object.x, y: object.y });
        
        // Limit trail length
        if (object.trailPoints.length > length) {
            object.trailPoints.shift();
        }
        
        // Clear previous trail graphics
        if (object.trailGraphics) {
            object.trailGraphics.destroy();
        }
        
        // Create new trail graphics
        object.trailGraphics = this.scene.add.graphics();
        
        if (object.trailPoints.length > 1) {
            for (let i = 1; i < object.trailPoints.length; i++) {
                const alpha = i / object.trailPoints.length;
                const width = (i / object.trailPoints.length) * 8;
                
                object.trailGraphics.lineStyle(width, color, alpha * 0.8);
                object.trailGraphics.lineBetween(
                    object.trailPoints[i-1].x, object.trailPoints[i-1].y,
                    object.trailPoints[i].x, object.trailPoints[i].y
                );
            }
        }
        
        object.trailGraphics.setDepth(-1);
    }

    // Hologram Effect for Player
    createHologramEffect(object, duration = 2000) {
        if (!object.sprite) return;
        
        // Create hologram duplicate
        const hologram = this.scene.add.image(object.sprite.x, object.sprite.y, object.sprite.texture.key);
        hologram.setDisplaySize(object.sprite.displayWidth, object.sprite.displayHeight);
        hologram.setTint(0x00ffff);
        hologram.setAlpha(0.3);
        hologram.setBlendMode(Phaser.BlendModes.ADD);
        
        // Animate hologram
        this.scene.tweens.add({
            targets: hologram,
            y: hologram.y - 50,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: duration,
            ease: 'Power2',
            onComplete: () => hologram.destroy()
        });
        
        // Add scanline effect
        const scanline = this.scene.add.rectangle(hologram.x, hologram.y - 50, hologram.displayWidth, 2, 0x00ffff, 0.8);
        this.scene.tweens.add({
            targets: scanline,
            y: hologram.y + 50,
            alpha: 0,
            duration: duration * 0.8,
            ease: 'Linear',
            onComplete: () => scanline.destroy()
        });
    }

    // Energy Shield Effect
    createEnergyShield(x, y, radius = 50, duration = 1000) {
        const shield = this.scene.add.graphics({ x, y });
        
        // Multi-layered shield
        const layers = [
            { color: 0x00ffff, alpha: 0.8, thickness: 3 },
            { color: 0xff0080, alpha: 0.6, thickness: 2 },
            { color: 0xffffff, alpha: 0.4, thickness: 1 }
        ];
        
        layers.forEach((layer, index) => {
            shield.lineStyle(layer.thickness, layer.color, layer.alpha);
            shield.strokeCircle(0, 0, radius + index * 5);
        });
        
        // Pulse animation
        this.scene.tweens.add({
            targets: shield,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => shield.destroy()
        });
        
        // Add rotating hex pattern
        const hexPattern = this.scene.add.graphics({ x, y });
        hexPattern.lineStyle(1, 0x00ffff, 0.5);
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x1 = Math.cos(angle) * radius * 0.7;
            const y1 = Math.sin(angle) * radius * 0.7;
            const x2 = Math.cos(angle + Math.PI / 3) * radius * 0.7;
            const y2 = Math.sin(angle + Math.PI / 3) * radius * 0.7;
            
            hexPattern.lineBetween(x1, y1, x2, y2);
        }
        
        this.scene.tweens.add({
            targets: hexPattern,
            rotation: Math.PI * 2,
            alpha: 0,
            duration: duration,
            ease: 'Linear',
            onComplete: () => hexPattern.destroy()
        });
    }

    // Power-up Collection Effect
    createPowerUpEffect(x, y, color = 0xffd700) {
        // Burst of stars
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 40;
            const star = this.createStar(x, y, 6, color);
            
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;
            
            this.scene.tweens.add({
                targets: star,
                x: targetX,
                y: targetY,
                rotation: Math.PI * 2,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => star.destroy()
            });
        }
        
        // Upward energy beam
        const beam = this.scene.add.rectangle(x, y, 4, 100, color, 0.8);
        beam.setOrigin(0.5, 1);
        
        this.scene.tweens.add({
            targets: beam,
            scaleY: 3,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
            onComplete: () => beam.destroy()
        });
    }

    // Helper: Create Star Shape
    createStar(x, y, size, color) {
        const star = this.scene.add.graphics({ x, y });
        star.fillStyle(color, 0.8);
        star.lineStyle(1, 0xffffff, 0.6);
        
        const points = [];
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            points.push(Math.cos(angle) * radius);
            points.push(Math.sin(angle) * radius);
        }
        
        star.fillPoints(points);
        star.strokePoints(points);
        
        return star;
    }

    // Chromatic Aberration Effect
    toggleChromaticAberration(enable = true, intensity = 0.005) {
        this.screenEffects.chromatic = enable;
        
        if (enable && this.scene.cameras.main.postFX) {
            // Add chromatic aberration shader if available
            console.log('🌈 Chromatic aberration effect enabled');
        }
    }

    // Glitch Effect
    triggerGlitchEffect(duration = 500) {
        if (this.screenEffects.glitch) return;
        
        this.screenEffects.glitch = true;
        const camera = this.scene.cameras.main;
        
        // Create glitch overlay
        const glitchOverlay = this.scene.add.rectangle(
            camera.centerX, camera.centerY,
            camera.width, camera.height,
            0x00ffff, 0.1
        );
        glitchOverlay.setScrollFactor(0);
        glitchOverlay.setDepth(1000);
        
        // Glitch animation
        this.scene.tweens.add({
            targets: glitchOverlay,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                glitchOverlay.destroy();
                this.screenEffects.glitch = false;
            }
        });
        
        // Random position jumps
        let jumpCount = 0;
        const jumpTimer = this.scene.time.addEvent({
            delay: 50,
            repeat: Math.floor(duration / 50),
            callback: () => {
                if (jumpCount % 3 === 0) {
                    glitchOverlay.setPosition(
                        camera.centerX + (Math.random() - 0.5) * 20,
                        camera.centerY + (Math.random() - 0.5) * 20
                    );
                }
                jumpCount++;
            }
        });
    }

    // Cleanup
    destroy() {
        this.activeEffects.forEach(effect => {
            if (effect && effect.destroy) {
                effect.destroy();
            }
        });
        
        this.activeEffects = [];
        this.effectPools.clear();
        
        console.log('🧹 Visual Effects Manager destroyed');
    }
}

// Export for global use
window.VisualEffectsManager = VisualEffectsManager;