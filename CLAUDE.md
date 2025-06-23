# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PushUp Panic is a webcam-based action dodge game that uses TensorFlow.js MoveNet for real-time pose detection. Players must dodge flying objects by moving their body (ducking, jumping, leaning) while being tracked by their webcam.

## Development Commands

- **Local Development**: Open `index.html` in a modern browser (Chrome/Firefox recommended)
- **Testing**: No build process required - pure client-side JavaScript
- **Debug Mode**: Ctrl+Shift+I to toggle debug panel, arrow keys for manual movement
- **3D Asset Creation**: Use Blender MCP tools to create and export game assets
- **Asset Pipeline**: Assets stored in `/assets/` directory, loaded via Phaser preloader
- **Browser Requirements**: Webcam access required, HTTPS recommended for production

### 3D Asset Workflow
```bash
# Create 3D models using Blender MCP
mcp__blender__execute_blender_code  # Script Blender operations
mcp__blender__get_scene_info        # Inspect current scene
mcp__blender__get_object_info       # Get object details
mcp__blender__get_viewport_screenshot # Preview renders
```

## Architecture

### Core Components

1. **WebcamManager** (`js/webcamManager.js`): Handles webcam access and video stream management
2. **PoseTracker** (`js/poseTracker.js`): TensorFlow.js MoveNet integration for real-time pose detection and game movement mapping
3. **GameObjects** (`js/gameObjects.js`): Flying objects, player avatar, collision detection, and visual effects
4. **GameScene** (`js/gameScene.js`): Main Phaser 3 scene with game loop, spawning system, and collision handling
5. **GameManager** (`js/gameManager.js`): Coordinates all systems, UI updates, and game state management
6. **App** (`js/app.js`): Application initialization, error handling, and system checks

### Game Mechanics

**Dodge System:**
- **Ducking**: Detected when head moves significantly below shoulder line
- **Jumping**: Detected when head moves significantly above shoulder line  
- **Leaning**: Detected by shoulder tilt and horizontal head movement
- **Collision Detection**: AABB (bounding box) between player hitbox and flying objects

**Flying Objects:**
- Street obstacles: Cars, trees, traffic signs, barriers (3D-rendered sprites)
- Traditional objects: Ball, Box, Rocket, Star (fallback 2D shapes)
- Spawn from right side of screen, move left with physics
- Progressive difficulty increases spawn rate and speed
- Asset system supports both 3D-rendered sprites and procedural 2D shapes

**Scoring System:**
- Points awarded for each avoided collision
- Lives system (3 lives, invulnerability period after hit)
- Level progression based on score milestones

### Technical Architecture

**Phaser 3 Integration:**
- Canvas-based game rendering with physics engine
- Hybrid 3D/2D sprite system with graceful fallbacks
- Asset preloader supports PNG sprites from Blender renders
- Tween animations for smooth movement and effects
- Particle systems for collision explosions
- Street background with parallax scrolling for depth

**3D Asset Pipeline:**
- Blender MCP integration for real-time 3D model creation
- Assets exported as 2D sprites for web performance
- Street environment: realistic obstacles and backgrounds
- Character sprites: human-like avatar with pose-based animations
- Fallback system: procedural 2D shapes when 3D assets unavailable

**Pose Detection Pipeline:**
- MoveNet SINGLEPOSE_LIGHTNING model for performance
- Real-time keypoint detection with confidence filtering (>0.3)
- Position smoothing and calibration system
- Normalization to game coordinates (0-1 range)

**Performance Optimizations:**
- ~30 FPS game loop with 10 FPS pose detection
- Object pooling for flying objects
- Automatic garbage collection of off-screen objects
- Canvas size optimization and responsive scaling

### Browser Compatibility

- **Primary**: Chrome/Edge (best performance, full WebRTC support)
- **Secondary**: Firefox (good performance, some WebRTC limitations)
- **Limited**: Safari (basic functionality, pose detection may be slower)
- **Fallback**: Keyboard controls (arrow keys/WASD) when pose detection fails

## Development Workflow

### Testing New Features
1. Use `test.html` for isolated component testing
2. Enable debug panel (Ctrl+Shift+I) for real-time monitoring
3. Use manual movement (arrow keys) to test game mechanics
4. Check browser console for detailed initialization logs

### Adding New Object Types
1. Add type definition to `OBJECT_TYPES` in `gameObjects.js`
2. Create 3D model in Blender using MCP tools
3. Export as sprite to `/assets/` directory
4. Implement sprite creation in `FlyingObject.createSprite()`
5. Adjust spawning weights in `GameScene.spawnFlyingObject()`

### 3D Asset Creation Workflow
1. Use `mcp__blender__get_scene_info` to check current Blender scene
2. Create 3D models using `mcp__blender__execute_blender_code`
3. Preview with `mcp__blender__get_viewport_screenshot`
4. Export optimized sprites for game integration
5. Update asset loading in `GameScene.preload()`

### Performance Debugging
- Monitor FPS in debug panel
- Check object count for memory leaks
- Use browser dev tools for WebGL performance
- Pose detection timing logged in console

## Key Files

- `index.html`: Main game interface with Phaser integration
- `styles.css`: Game UI styling with animations and responsive design
- `js/gameScene.js`: Core game logic and Phaser scene with 3D asset support (400+ lines)
- `js/gameObjects.js`: Hybrid 3D/2D sprite system and collision detection
- `js/poseTracker.js`: Pose detection and movement mapping
- `js/gameManager.js`: System coordination and UI management
- `assets/`: Directory for 3D-rendered sprites and background images
- `funktioniert.md`: Technical documentation of pose tracking implementation
- `troubleshooting.md`: Known issues and debugging guide

## Current Asset Pipeline Status

The game supports a hybrid asset system:
- **3D-rendered sprites**: Created with Blender MCP, exported as optimized PNGs
- **Fallback 2D shapes**: Procedural graphics when 3D assets unavailable
- **Asset loading**: Graceful degradation with error handling in `GameScene.preload()`
- **Street theme**: Realistic obstacles (cars, trees, signs) replace abstract shapes