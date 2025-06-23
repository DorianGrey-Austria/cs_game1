class Game {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.elapsedTime = 0;
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.fps = 0;
        this.poseDetectionEnabled = false;
        this.debugMode = false;
        
        this.elements = {
            status: document.getElementById('status'),
            pushupCount: document.getElementById('pushupCount'),
            timer: document.getElementById('timer'),
            poseStatus: document.getElementById('poseStatus'),
            feedback: document.getElementById('feedback'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn')
        };
        
        this.camera = new CameraManager();
        this.poseDetector = new PoseDetector();
        this.pushupTracker = new PushUpTracker();
        
        this.setupEventListeners();
        this.setupPushUpCallbacks();
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => {
            if (this.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.reset();
        });
    }

    setupPushUpCallbacks() {
        this.pushupTracker.setCallback('onPushUpComplete', (count) => {
            this.updateUI({
                pushupCount: count,
                feedback: `🎉 Push-Up #${count} geschafft!`
            });
            
            this.showSuccessFeedback();
        });

        this.pushupTracker.setCallback('onPositionChange', (position) => {
            this.updatePoseStatus(position);
        });
    }

    async initialize() {
        console.log('🎮 Game initialization starting...');
        
        try {
            // Check TensorFlow.js availability
            console.log('🔍 Checking TensorFlow.js...', typeof tf !== 'undefined' ? '✅' : '❌');
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js ist nicht verfügbar');
            }
            
            console.log('🔍 Checking Pose Detection API...', typeof poseDetection !== 'undefined' ? '✅' : '❌');
            if (typeof poseDetection === 'undefined') {
                throw new Error('Pose Detection API ist nicht verfügbar');
            }
            
            // Initialize camera
            this.updateStatus('Initialisiere Kamera...');
            console.log('📹 Initializing camera...');
            await this.camera.initialize();
            console.log('📹 Camera initialized successfully');
            
            // Initialize pose detector
            this.updateStatus('Lade Pose Detection...');
            console.log('🤖 Initializing pose detector...');
            
            try {
                await this.poseDetector.initialize();
                console.log('🤖 Pose detector initialized successfully');
                this.poseDetectionEnabled = true;
            } catch (poseError) {
                console.warn('⚠️ Pose detection failed, enabling debug mode:', poseError);
                this.poseDetectionEnabled = false;
                this.enableDebugMode();
            }
            
            this.updateStatus('Bereit zum Start!');
            this.elements.startBtn.disabled = false;
            this.elements.startBtn.textContent = 'Spiel starten';
            
            console.log('🎮 Game initialization complete!');
            return true;
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            this.updateStatus(`Fehler: ${error.message}`);
            this.showErrorFeedback(error.message);
            return false;
        }
    }

    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.lastFrameTime = performance.now();
        
        this.elements.startBtn.textContent = 'Pausieren';
        this.updateStatus('Spiel läuft...');
        
        this.gameLoop();
    }

    pause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.elements.startBtn.textContent = 'Fortsetzen';
            this.updateStatus('Spiel pausiert');
        } else {
            this.elements.startBtn.textContent = 'Pausieren';
            this.updateStatus('Spiel läuft...');
            this.gameLoop();
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.elapsedTime = 0;
        this.frameCount = 0;
        
        this.pushupTracker.reset();
        
        this.elements.startBtn.textContent = 'Spiel starten';
        this.elements.startBtn.disabled = false;
        
        this.updateUI({
            pushupCount: 0,
            timer: '0:00',
            poseStatus: 'Bereit',
            feedback: 'Positioniere dich vor der Kamera für Push-Ups'
        });
        
        this.updateStatus('Bereit zum Start!');
        this.clearFeedbackStyles();
    }

    async gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        const currentTime = performance.now();
        
        if (currentTime - this.lastFrameTime >= 100) { // ~10 FPS für bessere Performance
            this.frameCount++;
            this.lastFrameTime = currentTime;
            
            if (this.camera.isReady() && this.poseDetector.isReady()) {
                await this.processFrame();
            }
            
            this.updateTimer();
            this.calculateFPS(currentTime);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    async processFrame() {
        try {
            const video = this.camera.getVideoElement();
            
            if (this.poseDetectionEnabled && this.poseDetector.isReady()) {
                const poses = await this.poseDetector.detectPoses(video);
                this.poseDetector.drawPoses(poses, video);
                
                const analysis = this.pushupTracker.analyzePose(poses);
                this.updateUI({
                    feedback: analysis.feedback
                });
            } else if (this.debugMode) {
                this.processDebugFrame();
            }
            
        } catch (error) {
            console.error('Frame processing error:', error);
        }
    }

    enableDebugMode() {
        this.debugMode = true;
        this.updateUI({
            feedback: '🔧 Debug-Modus: Drücke LEERTASTE für Test-Push-Up'
        });
        
        console.log('🔧 Debug mode enabled - Use spacebar for test push-ups');
        
        // Add keyboard listener for test push-ups
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && this.debugMode && this.isRunning) {
                event.preventDefault();
                this.simulatePushUp();
            }
        });
    }

    processDebugFrame() {
        // Simple visual feedback in debug mode
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const video = document.getElementById('video');
        
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw debug overlay
        ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        ctx.fillStyle = '#4ade80';
        ctx.font = '24px Arial';
        ctx.fillText('🔧 DEBUG MODE', 20, 50);
        ctx.font = '16px Arial';
        ctx.fillText('Drücke LEERTASTE für Test-Push-Up', 20, 80);
    }

    simulatePushUp() {
        this.pushupTracker.count++;
        this.updateUI({
            pushupCount: this.pushupTracker.count,
            feedback: `🎉 Test Push-Up #${this.pushupTracker.count}!`
        });
        this.showSuccessFeedback();
    }

    updateTimer() {
        if (this.startTime) {
            this.elapsedTime = Date.now() - this.startTime;
            const minutes = Math.floor(this.elapsedTime / 60000);
            const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
            this.elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    calculateFPS(currentTime) {
        if (this.frameCount % 10 === 0) { // Update FPS every 10 frames
            this.fps = Math.round(1000 / (currentTime - this.lastFrameTime));
        }
    }

    updateUI(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            if (this.elements[key]) {
                this.elements[key].textContent = value;
            }
        });
    }

    updateStatus(message) {
        this.elements.status.textContent = message;
    }

    updatePoseStatus(position) {
        const statusText = {
            up: 'Ausgangsposition ⬆️',
            down: 'Push-Up unten ⬇️',
            unknown: 'Position unklar'
        };
        
        this.elements.poseStatus.textContent = statusText[position] || 'Bereit';
    }

    showSuccessFeedback() {
        this.elements.feedback.className = 'feedback success';
        setTimeout(() => {
            this.clearFeedbackStyles();
        }, 2000);
    }

    showErrorFeedback(message) {
        this.elements.feedback.className = 'feedback error';
        this.elements.feedback.querySelector('.feedback-text').textContent = message;
    }

    clearFeedbackStyles() {
        this.elements.feedback.className = 'feedback';
    }

    getGameStats() {
        return {
            pushups: this.pushupTracker.getCount(),
            time: this.elapsedTime,
            fps: this.fps,
            isRunning: this.isRunning
        };
    }
}