class GameManager {
    constructor() {
        // Core systems
        this.webcamManager = null;
        this.poseTracker = null;
        this.phaserGame = null;
        this.gameScene = null;
        
        // UI elements
        this.elements = {
            gameStatus: document.getElementById('gameStatus'),
            gameInstructions: document.getElementById('gameInstructions'),
            startBtn: document.getElementById('startGameBtn'),
            pauseBtn: document.getElementById('pauseGameBtn'),
            resetBtn: document.getElementById('resetGameBtn'),
            
            // Stats
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            
            // Debug
            poseStatus: document.getElementById('poseStatus'),
            playerPos: document.getElementById('playerPos'),
            objectCount: document.getElementById('objectCount'),
            fps: document.getElementById('fps'),
            debugPanel: document.getElementById('debugPanel')
        };
        
        // Game state
        this.isInitialized = false;
        this.isGameRunning = false;
        this.initializationProgress = 0;
        
        // UI Manager
        this.uiManager = null;
        
        // Supabase Manager
        this.supabaseManager = null;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize UI Manager
        this.initializeUIManager();
        
        // Initialize Supabase Manager
        this.initializeSupabaseManager();
        
        console.log('🎮 GameManager created');
    }

    initializeUIManager() {
        if (typeof UIManager !== 'undefined') {
            this.uiManager = new UIManager();
            
            // Add ripple effects to all game buttons
            Object.values(this.elements).forEach(element => {
                if (element && element.classList && element.classList.contains('game-btn')) {
                    this.uiManager.addRippleEffect(element);
                }
            });
            
            console.log('🎨 UI Manager integrated');
        } else {
            console.warn('⚠️ UI Manager not available');
        }
    }

    async initializeSupabaseManager() {
        if (typeof SupabaseManager !== 'undefined') {
            this.supabaseManager = new SupabaseManager();
            
            // Initialize Supabase connection
            const connected = await this.supabaseManager.initialize();
            
            if (connected) {
                console.log('🗄️ Supabase Manager integrated');
            } else {
                console.warn('⚠️ Supabase connection failed - highscores will not be saved');
            }
        } else {
            console.warn('⚠️ Supabase Manager not available');
        }
    }

