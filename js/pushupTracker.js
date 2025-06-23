class PushUpTracker {
    constructor() {
        this.count = 0;
        this.isInPushUpPosition = false;
        this.lastPosition = 'unknown';
        
        this.thresholds = {
            downPosition: 0.7,   // Verhältnis für "unten" Position
            upPosition: 0.3,     // Verhältnis für "oben" Position
            minConfidence: 0.5   // Minimale Keypoint-Konfidenz
        };
        
        this.positions = {
            UP: 'up',
            DOWN: 'down',
            UNKNOWN: 'unknown'
        };
        
        this.callbacks = {
            onPushUpComplete: null,
            onPositionChange: null
        };
    }

    analyzePose(poses) {
        if (!poses || poses.length === 0) {
            return {
                position: this.positions.UNKNOWN,
                ratio: 0,
                feedback: 'Keine Person erkannt'
            };
        }

        const pose = poses[0];
        const analysis = this.calculatePushUpRatio(pose);
        
        if (analysis.ratio === -1) {
            return {
                position: this.positions.UNKNOWN,
                ratio: 0,
                feedback: 'Positioniere dich seitlich zur Kamera'
            };
        }

        const currentPosition = this.determinePosition(analysis.ratio);
        const feedback = this.generateFeedback(currentPosition, analysis);
        
        this.updatePushUpCount(currentPosition);
        
        return {
            position: currentPosition,
            ratio: analysis.ratio,
            feedback: feedback,
            keypoints: analysis.keypoints
        };
    }

    calculatePushUpRatio(pose) {
        const requiredKeypoints = ['left_shoulder', 'right_shoulder', 'left_wrist', 'right_wrist'];
        const keypoints = {};
        
        for (const name of requiredKeypoints) {
            const kp = pose.keypoints.find(k => k.name === name);
            if (!kp || kp.score < this.thresholds.minConfidence) {
                return { ratio: -1, keypoints: null };
            }
            keypoints[name] = kp;
        }

        const shoulderY = (keypoints.left_shoulder.y + keypoints.right_shoulder.y) / 2;
        const wristY = (keypoints.left_wrist.y + keypoints.right_wrist.y) / 2;
        
        const shoulderWristDistance = Math.abs(shoulderY - wristY);
        const referenceDistance = Math.abs(keypoints.left_shoulder.x - keypoints.right_shoulder.x);
        
        if (referenceDistance === 0) return { ratio: -1, keypoints: null };
        
        const ratio = shoulderWristDistance / referenceDistance;
        
        return {
            ratio: Math.min(ratio, 1.0),
            keypoints: keypoints,
            shoulderY: shoulderY,
            wristY: wristY
        };
    }

    determinePosition(ratio) {
        if (ratio >= this.thresholds.downPosition) {
            return this.positions.DOWN;
        } else if (ratio <= this.thresholds.upPosition) {
            return this.positions.UP;
        }
        return this.positions.UNKNOWN;
    }

    updatePushUpCount(currentPosition) {
        if (this.lastPosition !== currentPosition) {
            if (this.lastPosition === this.positions.UP && currentPosition === this.positions.DOWN) {
                this.isInPushUpPosition = true;
            } else if (this.lastPosition === this.positions.DOWN && currentPosition === this.positions.UP && this.isInPushUpPosition) {
                this.count++;
                this.isInPushUpPosition = false;
                
                if (this.callbacks.onPushUpComplete) {
                    this.callbacks.onPushUpComplete(this.count);
                }
            }
            
            this.lastPosition = currentPosition;
            
            if (this.callbacks.onPositionChange) {
                this.callbacks.onPositionChange(currentPosition);
            }
        }
    }

    generateFeedback(position, analysis) {
        switch (position) {
            case this.positions.UP:
                return 'Gute Ausgangsposition! Bereit für Push-Up';
            case this.positions.DOWN:
                return 'Push-Up unten - jetzt nach oben drücken!';
            case this.positions.UNKNOWN:
                if (analysis.ratio === -1) {
                    return 'Positioniere dich seitlich zur Kamera';
                }
                return 'Gehe in Push-Up Position';
            default:
                return 'Positioniere dich für Push-Ups';
        }
    }

    reset() {
        this.count = 0;
        this.isInPushUpPosition = false;
        this.lastPosition = 'unknown';
    }

    getCount() {
        return this.count;
    }

    getCurrentPosition() {
        return this.lastPosition;
    }

    setCallback(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }

    adjustThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }
}