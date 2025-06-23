// Main application entry point
console.log('🎮 PushUp Panic - Action Dodge Game');
console.log('📱 Version: 1.0.0');

class App {
    constructor() {
        this.gameManager = null;
        this.performanceManager = null;
        this.isLibrariesLoaded = false;
        this.initializationStarted = false;
        this.performanceMonitorVisible = false;
    }

    async init() {
        if (this.initializationStarted) return;
        this.initializationStarted = true;

        console.log('🚀 Initializing PushUp Panic...');
        
        try {
            // Initialize Performance Manager first
            this.initializePerformanceManager();
            
            // Check library availability
            await this.checkLibraries();
            
            // Initialize game manager
            this.gameManager = new GameManager();
            
            // Start initialization
            const success = await this.gameManager.initialize();
            
            if (success) {
                console.log('🎉 PushUp Panic ready to play!');
                this.displayReadyMessage();
                
                // Setup performance monitoring UI
                this.setupPerformanceUI();
            } else {
                console.warn('⚠️ Initialization completed with warnings');
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.displayErrorMessage(error.message);
        }
    }

    async checkLibraries() {
        console.log('📚 Checking required libraries...');
        
        const checks = [
            { name: 'Phaser 3', check: () => typeof Phaser !== 'undefined', required: true },
            { name: 'TensorFlow.js', check: () => typeof tf !== 'undefined', required: true },
            { name: 'Pose Detection', check: () => typeof poseDetection !== 'undefined', required: true },
            { name: 'WebRTC', check: () => navigator.mediaDevices && navigator.mediaDevices.getUserMedia, required: true },
            { name: 'Canvas', check: () => document.createElement('canvas').getContext, required: true },
            { name: 'ES6 Support', check: () => {
                // Just check for basic features we actually use
                return typeof Promise !== 'undefined' && 
                       typeof Map !== 'undefined' && 
                       typeof Set !== 'undefined' &&
                       typeof document.querySelector !== 'undefined';
            }, required: false }
        ];
        
        const results = checks.map(check => ({
            name: check.name,
            available: check.check(),
            required: check.required
        }));
        
        // Log results
        results.forEach(result => {
            const status = result.available ? '✅' : '❌';
            console.log(`${status} ${result.name}: ${result.available ? 'Available' : 'Missing'}`);
        });
        
        // Check for critical failures
        const criticalFailures = results.filter(r => r.required && !r.available);
        
        if (criticalFailures.length > 0) {
            const missing = criticalFailures.map(f => f.name).join(', ');
            throw new Error(`Critical libraries missing: ${missing}`);
        }
        
        this.isLibrariesLoaded = true;
        console.log('✅ All required libraries are available');
    }

    displayReadyMessage() {
        const gameStatus = document.getElementById('gameStatus');
        if (gameStatus) {
            gameStatus.style.color = '#4ade80';
            gameStatus.innerHTML = '🎯 Bereit zum Spielen!';
        }
        
        // Add subtle animation to start button
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            startBtn.style.animation = 'pulse 2s infinite';
        }
    }

    displayErrorMessage(message) {
        const gameStatus = document.getElementById('gameStatus');
        const gameInstructions = document.getElementById('gameInstructions');
        
        if (gameStatus) {
            gameStatus.style.color = '#ff6b6b';
            gameStatus.innerHTML = '❌ Initialisierung fehlgeschlagen';
        }
        
        if (gameInstructions) {
            gameInstructions.innerHTML = `
                <strong>Fehler:</strong> ${message}<br>
                <small>Bitte Seite neu laden oder Browser wechseln</small>
            `;
            gameInstructions.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
            gameInstructions.style.borderColor = '#dc2626';
        }
        
        // Show troubleshooting info
        this.showTroubleshootingInfo();
    }

