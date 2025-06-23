class CameraManager {
    constructor() {
        this.video = document.getElementById('video');
        this.stream = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
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
            
            return new Promise((resolve, reject) => {
                this.video.onloadeddata = () => {
                    this.isInitialized = true;
                    resolve();
                };
                this.video.onerror = reject;
            });
        } catch (error) {
            console.error('Kamera-Zugang fehlgeschlagen:', error);
            throw new Error('Webcam-Zugriff wurde verweigert oder ist nicht verfügbar');
        }
    }

    getVideoElement() {
        return this.video;
    }

    getVideoSize() {
        return {
            width: this.video.videoWidth,
            height: this.video.videoHeight
        };
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.isInitialized = false;
        }
    }

    isReady() {
        return this.isInitialized && this.video.readyState >= 2;
    }
}