class WebcamManager {
    constructor() {
        this.video = document.getElementById('webcam');
        this.stream = null;
        this.isInitialized = false;
        this.isActive = false;
    }

    async initialize() {
        console.log('📹 Initializing webcam...');
        
        try {
            const constraints = {
                video: {
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 480, max: 720 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            return new Promise((resolve, reject) => {
                this.video.onloadeddata = () => {
                    this.isInitialized = true;
                    this.isActive = true;
                    console.log('✅ Webcam initialized successfully');
                    resolve();
                };
                this.video.onerror = (error) => {
                    console.error('❌ Webcam error:', error);
                    reject(error);
                };
            });
        } catch (error) {
            console.error('❌ Webcam access failed:', error);
            throw new Error(`Webcam-Zugriff fehlgeschlagen: ${error.message}`);
        }
    }

    getVideoElement() {
        return this.video;
    }

    getVideoSize() {
        if (!this.isInitialized) {
            return { width: 0, height: 0 };
        }
        
        return {
            width: this.video.videoWidth,
            height: this.video.videoHeight
        };
    }

    getVideoRect() {
        if (!this.isInitialized) {
            return { width: 0, height: 0, x: 0, y: 0 };
        }
        
        const rect = this.video.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            x: rect.left,
            y: rect.top
        };
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.isInitialized = false;
            this.isActive = false;
            console.log('📹 Webcam stopped');
        }
    }

    pause() {
        if (this.stream) {
            this.stream.getVideoTracks().forEach(track => track.enabled = false);
            this.isActive = false;
        }
    }

    resume() {
        if (this.stream) {
            this.stream.getVideoTracks().forEach(track => track.enabled = true);
            this.isActive = true;
        }
    }

    isReady() {
        return this.isInitialized && this.isActive && this.video.readyState >= 2;
    }

    // Get current frame as ImageData for pose detection
    getCurrentFrame() {
        if (!this.isReady()) return null;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        
        ctx.drawImage(this.video, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}