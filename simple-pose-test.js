console.log('🎯 Simple Pose Control Test - Starting...');

class SimplePoseTest {
    constructor() {
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('poseCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = document.getElementById('player');
        this.gameArea = document.querySelector('.game-area');
        
        this.detector = null;
        this.isRunning = false;
        this.stream = null;
        
        // UI Elements
        this.elements = {
            status: document.getElementById('status'),
            poseStatus: document.getElementById('poseStatus'),
            playerX: document.getElementById('playerX'),
            playerY: document.getElementById('playerY'),
            nosePos: document.getElementById('nosePos'),
            shoulderPos: document.getElementById('shoulderPos'),
            movementState: document.getElementById('movementState'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn')
        };
        
        // Player position (center of game area)
        this.playerPos = {
            x: 300, // Center X
            y: 300  // Center Y
        };
        
        // Calibration data
        this.calibration = {
            neutralY: 0,
            shoulderWidth: 0,
            isCalibrated: false
        };
        
        this.setupEventListeners();
        this.updatePlayerVisual();
    }
    
    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => {
            if (this.isRunning) {
                this.stop();
            } else {
                this.start();
            }
        });
        
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetPlayerPosition();
        });
    }
    
    async start() {
        try {
            this.updateStatus('Initializing webcam...');
            
            // Initialize webcam
            await this.initializeWebcam();
            this.updateStatus('Loading pose detection...');
            
            // Initialize pose detection
            await this.initializePoseDetection();
            this.updateStatus('Running! Move your body!');
            
            this.isRunning = true;
            this.elements.startBtn.textContent = 'Stop';
            this.elements.startBtn.style.background = '#dc2626';
            
            // Start detection loop
            this.detectionLoop();
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.updateStatus(`Error: ${error.message}`);
        }
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
    
    async detectionLoop() {
        if (!this.isRunning) return;
        
        try {
            // Detect poses
            const poses = await this.detector.estimatePoses(this.video);
            
            if (poses.length > 0) {
                this.elements.poseStatus.textContent = '✅';
                this.processPose(poses[0]);
                this.drawPose(poses[0]);
            } else {
                this.elements.poseStatus.textContent = '❌';
            }
            
        } catch (error) {
            console.error('Detection error:', error);
        }
        
        // Continue loop
        setTimeout(() => this.detectionLoop(), 100); // 10 FPS
    }
    
    processPose(pose) {
        const keypoints = this.getValidKeypoints(pose);
        
        // Auto-calibrate on first detection
        if (!this.calibration.isCalibrated && keypoints.left_shoulder && keypoints.right_shoulder) {
            this.calibratePose(keypoints);
        }
        
        if (this.calibration.isCalibrated) {
            this.updatePlayerFromPose(keypoints);
        }
        
        this.updateDebugInfo(keypoints);
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
        
        console.log('🎯 Pose calibrated:', this.calibration);
        this.updateStatus('Calibrated! Now move your body!');
    }
    
    updatePlayerFromPose(keypoints) {
        const gameRect = this.gameArea.getBoundingClientRect();
        const gameWidth = gameRect.width;
        const gameHeight = gameRect.height;
        
        let newX = this.playerPos.x;
        let newY = this.playerPos.y;
        let movementState = 'neutral';
        
        // Horizontal movement (shoulder center)
        if (keypoints.left_shoulder && keypoints.right_shoulder) {
            const shoulderCenterX = (keypoints.left_shoulder.x + keypoints.right_shoulder.x) / 2;
            
            // Map to game area (with some margin)
            const normalizedX = shoulderCenterX / this.video.videoWidth;
            newX = Math.max(50, Math.min(gameWidth - 50, normalizedX * gameWidth));
            
            // Detect leaning
            const shoulderTilt = keypoints.left_shoulder.x - keypoints.right_shoulder.x;
            if (Math.abs(shoulderTilt) > this.calibration.shoulderWidth * 0.1) {
                movementState = shoulderTilt > 0 ? 'leaning_right' : 'leaning_left';
            }
        }
        
        // Vertical movement (nose position relative to neutral)
        if (keypoints.nose && this.calibration.isCalibrated) {
            const headY = keypoints.nose.y;
            const yDiff = headY - this.calibration.neutralY;
            
            // Map vertical movement
            const normalizedY = 0.5 + (yDiff / (this.calibration.shoulderWidth * 2));
            newY = Math.max(50, Math.min(gameHeight - 50, normalizedY * gameHeight));
            
            // Detect ducking/jumping
            const threshold = this.calibration.shoulderWidth * 0.15;
            if (yDiff > threshold) {
                movementState = 'ducking';
            } else if (yDiff < -threshold) {
                movementState = 'jumping';
            }
        }
        
        // Smooth movement
        this.playerPos.x = this.playerPos.x * 0.7 + newX * 0.3;
        this.playerPos.y = this.playerPos.y * 0.7 + newY * 0.3;
        
        this.updatePlayerVisual();
        this.updateMovementState(movementState);
        
        // Debug output
        this.elements.playerX.textContent = Math.round(this.playerPos.x);
        this.elements.playerY.textContent = Math.round(this.playerPos.y);
        
        console.log(`Player moved to: ${Math.round(this.playerPos.x)}, ${Math.round(this.playerPos.y)} - State: ${movementState}`);
    }
    
    updatePlayerVisual() {
        this.player.style.left = (this.playerPos.x - 15) + 'px';
        this.player.style.top = (this.playerPos.y - 15) + 'px';
    }
    
    updateMovementState(state) {
        this.elements.movementState.textContent = state;
        
        // Change player color based on state
        switch (state) {
            case 'ducking':
                this.player.style.background = '#ff6b6b';
                break;
            case 'jumping':
                this.player.style.background = '#4ecdc4';
                break;
            case 'leaning_left':
            case 'leaning_right':
                this.player.style.background = '#ffe66d';
                break;
            default:
                this.player.style.background = '#4ade80';
        }
    }
    
    drawPose(pose) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw keypoints
        pose.keypoints.forEach(kp => {
            if (kp.score > 0.3) {
                this.ctx.beginPath();
                this.ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#4ade80';
                this.ctx.fill();
            }
        });
        
        // Draw skeleton connections
        this.drawSkeleton(pose.keypoints);
    }
    
    drawSkeleton(keypoints) {
        const connections = [
            ['left_shoulder', 'right_shoulder'],
            ['left_shoulder', 'left_elbow'],
            ['right_shoulder', 'right_elbow'],
            ['left_elbow', 'left_wrist'],
            ['right_elbow', 'right_wrist'],
            ['left_shoulder', 'left_hip'],
            ['right_shoulder', 'right_hip'],
            ['left_hip', 'right_hip']
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
    
    updateDebugInfo(keypoints) {
        // Nose position
        if (keypoints.nose) {
            this.elements.nosePos.textContent = `(${Math.round(keypoints.nose.x)}, ${Math.round(keypoints.nose.y)})`;
        }
        
        // Shoulder positions
        if (keypoints.left_shoulder && keypoints.right_shoulder) {
            const ls = keypoints.left_shoulder;
            const rs = keypoints.right_shoulder;
            this.elements.shoulderPos.textContent = `L:(${Math.round(ls.x)},${Math.round(ls.y)}) R:(${Math.round(rs.x)},${Math.round(rs.y)})`;
        }
    }
    
    resetPlayerPosition() {
        this.playerPos.x = 300;
        this.playerPos.y = 300;
        this.updatePlayerVisual();
        this.updateMovementState('neutral');
        console.log('🔄 Player position reset');
    }
    
    stop() {
        this.isRunning = false;
        this.elements.startBtn.textContent = 'Start Pose Detection';
        this.elements.startBtn.style.background = '#4ade80';
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.updateStatus('Stopped');
        console.log('⏹️ Pose detection stopped');
    }
    
    updateStatus(message) {
        this.elements.status.textContent = message;
        console.log('📊 Status:', message);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Simple Pose Test...');
    
    // Check if libraries are loaded
    setTimeout(() => {
        if (typeof tf === 'undefined') {
            document.getElementById('status').textContent = 'Error: TensorFlow.js not loaded';
            return;
        }
        
        if (typeof poseDetection === 'undefined') {
            document.getElementById('status').textContent = 'Error: Pose Detection not loaded';
            return;
        }
        
        const app = new SimplePoseTest();
        console.log('✅ Simple Pose Test ready');
        
        // Make globally available for debugging
        window.poseTest = app;
        
    }, 1000);
});