    setupEventListeners() {
        // Game control buttons with enhanced feedback
        this.elements.startBtn.addEventListener('click', () => {
            this.handleButtonClick(this.elements.startBtn, () => this.startGame());
        });
        
        this.elements.pauseBtn.addEventListener('click', () => {
            this.handleButtonClick(this.elements.pauseBtn, () => this.pauseGame());
        });
        
        this.elements.resetBtn.addEventListener('click', () => {
            this.handleButtonClick(this.elements.resetBtn, () => this.resetGame());
        });
        
        // Add hover effects to stats
        [this.elements.score, this.elements.level, this.elements.lives].forEach(statElement => {
            if (statElement) {
                statElement.parentElement.classList.add('interactive-element');
                if (this.uiManager) {
                    this.uiManager.addRippleEffect(statElement.parentElement);
                }
            }
        });
        
        // Keyboard shortcuts with feedback
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'Space':
                    if (!this.isGameRunning) {
                        event.preventDefault();
                        this.startGame();
                    }
                    break;
                case 'KeyP':
                    if (this.isGameRunning) {
                        event.preventDefault();
                        this.pauseGame();
                    }
                    break;
                case 'KeyR':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.resetGame();
                    }
                    break;
                case 'KeyD':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.toggleDebugPanel();
                    }
                    break;
            }
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isGameRunning) {
                this.pauseGame();
            }
        });
    }
    
    handleButtonClick(button, action) {
        // Add loading state if UI Manager is available
        if (this.uiManager) {
            this.uiManager.setButtonLoading(button, true);
            
            // Execute action with slight delay for visual feedback
            setTimeout(() => {
                try {
                    action();
                } finally {
                    this.uiManager.setButtonLoading(button, false);
                }
            }, 200);
        } else {
            action();
        }
    }

    async initialize() {
        console.log('🚀 Initializing game systems...');
        
        // Show initialization notification
        if (this.uiManager) {
            this.uiManager.showNotification('🚀 Initializing PushUp Panic...', 'info', 5000);
        }
        
        try {
            this.updateStatus('⚡ INITIALIZING WEBCAM ⚡');
            this.initializationProgress = 10;
            
            // Initialize webcam
            this.webcamManager = new WebcamManager();
            await this.webcamManager.initialize();
            this.initializationProgress = 30;
            
            this.updateStatus('⚡ INITIALIZING AI POSE DETECTION ⚡');
            
            // Initialize pose tracker
            this.poseTracker = new PoseTracker();
            const poseInitialized = await this.poseTracker.initialize();
            this.initializationProgress = 60;
            
            if (!poseInitialized) {
                if (this.uiManager) {
                    this.uiManager.showNotification('⚠️ Pose detection failed - using keyboard controls', 'warning', 4000);
                }
                throw new Error('Pose Detection konnte nicht initialisiert werden');
            }
            
            this.updateStatus('⚡ INITIALIZING GAME ENGINE ⚡');
            
            // Initialize Phaser game
            this.initializePhaserGame();
            this.initializationProgress = 90;
            
            // Start pose detection loop
            this.startPoseDetectionLoop();
            this.initializationProgress = 100;
            
            this.isInitialized = true;
            this.updateStatus('⚡ SYSTEM READY - GAME INITIALIZED ⚡');
            this.elements.startBtn.disabled = false;
            
            // Show success notification
            if (this.uiManager) {
                this.uiManager.showNotification('✅ Game ready! Press START to begin', 'success', 3000);
            }
            
            // Hide instructions after successful init
            setTimeout(() => {
                this.elements.gameInstructions.style.opacity = '0.7';
            }, 2000);
            
            console.log('✅ Game systems initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.updateStatus(`Fehler: ${error.message}`);
            this.showFallbackMode();
            return false;
        }
    }

    initializePhaserGame() {
        const gameContainer = document.getElementById('gameContainer');
        const containerRect = gameContainer.getBoundingClientRect();
        
        const config = {
            type: Phaser.AUTO,
            width: containerRect.width,
            height: containerRect.height,
            parent: 'gameContainer',
            backgroundColor: '#0f0f23',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: GameScene,
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };
        
        this.phaserGame = new Phaser.Game(config);
        
        // Get reference to game scene
        this.phaserGame.events.once('ready', () => {
            this.gameScene = this.phaserGame.scene.getScene('GameScene');
            
            if (this.gameScene) {
                this.gameScene.setPoseTracker(this.poseTracker);
                this.gameScene.setGameManager(this);
                console.log('🎮 Phaser game scene connected');
            }
        });
    }

    startPoseDetectionLoop() {
        const detectPoses = async () => {
            if (!this.webcamManager || !this.poseTracker) return;
            
            if (this.webcamManager.isReady() && this.poseTracker.isReady()) {
                try {
                    const videoElement = this.webcamManager.getVideoElement();
                    const poses = await this.poseTracker.detectPoses(videoElement);
                    
                    // Draw pose overlay
                    this.poseTracker.drawPoseOverlay(poses, videoElement);
                    
                    // Update debug info
                    const playerPos = this.poseTracker.getPlayerPosition();
                    this.updateDebugInfo({
                        poseStatus: poses.length > 0 ? '✅' : '❌',
                        playerPos: `${Math.round(playerPos.x * 100)}%, ${Math.round(playerPos.y * 100)}% (${playerPos.state})`
                    });
                    
                } catch (error) {
                    console.error('Pose detection error:', error);
                }
            }
            
            // Continue loop
            requestAnimationFrame(detectPoses);
        };
        
        detectPoses();
    }

    startGame() {
        if (!this.isInitialized) {
            console.warn('Game not initialized yet');
            return;
        }
        
        console.log('🚀 Starting game...');
        
        this.isGameRunning = true;
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.startBtn.textContent = 'Läuft...';
        
        // Update container class for styling
        document.querySelector('.game-container').classList.add('playing');
        
        // Start the game scene
        if (this.gameScene) {
            this.gameScene.startGame();
        }
        
        this.updateStatus('Spiel läuft! Weiche den Objekten aus!');
    }

    pauseGame() {
        if (!this.isGameRunning) return;
        
        console.log('⏸️ Pausing game...');
        
        if (this.gameScene) {
            this.gameScene.pauseGame();
            const isPaused = this.gameScene.isPaused;
            
            this.elements.pauseBtn.textContent = isPaused ? 'Fortsetzen' : 'Pausieren';
            this.updateStatus(isPaused ? 'Spiel pausiert' : 'Spiel läuft!');
            
            // Update container class
            if (isPaused) {
                document.querySelector('.game-container').classList.add('paused');
            } else {
                document.querySelector('.game-container').classList.remove('paused');
            }
        }
    }

    resetGame() {
        console.log('🔄 Resetting game...');
        
        this.isGameRunning = false;
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.startBtn.textContent = 'Spiel starten';
        this.elements.pauseBtn.textContent = 'Pausieren';
        
        // Reset UI
        this.updateScore(0);
        this.updateLevel(1);
        this.updateLives(3);
        
        // Update container class
        const container = document.querySelector('.game-container');
        container.classList.remove('playing', 'paused', 'game-over');
        
        // Reset game scene
        if (this.gameScene) {
            this.gameScene.stopGame();
        }
        
        this.updateStatus('Bereit zum Spielen!');
    }

    async gameOver(finalScore) {
        console.log('💀 Game Over! Score:', finalScore);
        
        this.isGameRunning = false;
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.startBtn.textContent = 'Neu starten';
        
        // Update container class
        document.querySelector('.game-container').classList.add('game-over');
        
        // Submit highscore
        await this.submitHighscore(finalScore);
        
        this.updateStatus(`Game Over! Punkte: ${finalScore}`);
    }

    async submitHighscore(score) {
        if (!this.supabaseManager || !this.supabaseManager.isReady()) {
            console.warn('⚠️ Cannot submit highscore - Supabase not available');
            return;
        }

        try {
            // Get player name (simple prompt for now)
            const playerName = prompt('🏆 Neuer Highscore! Gib deinen Namen ein:', 'Anonymous') || 'Anonymous';
            
            const level = this.gameScene ? this.gameScene.level : 1;
            
            const success = await this.supabaseManager.submitHighscore(playerName, score, level);
            
            if (success) {
                const rank = await this.supabaseManager.getPlayerRank(score);
                const rankText = rank ? ` (Platz ${rank})` : '';
                
                if (this.uiManager) {
                    this.uiManager.showNotification(
                        `🏆 Highscore gespeichert!${rankText}`, 
                        'success', 
                        4000
                    );
                } else {
                    alert(`🏆 Highscore gespeichert!${rankText}`);
                }
                
                // Show highscores
                this.displayHighscores();
            } else {
                if (this.uiManager) {
                    this.uiManager.showNotification('❌ Fehler beim Speichern des Highscores', 'error', 3000);
                } else {
                    alert('❌ Fehler beim Speichern des Highscores');
                }
            }
        } catch (error) {
            console.error('❌ Error in submitHighscore:', error);
        }
    }

    async displayHighscores() {
        if (!this.supabaseManager || !this.supabaseManager.isReady()) {
            return;
        }

        try {
            const highscores = await this.supabaseManager.getHighscores(5);
            
            if (highscores.length > 0) {
                let highscoreText = '🏆 TOP 5 HIGHSCORES:\n\n';
                highscores.forEach((score, index) => {
                    const date = new Date(score.created_at).toLocaleDateString('de-DE');
                    highscoreText += `${index + 1}. ${score.player_name}: ${score.score} Punkte (Level ${score.level}) - ${date}\n`;
                });
                
                setTimeout(() => {
                    alert(highscoreText);
                }, 1000);
            }
        } catch (error) {
            console.error('❌ Error displaying highscores:', error);
        }
    }

    showFallbackMode() {
        // Enable keyboard controls as fallback
        this.updateStatus('Pose Detection nicht verfügbar - Verwende Pfeiltasten');
        this.elements.gameInstructions.innerHTML = `
            <strong>Fallback-Modus aktiviert</strong><br>
            Verwende die Pfeiltasten oder WASD zum Bewegen<br>
            LEERTASTE zum Starten • P zum Pausieren
        `;
        
        this.elements.startBtn.disabled = false;
    }

    // UI Update methods
    updateStatus(message) {
        this.elements.gameStatus.textContent = message;
    }

    updateScore(score) {
        this.elements.score.textContent = score;
        this.elements.score.classList.add('updated');
        setTimeout(() => {
            this.elements.score.classList.remove('updated');
        }, 300);
    }

    updateLevel(level) {
        this.elements.level.textContent = level;
        this.elements.level.classList.add('updated');
        setTimeout(() => {
            this.elements.level.classList.remove('updated');
        }, 300);
    }

    updateLives(lives) {
        this.elements.lives.textContent = lives;
        this.elements.lives.classList.add('updated');
        setTimeout(() => {
            this.elements.lives.classList.remove('updated');
        }, 300);
    }

    updateDebugInfo(info) {
        Object.entries(info).forEach(([key, value]) => {
            if (this.elements[key]) {
                this.elements[key].textContent = value;
            }
        });
    }

    toggleDebugPanel() {
        const panel = this.elements.debugPanel;
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    // Cleanup
    cleanup() {
        console.log('🧹 Cleaning up game systems...');
        
        if (this.webcamManager) {
            this.webcamManager.stop();
        }
        
        if (this.phaserGame) {
            this.phaserGame.destroy(true);
        }
    }

    // Public API
    getGameState() {
        if (this.gameScene) {
            return this.gameScene.getGameState();
        }
        
        return {
            isInitialized: this.isInitialized,
            isGameRunning: this.isGameRunning,
            initializationProgress: this.initializationProgress
        };
    }
}