    showTroubleshootingInfo() {
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.style.display = 'block';
            debugPanel.innerHTML = `
                <h3>Troubleshooting</h3>
                <div><strong>Browser:</strong> ${navigator.userAgent}</div>
                <div><strong>Platform:</strong> ${navigator.platform}</div>
                <div><strong>HTTPS:</strong> ${location.protocol === 'https:' ? '✅' : '❌'}</div>
                <div><strong>WebGL:</strong> ${this.checkWebGL() ? '✅' : '❌'}</div>
                <div><strong>Empfehlung:</strong> Chrome/Firefox verwenden</div>
            `;
        }
    }

    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    // Performance Manager Integration
    initializePerformanceManager() {
        if (typeof PerformanceManager !== 'undefined') {
            this.performanceManager = new PerformanceManager();
            console.log('⚡ Performance Manager initialized');
            
            // Apply device-based optimizations
            this.applyPerformanceOptimizations();
        } else {
            console.warn('⚠️ Performance Manager not available');
        }
    }

    applyPerformanceOptimizations() {
        if (!this.performanceManager) return;
        
        const capabilities = this.performanceManager.deviceCapabilities;
        
        // Apply CSS classes based on device capabilities
        document.body.classList.add(
            capabilities.isMobile ? 'device-mobile' : 'device-desktop',
            capabilities.isHighPerformance ? 'device-high-perf' : 'device-standard',
            this.performanceManager.settings.effectQuality
        );
        
        // Add performance indicator
        this.createPerformanceIndicator();
    }

    createPerformanceIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'performanceIndicator';
        indicator.className = 'performance-indicator';
        indicator.innerHTML = 'FPS: --';
        document.body.appendChild(indicator);
        
        // Update indicator every second
        setInterval(() => {
            if (this.performanceManager) {
                const metrics = this.performanceManager.getMetrics();
                const fps = Math.round(metrics.averageFPS || metrics.fps);
                
                indicator.innerHTML = `FPS: ${fps}`;
                indicator.className = `performance-indicator ${this.getPerformanceClass(fps)}`;
            }
        }, 1000);
    }

    getPerformanceClass(fps) {
        if (fps >= 50) return 'good';
        if (fps >= 30) return 'medium';
        return 'poor';
    }

    setupPerformanceUI() {
        // Add keyboard shortcut for performance monitor
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                this.togglePerformanceMonitor();
            }
        });
        
        // Add performance monitor button to debug panel
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel && this.performanceManager) {
            const perfButton = document.createElement('button');
            perfButton.textContent = 'Performance Monitor';
            perfButton.style.cssText = `
                margin-top: 10px;
                padding: 5px 10px;
                background: rgba(0, 255, 255, 0.2);
                border: 1px solid #00ffff;
                color: #00ffff;
                border-radius: 5px;
                cursor: pointer;
                font-family: inherit;
                font-size: 0.8rem;
            `;
            perfButton.addEventListener('click', () => this.togglePerformanceMonitor());
            debugPanel.appendChild(perfButton);
        }
    }

    togglePerformanceMonitor() {
        if (!this.performanceManager) return;
        
        let monitor = document.getElementById('performanceMonitor');
        
        if (monitor) {
            monitor.remove();
            this.performanceMonitorVisible = false;
        } else {
            this.createPerformanceMonitor();
            this.performanceMonitorVisible = true;
        }
    }

    createPerformanceMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'performanceMonitor';
        monitor.className = 'performance-monitor';
        
        document.body.appendChild(monitor);
        
        // Update monitor data
        const updateMonitor = () => {
            if (!this.performanceManager || !monitor.parentNode) return;
            
            const metrics = this.performanceManager.getMetrics();
            
            monitor.innerHTML = `
                <h4>Performance Monitor</h4>
                <div class="metric">
                    <span>FPS:</span>
                    <span class="value ${this.getPerformanceClass(metrics.averageFPS)}">${Math.round(metrics.averageFPS || 0)}</span>
                </div>
                <div class="metric">
                    <span>Frame Time:</span>
                    <span class="value">${Math.round(metrics.frameTime || 0)}ms</span>
                </div>
                <div class="metric">
                    <span>Memory:</span>
                    <span class="value">${Math.round(metrics.memoryUsage || 0)}MB</span>
                </div>
                <div class="metric">
                    <span>Quality:</span>
                    <span class="value">${metrics.settings.effectQuality}</span>
                </div>
                <div class="metric">
                    <span>Objects:</span>
                    <span class="value">${metrics.settings.maxObjects}</span>
                </div>
                <div class="metric">
                    <span>Particles:</span>
                    <span class="value">${Math.round(metrics.settings.particleMultiplier * 100)}%</span>
                </div>
            `;
        };
        
        // Update every 500ms
        const updateInterval = setInterval(() => {
            if (monitor.parentNode) {
                updateMonitor();
            } else {
                clearInterval(updateInterval);
            }
        }, 500);
        
        updateMonitor();
    }

    // Global error handler
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('🚨 Global error:', event.error);
            
            // Don't show errors for known issues
            if (event.error && event.error.message) {
                const message = event.error.message.toLowerCase();
                if (message.includes('script error') || message.includes('network error')) {
                    return; // Ignore network/script loading errors
                }
            }
            
            this.displayErrorMessage('Ein unerwarteter Fehler ist aufgetreten');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Unhandled promise rejection:', event.reason);
            
            // Check if it's a known initialization error
            if (event.reason && typeof event.reason === 'string') {
                if (event.reason.includes('pose') || event.reason.includes('camera')) {
                    // Handle gracefully - these are expected in some environments
                    return;
                }
            }
            
            this.displayErrorMessage('Initialisierung nicht vollständig');
        });
    }
}

// Create global app instance
const app = new App();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, starting application...');
    
    // Setup error handling
    app.setupErrorHandling();
    
    // Add small delay to ensure all scripts are loaded
    setTimeout(() => {
        app.init();
    }, 500);
});

// Development helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Development mode detected');
    
    // Make app globally available for debugging
    window.pushUpPanicApp = app;
    
    // Add development shortcuts
    window.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey) {
            switch (event.code) {
                case 'KeyI':
                    // Show/hide debug info
                    event.preventDefault();
                    const debugPanel = document.getElementById('debugPanel');
                    if (debugPanel) {
                        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
                    }
                    break;
                case 'KeyR':
                    // Force reload game
                    event.preventDefault();
                    if (app.gameManager) {
                        app.gameManager.resetGame();
                    }
                    break;
            }
        }
    });
    
    // Performance monitoring
    setInterval(() => {
        if (app.gameManager) {
            const state = app.gameManager.getGameState();
            if (state.fps < 30 && state.isGameRunning) {
                console.warn('⚡ Low FPS detected:', state.fps);
            }
        }
    }, 5000);
}