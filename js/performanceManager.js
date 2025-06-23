// Advanced Performance Manager for PushUp Panic
// Handles optimization, adaptive rendering, and performance monitoring

class PerformanceManager {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            averageFPS: 0,
            renderTime: 0,
            updateTime: 0
        };
        
        this.settings = {
            targetFPS: 60,
            maxObjects: 50,
            particleMultiplier: 1.0,
            effectQuality: 'high', // high, medium, low
            autoAdjust: true,
            adaptiveRendering: true
        };
        
        this.performance = {
            frameHistory: [],
            maxFrameHistory: 60,
            lastOptimization: 0,
            optimizationCooldown: 2000,
            lowPerformanceThreshold: 30,
            highPerformanceThreshold: 55
        };
        
        this.objectPools = new Map();
        this.effectQueue = [];
        this.isMonitoring = false;
        
        this.init();
    }

    init() {
        this.setupObjectPools();
        this.startPerformanceMonitoring();
        this.setupAdaptiveRendering();
        
        console.log('⚡ Performance Manager initialized');
    }

    // Object Pooling System
    setupObjectPools() {
        // Pool for particles
        this.createPool('particles', 200, () => ({
            active: false,
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 0, maxLife: 1000,
            color: 0xffffff,
            size: 1,
            alpha: 1,
            sprite: null
        }));
        
        // Pool for flying objects
        this.createPool('flyingObjects', 50, () => ({
            active: false,
            sprite: null,
            type: null,
            velocity: { x: 0, y: 0 },
            created: 0
        }));
        
        // Pool for effects
        this.createPool('effects', 100, () => ({
            active: false,
            type: '',
            x: 0, y: 0,
            duration: 0,
            startTime: 0,
            data: {}
        }));
        
        console.log('🔄 Object pools initialized');
    }

    createPool(name, size, factory) {
        const pool = [];
        for (let i = 0; i < size; i++) {
            pool.push(factory());
        }
        this.objectPools.set(name, pool);
        console.log(`📦 Created ${name} pool with ${size} objects`);
    }

    getFromPool(poolName) {
        const pool = this.objectPools.get(poolName);
        if (!pool) return null;
        
        for (let obj of pool) {
            if (!obj.active) {
                obj.active = true;
                return obj;
            }
        }
        
        // Pool exhausted, reuse oldest object
        if (pool.length > 0) {
            const obj = pool[0];
            this.resetPoolObject(obj);
            obj.active = true;
            return obj;
        }
        
        return null;
    }

    returnToPool(poolName, obj) {
        if (obj) {
            obj.active = false;
            this.resetPoolObject(obj);
        }
    }

    resetPoolObject(obj) {
        // Reset common properties
        if (obj.sprite && obj.sprite.destroy) {
            obj.sprite.destroy();
            obj.sprite = null;
        }
        
        Object.keys(obj).forEach(key => {
            if (key !== 'active' && typeof obj[key] !== 'function') {
                if (typeof obj[key] === 'number') {
                    obj[key] = 0;
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (Array.isArray(obj[key])) {
                        obj[key].length = 0;
                    } else {
                        Object.keys(obj[key]).forEach(subKey => {
                            obj[key][subKey] = 0;
                        });
                    }
                }
            }
        });
    }

    // Performance Monitoring
    startPerformanceMonitoring() {
        this.isMonitoring = true;
        this.monitoringLoop();
    }

    monitoringLoop() {
        if (!this.isMonitoring) return;
        
        const now = performance.now();
        
        // Calculate frame time
        if (this.lastFrameTime) {
            const frameTime = now - this.lastFrameTime;
            this.metrics.frameTime = frameTime;
            this.metrics.fps = 1000 / frameTime;
            
            // Add to frame history
            this.performance.frameHistory.push(this.metrics.fps);
            if (this.performance.frameHistory.length > this.performance.maxFrameHistory) {
                this.performance.frameHistory.shift();
            }
            
            // Calculate average FPS
            this.metrics.averageFPS = this.performance.frameHistory.reduce((sum, fps) => sum + fps, 0) / this.performance.frameHistory.length;
        }
        
        this.lastFrameTime = now;
        
        // Memory monitoring
        if (performance.memory) {
            this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        
        // Auto-adjust performance if enabled
        if (this.settings.autoAdjust) {
            this.checkPerformanceAndAdjust();
        }
        
        requestAnimationFrame(() => this.monitoringLoop());
    }

    checkPerformanceAndAdjust() {
        const now = performance.now();
        
        // Cooldown check
        if (now - this.performance.lastOptimization < this.performance.optimizationCooldown) {
            return;
        }
        
        const avgFPS = this.metrics.averageFPS;
        
        if (avgFPS < this.performance.lowPerformanceThreshold) {
            this.optimizeForLowPerformance();
            this.performance.lastOptimization = now;
        } else if (avgFPS > this.performance.highPerformanceThreshold && this.settings.effectQuality !== 'high') {
            this.optimizeForHighPerformance();
            this.performance.lastOptimization = now;
        }
    }

    optimizeForLowPerformance() {
        console.log('📉 Low performance detected, optimizing...');
        
        if (this.settings.effectQuality === 'high') {
            this.settings.effectQuality = 'medium';
            this.settings.particleMultiplier = 0.7;
            this.settings.maxObjects = 30;
        } else if (this.settings.effectQuality === 'medium') {
            this.settings.effectQuality = 'low';
            this.settings.particleMultiplier = 0.4;
            this.settings.maxObjects = 20;
        }
        
        this.applyQualitySettings();
        this.showPerformanceNotification('Performance optimized for better FPS', 'info');
    }

    optimizeForHighPerformance() {
        console.log('📈 High performance detected, enhancing quality...');
        
        if (this.settings.effectQuality === 'low') {
            this.settings.effectQuality = 'medium';
            this.settings.particleMultiplier = 0.7;
            this.settings.maxObjects = 35;
        } else if (this.settings.effectQuality === 'medium') {
            this.settings.effectQuality = 'high';
            this.settings.particleMultiplier = 1.0;
            this.settings.maxObjects = 50;
        }
        
        this.applyQualitySettings();
        this.showPerformanceNotification('Enhanced visual effects enabled', 'success');
    }

    applyQualitySettings() {
        // Apply quality settings to game systems
        if (window.gameManager && window.gameManager.gameScene) {
            const scene = window.gameManager.gameScene;
            
            // Adjust particle systems
            if (scene.visualEffects) {
                scene.visualEffects.particleMultiplier = this.settings.particleMultiplier;
                scene.visualEffects.effectQuality = this.settings.effectQuality;
            }
            
            // Adjust object limits
            scene.maxFlyingObjects = this.settings.maxObjects;
        }
        
        console.log(`🎮 Quality settings applied: ${this.settings.effectQuality} (${this.settings.particleMultiplier}x particles)`);
    }

    // Adaptive Rendering
    setupAdaptiveRendering() {
        if (!this.settings.adaptiveRendering) return;
        
        // Monitor device capabilities
        this.deviceCapabilities = {
            isHighPerformance: this.detectHighPerformanceDevice(),
            isMobile: this.detectMobileDevice(),
            supportedFeatures: this.detectSupportedFeatures()
        };
        
        // Adjust initial settings based on device
        this.adjustForDevice();
        
        console.log('📱 Adaptive rendering configured:', this.deviceCapabilities);
    }

    detectHighPerformanceDevice() {
        // Simple heuristic based on screen size and hardware concurrency
        const screenArea = window.screen.width * window.screen.height;
        const cores = navigator.hardwareConcurrency || 4;
        
        return screenArea > 1920 * 1080 && cores >= 8;
    }

    detectMobileDevice() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectSupportedFeatures() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        return {
            webgl2: !!canvas.getContext('webgl2'),
            webgl: !!gl,
            offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
            performanceObserver: typeof PerformanceObserver !== 'undefined'
        };
    }

    adjustForDevice() {
        if (this.deviceCapabilities.isMobile) {
            // Mobile optimizations
            this.settings.effectQuality = 'medium';
            this.settings.particleMultiplier = 0.6;
            this.settings.maxObjects = 25;
            this.settings.targetFPS = 30;
        } else if (this.deviceCapabilities.isHighPerformance) {
            // High-end desktop optimizations
            this.settings.effectQuality = 'high';
            this.settings.particleMultiplier = 1.2;
            this.settings.maxObjects = 60;
            this.settings.targetFPS = 60;
        }
        
        this.applyQualitySettings();
    }

    // Effect Batching
    batchEffects(effects) {
        // Group effects by type for efficient rendering
        const batches = new Map();
        
        effects.forEach(effect => {
            if (!batches.has(effect.type)) {
                batches.set(effect.type, []);
            }
            batches.get(effect.type).push(effect);
        });
        
        return batches;
    }

    // Resource Management
    preloadResources(resourceList) {
        const promises = resourceList.map(resource => {
            return new Promise((resolve, reject) => {
                if (resource.type === 'texture') {
                    const img = new Image();
                    img.onload = () => resolve(resource);
                    img.onerror = () => reject(resource);
                    img.src = resource.url;
                } else {
                    resolve(resource);
                }
            });
        });
        
        return Promise.allSettled(promises);
    }

    // Memory Management
    cleanup() {
        // Clean up object pools
        this.objectPools.forEach((pool, name) => {
            pool.forEach(obj => {
                if (obj.sprite && obj.sprite.destroy) {
                    obj.sprite.destroy();
                }\n            });\n            pool.length = 0;\n        });\n        \n        // Clear effect queue\n        this.effectQueue.length = 0;\n        \n        // Stop monitoring\n        this.isMonitoring = false;\n        \n        console.log('🧹 Performance Manager cleaned up');\n    }\n\n    // Utility Methods\n    showPerformanceNotification(message, type) {\n        if (window.gameManager && window.gameManager.uiManager) {\n            window.gameManager.uiManager.showNotification(message, type, 2000);\n        }\n    }\n\n    getMetrics() {\n        return {\n            ...this.metrics,\n            settings: { ...this.settings },\n            deviceCapabilities: { ...this.deviceCapabilities }\n        };\n    }\n\n    // Performance Hints\n    getPerformanceHints() {\n        const hints = [];\n        \n        if (this.metrics.averageFPS < 30) {\n            hints.push({\n                type: 'warning',\n                message: 'Low FPS detected. Consider reducing visual effects.',\n                action: () => this.optimizeForLowPerformance()\n            });\n        }\n        \n        if (this.metrics.memoryUsage > 100) {\n            hints.push({\n                type: 'warning',\n                message: 'High memory usage detected.',\n                action: () => this.forceGarbageCollection()\n            });\n        }\n        \n        return hints;\n    }\n\n    forceGarbageCollection() {\n        // Force cleanup of unused objects\n        this.objectPools.forEach((pool) => {\n            pool.forEach(obj => {\n                if (!obj.active) {\n                    this.resetPoolObject(obj);\n                }\n            });\n        });\n        \n        // Suggest garbage collection if available\n        if (window.gc) {\n            window.gc();\n        }\n        \n        console.log('🗑️ Forced garbage collection');\n    }\n\n    // Settings Management\n    updateSettings(newSettings) {\n        Object.assign(this.settings, newSettings);\n        this.applyQualitySettings();\n        \n        console.log('⚙️ Performance settings updated:', this.settings);\n    }\n\n    resetToDefaults() {\n        this.settings = {\n            targetFPS: 60,\n            maxObjects: 50,\n            particleMultiplier: 1.0,\n            effectQuality: 'high',\n            autoAdjust: true,\n            adaptiveRendering: true\n        };\n        \n        this.adjustForDevice();\n        console.log('🔄 Performance settings reset to defaults');\n    }\n}\n\n// Export for global use\nwindow.PerformanceManager = PerformanceManager;