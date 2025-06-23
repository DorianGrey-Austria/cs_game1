# 🎮 PushUp Panic
**Webcam-based Action Dodge Game with AI Pose Detection**

[![Deploy to Hostinger](https://github.com/yourusername/pushup-panic/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/pushup-panic/actions/workflows/deploy.yml)

## 🚀 Live Demo
**Play now**: [https://aiworkflows.at/pushup-panic/](https://aiworkflows.at/pushup-panic/)

## 🎯 Game Features

### 🤖 AI Pose Detection
- Real-time pose tracking with TensorFlow.js MoveNet
- Duck, jump, and lean to dodge obstacles
- Webcam-based movement detection

### 🏆 Highscore System
- Cloud-based highscores with Supabase
- Player rankings and statistics
- Persistent score tracking

### 🎮 Gameplay
- Progressive difficulty system
- Street-themed obstacles (cars, signs, barriers)
- Lives system with invulnerability periods
- Cyberpunk visual effects

### 📱 Technical Features
- Responsive design for all devices
- HTTPS-enabled for webcam access
- Service Worker for offline capabilities
- Performance optimized assets

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, Phaser 3, HTML5 Canvas
- **AI**: TensorFlow.js, MoveNet pose detection
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: GitHub Actions → Hostinger
- **Assets**: Blender-rendered 3D sprites

## 🚀 Automatic Deployment

This project uses GitHub Actions for automatic deployment to Hostinger:

1. **Push to main branch** triggers deployment
2. **Files are optimized** for production
3. **FTP upload** to Hostinger hosting
4. **Live at**: aiworkflows.at/pushup-panic

### Setup Deployment Secrets

Add these secrets to your GitHub repository:

```
FTP_SERVER=your-hostinger-ftp-server
FTP_USERNAME=your-ftp-username  
FTP_PASSWORD=your-ftp-password
```

## 🎮 How to Play

1. **Allow webcam access** when prompted
2. **Stand in front of your camera** (full body visible)
3. **Move your body** to dodge flying obstacles:
   - **Duck**: Lower your head below shoulder line
   - **Jump**: Raise your head above normal position
   - **Lean**: Tilt left or right
4. **Avoid collisions** to increase your score
5. **Survive as long as possible** - difficulty increases!

## 🔧 Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/pushup-panic.git
cd pushup-panic

# Serve locally (requires HTTPS for webcam)
python3 -m http.server 8000 --bind 127.0.0.1

# Or use any local server that supports HTTPS
```

## 📊 Game Architecture

```
├── index.html              # Main game interface
├── js/
│   ├── gameManager.js      # Core game coordination
│   ├── poseTracker.js      # AI pose detection
│   ├── gameScene.js        # Phaser 3 game logic
│   ├── gameObjects.js      # Flying objects & collision
│   ├── supabaseManager.js  # Highscore system
│   └── webcamManager.js    # Camera access
├── assets/
│   ├── street_background.png
│   ├── female_character_sprite.png
│   └── obstacle sprites...
└── styles.css              # Cyberpunk UI styling
```

## 🌟 Features in Detail

### Pose Detection System
- **MoveNet SINGLEPOSE_LIGHTNING** for real-time tracking
- **Confidence filtering** (>0.3) for stable detection
- **Movement smoothing** and calibration
- **Fallback keyboard controls** (arrow keys/WASD)

### Visual Effects
- **Cyberpunk aesthetics** with neon colors
- **Particle explosions** on collisions
- **Screen shake effects** for impact
- **Animated scanlines** and grid overlay

### Performance Optimization
- **30 FPS game loop** with 10 FPS pose detection
- **Object pooling** for flying obstacles
- **Automatic garbage collection**
- **Responsive canvas scaling**

## 🏆 Highscore System

Powered by Supabase PostgreSQL:

```sql
CREATE TABLE highscores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Security & Privacy

- **HTTPS enforced** for webcam access
- **No video recording** - only pose keypoints processed
- **Client-side processing** - video never leaves your device
- **Secure headers** and Content Security Policy

## 📄 License

MIT License - Feel free to fork and modify!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Test with local webcam
4. Submit a pull request

---

**Built with ❤️ using TensorFlow.js, Phaser 3, and Supabase**