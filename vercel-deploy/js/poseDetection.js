class PoseDetector {
    constructor() {
        this.detector = null;
        this.isLoaded = false;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async initialize() {
        try {
            console.log('🤖 Starting pose detector initialization...');
            console.log('🔍 TensorFlow backend:', tf.getBackend());
            
            console.log('⏳ Waiting for TensorFlow.js to be ready...');
            await tf.ready();
            console.log('✅ TensorFlow.js is ready');
            
            console.log('⚙️ Creating detector configuration...');
            const detectorConfig = {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                enableSmoothing: true,
                enableSegmentation: false
            };
            console.log('⚙️ Detector config:', detectorConfig);
            
            console.log('📥 Loading MoveNet model...');
            this.detector = await poseDetection.createDetector(
                poseDetection.SupportedModels.MoveNet, 
                detectorConfig
            );
            console.log('✅ MoveNet detector created successfully');
            
            this.isLoaded = true;
            console.log('🎯 Pose detector fully initialized and ready');
        } catch (error) {
            console.error('❌ Pose detector initialization failed:', error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw new Error(`Pose Detection konnte nicht initialisiert werden: ${error.message}`);
        }
    }

    async detectPoses(video) {
        if (!this.isLoaded || !this.detector) {
            return [];
        }

        try {
            const poses = await this.detector.estimatePoses(video);
            return poses;
        } catch (error) {
            console.error('Pose Detection Fehler:', error);
            return [];
        }
    }

    drawPoses(poses, video) {
        const { width, height } = video.getBoundingClientRect();
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.ctx.clearRect(0, 0, width, height);
        
        if (poses.length === 0) return;

        const pose = poses[0];
        if (pose.keypoints) {
            this.drawKeypoints(pose.keypoints, width, height);
            this.drawSkeleton(pose.keypoints, width, height);
        }
    }

    drawKeypoints(keypoints, canvasWidth, canvasHeight) {
        const videoWidth = document.getElementById('video').videoWidth;
        const videoHeight = document.getElementById('video').videoHeight;
        
        keypoints.forEach(keypoint => {
            if (keypoint.score > 0.3) {
                const x = (keypoint.x / videoWidth) * canvasWidth;
                const y = (keypoint.y / videoHeight) * canvasHeight;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#4ade80';
                this.ctx.fill();
            }
        });
    }

    drawSkeleton(keypoints, canvasWidth, canvasHeight) {
        const videoWidth = document.getElementById('video').videoWidth;
        const videoHeight = document.getElementById('video').videoHeight;
        
        const connections = [
            ['left_shoulder', 'right_shoulder'],
            ['left_shoulder', 'left_elbow'],
            ['left_elbow', 'left_wrist'],
            ['right_shoulder', 'right_elbow'],
            ['right_elbow', 'right_wrist'],
            ['left_shoulder', 'left_hip'],
            ['right_shoulder', 'right_hip'],
            ['left_hip', 'right_hip'],
            ['left_hip', 'left_knee'],
            ['left_knee', 'left_ankle'],
            ['right_hip', 'right_knee'],
            ['right_knee', 'right_ankle']
        ];

        const keypointMap = {};
        keypoints.forEach(keypoint => {
            keypointMap[keypoint.name] = keypoint;
        });

        this.ctx.strokeStyle = '#4ade80';
        this.ctx.lineWidth = 2;

        connections.forEach(([pointA, pointB]) => {
            const kpA = keypointMap[pointA];
            const kpB = keypointMap[pointB];
            
            if (kpA && kpB && kpA.score > 0.3 && kpB.score > 0.3) {
                const xA = (kpA.x / videoWidth) * canvasWidth;
                const yA = (kpA.y / videoHeight) * canvasHeight;
                const xB = (kpB.x / videoWidth) * canvasWidth;
                const yB = (kpB.y / videoHeight) * canvasHeight;
                
                this.ctx.beginPath();
                this.ctx.moveTo(xA, yA);
                this.ctx.lineTo(xB, yB);
                this.ctx.stroke();
            }
        });
    }

    getKeypoint(poses, keypointName) {
        if (poses.length === 0) return null;
        
        const pose = poses[0];
        const keypoint = pose.keypoints.find(kp => kp.name === keypointName);
        
        return keypoint && keypoint.score > 0.3 ? keypoint : null;
    }

    isReady() {
        return this.isLoaded && this.detector !== null;
    }
}