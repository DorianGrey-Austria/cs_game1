class PoseTracker {
    constructor() {
        this.detector = null;
        this.isLoaded = false;
        this.lastPoses = [];
        this.smoothingFactor = 0.7; // For position smoothing
        this.confidenceThreshold = 0.3;
        
        // Game-specific body position tracking
        this.playerPosition = {
            x: 0.5, // Normalized 0-1 (left to right)
            y: 0.5, // Normalized 0-1 (top to bottom)
            state: 'neutral', // 'ducking', 'jumping', 'leaning_left', 'leaning_right', 'neutral'
            handState: 'down' // 'up', 'down' - for bonus collection
        };
        
        this.calibration = {
            shoulderWidth: 0,
            neutralY: 0,
            handNeutralY: 0,
            isCalibrated: false
        };
        
        // Canvas for pose visualization
        this.canvas = document.getElementById('poseCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    }

    async initialize() {
        console.log('🤖 Initializing pose tracker...');
        
        try {
            // Wait for TensorFlow.js to be fully loaded
            console.log('⏳ Waiting for TensorFlow.js to load...');
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 100; // 10 seconds timeout
                
                const checkTF = () => {
                    attempts++;
                    
                    if (typeof tf !== 'undefined' && tf.ready && typeof tf.ready === 'function') {
                        console.log('✅ TensorFlow.js detected, initializing...');
                        tf.ready().then(() => {
                            console.log('✅ TensorFlow.js ready, backend:', tf.getBackend());
                            resolve();
                        }).catch(reject);
                    } else if (attempts >= maxAttempts) {
                        reject(new Error('TensorFlow.js loading timeout'));
                    } else {
                        console.log(`⏳ TensorFlow.js loading... (${attempts}/${maxAttempts})`);
                        setTimeout(checkTF, 100);
                    }
                };
                checkTF();
            });

            // Wait for Pose Detection library
            console.log('⏳ Waiting for Pose Detection library...');
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 50; // 5 seconds timeout
                
                const checkPD = () => {
                    attempts++;
                    
                    if (typeof poseDetection !== 'undefined' && poseDetection.createDetector) {
                        console.log('✅ Pose Detection library ready');
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        reject(new Error('Pose Detection library loading timeout'));
                    } else {
                        console.log(`⏳ Pose Detection loading... (${attempts}/${maxAttempts})`);
                        setTimeout(checkPD, 100);
                    }
                };
                checkPD();
            });

            console.log('📥 Loading MoveNet model...');
            const detectorConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true,
                enableSegmentation: false
            };

            this.detector = await poseDetection.createDetector(
                poseDetection.SupportedModels.MoveNet,
                detectorConfig
            );

            this.isLoaded = true;
            console.log('🎯 Pose tracker initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Pose tracker initialization failed:', error);
            return false;
        }
    }

    async detectPoses(videoElement) {
        if (!this.isLoaded || !this.detector) {
            return [];
        }

        try {
            const poses = await this.detector.estimatePoses(videoElement);
            this.lastPoses = poses;
            
            if (poses.length > 0) {
                this.updatePlayerPosition(poses[0]);
            }
            
            return poses;
        } catch (error) {
            console.error('Pose detection error:', error);
            return [];
        }
    }

    updatePlayerPosition(pose) {
        if (!pose.keypoints || pose.keypoints.length === 0) return;

        // Get key body points
        const keypoints = this.getKeypoints(pose);
        
        if (!this.calibration.isCalibrated) {
            this.calibratePose(keypoints);
        }
        
        // Calculate normalized positions
        const newPosition = this.calculateGamePosition(keypoints);
        
        // Smooth the position changes
        this.playerPosition.x = this.lerp(this.playerPosition.x, newPosition.x, this.smoothingFactor);
        this.playerPosition.y = this.lerp(this.playerPosition.y, newPosition.y, this.smoothingFactor);
        this.playerPosition.state = newPosition.state;
        this.playerPosition.handState = newPosition.handState;
    }

    getKeypoints(pose) {
        const keypointMap = {};
        
        pose.keypoints.forEach(kp => {
            if (kp.score > this.confidenceThreshold) {
                keypointMap[kp.name] = kp;
            }
        });
        
        return keypointMap;
    }

    calibratePose(keypoints) {
        if (keypoints.left_shoulder && keypoints.right_shoulder) {
            this.calibration.shoulderWidth = Math.abs(
                keypoints.left_shoulder.x - keypoints.right_shoulder.x
            );
            
            this.calibration.neutralY = (keypoints.left_shoulder.y + keypoints.right_shoulder.y) / 2;
            
            // Calibrate hand neutral position
            if (keypoints.left_wrist && keypoints.right_wrist) {
                this.calibration.handNeutralY = (keypoints.left_wrist.y + keypoints.right_wrist.y) / 2;
            }
            
            this.calibration.isCalibrated = true;
            
            console.log('🎯 Pose calibrated:', this.calibration);
        }
    }

    calculateGamePosition(keypoints) {
        let x = 0.5; // Center by default
        let y = 0.5; // Middle by default
        let state = 'neutral';
        let handState = 'down';

        // Calculate horizontal position (left/right leaning)
        if (keypoints.left_shoulder && keypoints.right_shoulder) {
            const shoulderCenterX = (keypoints.left_shoulder.x + keypoints.right_shoulder.x) / 2;
            
            // Normalize to video width (assuming 640px typical width)
            x = shoulderCenterX / 640;
            x = Math.max(0, Math.min(1, x)); // Clamp to 0-1
            
            // Determine leaning state
            const shoulderTilt = keypoints.left_shoulder.x - keypoints.right_shoulder.x;
            const tiltThreshold = this.calibration.shoulderWidth * 0.1;
            
            if (Math.abs(shoulderTilt) > tiltThreshold) {
                state = shoulderTilt > 0 ? 'leaning_right' : 'leaning_left';
            }
        }

        // Calculate vertical position (ducking/jumping)
        if (keypoints.nose && this.calibration.isCalibrated) {
            const headY = keypoints.nose.y;
            const neutralY = this.calibration.neutralY;
            
            // Calculate relative position
            const yDiff = headY - neutralY;
            const movementRange = this.calibration.shoulderWidth; // Use shoulder width as movement scale
            
            y = 0.5 + (yDiff / movementRange);
            y = Math.max(0, Math.min(1, y)); // Clamp to 0-1
            
            // Determine ducking/jumping state
            const verticalThreshold = movementRange * 0.15;
            
            if (yDiff > verticalThreshold) {
                state = 'ducking';
            } else if (yDiff < -verticalThreshold) {
                state = 'jumping';
            }
        }

        // Calculate hand position (for bonus collection)
        if (keypoints.left_wrist && keypoints.right_wrist && this.calibration.isCalibrated) {
            const leftHandY = keypoints.left_wrist.y;
            const rightHandY = keypoints.right_wrist.y;
            const avgHandY = (leftHandY + rightHandY) / 2;
            
            // Check if hands are raised significantly above shoulders
            const shoulderY = this.calibration.neutralY;
            const handThreshold = this.calibration.shoulderWidth * 0.3; // More sensitive than head movement
            
            if (avgHandY < shoulderY - handThreshold) {
                handState = 'up';
            } else {
                handState = 'down';
            }
        }

        return { x, y, state, handState };
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    getPlayerPosition() {
        return { ...this.playerPosition };
    }

    // Convert normalized position to game coordinates
    getGameCoordinates(gameWidth, gameHeight) {
        return {
            x: this.playerPosition.x * gameWidth,
            y: this.playerPosition.y * gameHeight,
            state: this.playerPosition.state
        };
    }

    drawPoseOverlay(poses, videoElement) {
        if (!this.ctx || !poses || poses.length === 0) return;

        const video = videoElement;
        const rect = video.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const pose = poses[0];
        if (!pose.keypoints) return;

        // Draw keypoints
        this.ctx.fillStyle = '#4ade80';
        pose.keypoints.forEach(kp => {
            if (kp.score > this.confidenceThreshold) {
                const x = (kp.x / video.videoWidth) * this.canvas.width;
                const y = (kp.y / video.videoHeight) * this.canvas.height;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        });

        // Draw player position indicator
        const playerX = this.playerPosition.x * this.canvas.width;
        const playerY = this.playerPosition.y * this.canvas.height;
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(playerX, playerY, 15, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Draw state text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`${this.playerPosition.state} | hands: ${this.playerPosition.handState}`, 10, 20);
    }

    isReady() {
        return this.isLoaded && this.detector !== null;
    }
}