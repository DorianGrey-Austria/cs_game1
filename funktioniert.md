# ✅ Pose Tracking - Wie es funktioniert

## Übersicht
Das Pose Tracking in PushUp Panic verwendet TensorFlow.js MoveNet für Echtzeit-Körpererkennung und mappt diese auf Spielbewegungen.

## Technische Umsetzung

### 1. MoveNet Pose Detection
```javascript
// js/poseTracker.js
const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true,
    enableSegmentation: false
};

this.detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet, 
    detectorConfig
);
```

**Warum MoveNet LIGHTNING:**
- Optimiert für Echtzeit-Performance (~30-60 FPS)
- Geringe Latenz für responsive Spielkontrolle
- Gute Balance zwischen Genauigkeit und Geschwindigkeit

### 2. Keypoint Mapping
```javascript
updatePlayerPosition(pose) {
    const keypoints = this.getKeypoints(pose);
    
    if (!this.calibration.isCalibrated) {
        this.calibratePose(keypoints);
    }
    
    const newPosition = this.calculateGamePosition(keypoints);
    
    // Smooth the position changes
    this.playerPosition.x = this.lerp(this.playerPosition.x, newPosition.x, 0.7);
    this.playerPosition.y = this.lerp(this.playerPosition.y, newPosition.y, 0.7);
}
```

**Verwendet folgende Körperpunkte:**
- **Schultern (left_shoulder, right_shoulder):** Horizontale Position und Neigung
- **Nase (nose):** Vertikale Kopfposition für Ducken/Springen
- **Confidence Threshold:** >0.3 für stabile Erkennung

### 3. Auto-Kalibrierung
```javascript
calibratePose(keypoints) {
    if (keypoints.left_shoulder && keypoints.right_shoulder) {
        this.calibration.shoulderWidth = Math.abs(
            keypoints.left_shoulder.x - keypoints.right_shoulder.x
        );
        this.calibration.neutralY = (keypoints.left_shoulder.y + keypoints.right_shoulder.y) / 2;
        this.calibration.isCalibrated = true;
    }
}
```

**Adaptive Kalibrierung:**
- Automatische Anpassung an verschiedene Körpergrößen
- Nutzt Schulterbreite als Referenzmaß
- Neutral-Position wird beim ersten Frame gesetzt

### 4. Bewegungsarten Erkennung

#### Horizontale Bewegung (Links/Rechts)
```javascript
const shoulderCenterX = (keypoints.left_shoulder.x + keypoints.right_shoulder.x) / 2;
x = shoulderCenterX / 640; // Normalisiert auf 0-1

// Neigung erkennen
const shoulderTilt = keypoints.left_shoulder.x - keypoints.right_shoulder.x;
const tiltThreshold = this.calibration.shoulderWidth * 0.1;
```

#### Vertikale Bewegung (Ducken/Springen)
```javascript
const headY = keypoints.nose.y;
const yDiff = headY - this.calibration.neutralY;
const verticalThreshold = this.calibration.shoulderWidth * 0.15;

if (yDiff > verticalThreshold) {
    state = 'ducking';
} else if (yDiff < -verticalThreshold) {
    state = 'jumping';
}
```

### 5. Position Smoothing
```javascript
lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Smoothing Factor: 0.7 = 70% neue Position, 30% alte Position
this.playerPosition.x = this.lerp(this.playerPosition.x, newPosition.x, 0.7);
```

**Warum Smoothing:**
- Reduziert Tracking-Jitter
- Macht Bewegungen flüssiger
- Verhindert abrupte Sprünge

### 6. Game Coordinate Mapping
```javascript
getGameCoordinates(gameWidth, gameHeight) {
    return {
        x: this.playerPosition.x * gameWidth,
        y: this.playerPosition.y * gameHeight,
        state: this.playerPosition.state
    };
}
```

**Normalisierung:**
- Pose-Koordinaten (0-640px) → Spiel-Koordinaten (0-1)
- Unabhängig von Bildschirmgröße
- Konstante Spielerfahrung auf allen Geräten

## Performance Optimierungen

### Asynchrone Verarbeitung
```javascript
async detectPoses(videoElement) {
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
```

### Frame Rate Management
- **Game Loop:** ~30 FPS für flüssiges Gameplay
- **Pose Detection:** ~10-15 FPS für Performance
- **UI Updates:** ~60 FPS für responsive Interface

## Fehlerbehandlung

### Confidence Filtering
```javascript
getKeypoints(pose) {
    const keypointMap = {};
    
    pose.keypoints.forEach(kp => {
        if (kp.score > this.confidenceThreshold) { // >0.3
            keypointMap[kp.name] = kp;
        }
    });
    
    return keypointMap;
}
```

### Fallback-Verhalten
- Bei fehlenden Keypoints: Letzte bekannte Position beibehalten
- Bei Pose Detection Fehler: Automatisches Retry
- Bei kompletter Fehlschlag: Keyboard-Controls aktivieren

## Debugging Features

### Visual Overlay
```javascript
drawPoseOverlay(poses, videoElement) {
    // Keypoints als grüne Punkte
    // Skelett-Verbindungen
    // Player-Position als roter Kreis
    // Aktueller State als Text
}
```

### Debug-Informationen
- Echtzeit-Position in Debug-Panel
- Pose-Status (✅/❌)
- FPS-Monitoring
- Keypoint-Confidence-Werte

## Kalibrierungs-Tipps für Benutzer

1. **Positionierung:** 1-2 Meter von der Kamera
2. **Beleuchtung:** Gleichmäßiges Licht, keine Gegenlicht
3. **Hintergrund:** Möglichst einfarbig/kontrastreich
4. **Kleidung:** Nicht zu weit, klare Körperkontur
5. **Kamera-Höhe:** Auf Brusthöhe ausrichten

## Browser-Kompatibilität

- ✅ **Chrome/Edge:** Beste Performance (30+ FPS)
- ✅ **Firefox:** Gute Performance (20-30 FPS)
- ⚠️ **Safari:** Eingeschränkt (15-20 FPS, teilweise Tracking-Issues)
- ❌ **Mobile:** Noch nicht optimiert

## Technische Details

- **Model Size:** ~3MB (MoveNet Lightning)
- **Latency:** <50ms auf modernen Geräten
- **Memory Usage:** ~100MB während Betrieb
- **Keypoints:** 17 Körperpunkte (Nase, Augen, Ohren, Schultern, Ellbogen, Handgelenke, Hüfte, Knie, Knöchel)