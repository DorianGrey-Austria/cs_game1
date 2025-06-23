# CLAUDE DESKTOP PROMPT - 3D BLENDER ASSETS FÜR PUSHUP PANIC

## PROJEKT ÜBERSICHT

Du sollst hochwertige 3D Blender Assets für das Webcam-basierte Ausweichspiel "PushUp Panic" erstellen. Das Spiel verwendet aktuell einfache 2D geometrische Formen (Kreise, Rechtecke, Dreiecke) in Phaser 3 und soll mit realistischen 3D Assets erweitert werden.

## AKTUELLER GAME STATUS

**Technologie Stack:**
- Phaser 3.70.0 (Canvas-basiertes 2D Rendering)
- TensorFlow.js MoveNet (Pose Detection)
- Webcam-gesteuerte Spieler-Bewegung
- Browser-basiert, kein Build-Process

**Aktuelle 2D Assets (zu ersetzen):**
- Ball: Roter Kreis (40px, Geschwindigkeit: 200, Score: 10)
- Box: Türkises Rechteck (45px, Geschwindigkeit: 180, Score: 15)  
- Rocket: Gelbes Dreieck (60px, Geschwindigkeit: 300, Score: 25)
- Star: Grüner Stern (35px, Geschwindigkeit: 160, Score: 20)
- Player: Grünes Rechteck mit Kreis als Kopf (60x80px)

**Game Mechanics:**
- Objekte spawnen rechts, bewegen sich nach links
- Spieler ausweichen durch Ducken/Springen/Seitlich bewegen
- Kollisionserkennung via AABB (Bounding Box)
- Progressive Schwierigkeit (mehr Objekte, höhere Geschwindigkeit)

## BENÖTIGTE 3D ASSETS - DETAILLIERTE SPEZIFIKATIONEN

### 1. STRASSENSYSTEM (Road Infrastructure)

#### 1.1 Hauptstraße (road_segment_straight.glb)
- **Beschreibung**: Gerade Straßensegmente für endlose Bewegung
- **Maße**: 800x400 Blender Units (entspricht Bildschirmbreite)
- **Textur**: Realistischer Asphalt mit leichten Gebrauchsspuren
- **Details**:
  - Weiße Mittellinien (gestrichelt, 10 Units breit)
  - Seitenlinien (durchgezogen, 5 Units breit)
  - Leichte Unebenheiten für Realismus
  - Randsteine (20 Units hoch)
- **Polycount**: Max 2000 Dreiecke
- **UV-Mapping**: Tileable Texturen für nahtlose Wiederholung

#### 1.2 Straßenkurve (road_segment_curve.glb)
- **Beschreibung**: Leichte Kurven für visuelle Abwechslung
- **Varianten**: Links- und Rechtskurve
- **Krümmungsradius**: Sanft (nicht zu scharf)
- **Gleiche Textur-Standards wie Hauptstraße**

#### 1.3 Gehweg-Elemente (sidewalk_elements.glb)
- **Beschreibung**: Bürgersteige zu beiden Seiten
- **Höhe**: 15 Units über Straßenniveau
- **Textur**: Betonplatten-Muster
- **Breite**: 100 Units pro Seite
- **Inklusive**: Bordsteinkanten, Gullydeckel

### 2. FLIEGENDE OBJEKTE (Projectiles) - 3D UPGRADES

#### 2.1 Fußball (flying_ball.glb)
- **Typ**: Klassischer Fußball mit Pentagonmuster
- **Größe**: 40 Units Durchmesser
- **Textur**: Schwarz-weiße Fußball-Optik
- **Material**: Leichter Glanz (nicht matt)
- **Polycount**: Max 500 Dreiecke
- **Animation**: Rotation um alle Achsen während Flug

#### 2.2 Holzkiste (flying_box.glb)
- **Typ**: Transportkiste aus Holz
- **Größe**: 45x45x45 Units
- **Textur**: Braunes Holz mit Metallbeschlägen
- **Details**: Aufgedruckte Warnsymbole, Nägel, Scharniere
- **Polycount**: Max 800 Dreiecke
- **Animation**: Rotation um Y-Achse

#### 2.3 Rakete (flying_rocket.glb)
- **Typ**: Cartoon-style Rakete
- **Größe**: 60 Units lang, 20 Units Durchmesser
- **Farben**: Rot-weiß gestreift mit blauer Spitze
- **Details**: Fenster, Finnen, Düse
- **Effekt**: Glühender Flammenstrahl (separates Objekt)
- **Polycount**: Max 1000 Dreiecke
- **Animation**: Rotation um Längsachse + Flammen-Flackern

#### 2.4 Goldener Stern (flying_star.glb)
- **Typ**: 5-zackiger Stern
- **Größe**: 35 Units Durchmesser
- **Material**: Glänzendes Gold mit Glitzereffekt
- **Textur**: Metallisches Gold mit Reflexionen
- **Polycount**: Max 600 Dreiecke
- **Animation**: Langsame Rotation + Pulsieren (Scale-Animation)

### 3. STADTUMGEBUNG (Urban Environment)

#### 3.1 Bürogebäude (building_office_01.glb bis building_office_03.glb)
- **Anzahl**: 3 verschiedene Varianten
- **Höhe**: 200-500 Units (verschiedene Stockwerke)
- **Stil**: Moderne Glasfassaden mit Betonrahmen
- **Details**: Fenster mit Reflexionen, Klimaanlagen, Antennen
- **Texturen**: Glas (reflektierend), Beton (matt), Metall
- **Polycount**: Max 1500 Dreiecke pro Gebäude

#### 3.2 Wohnhäuser (building_house_01.glb, building_house_02.glb)
- **Anzahl**: 2 verschiedene Varianten
- **Höhe**: 100-150 Units (1-2 Stockwerke)
- **Stil**: Suburbia-Häuser mit Satteldach
- **Details**: Türen, Fenster, Schornstein, kleine Gärten
- **Texturen**: Ziegel, Holz, Glas
- **Polycount**: Max 1200 Dreiecke pro Haus

#### 3.3 Straßenmöbel (street_furniture.glb)
- **Inhalte**: 
  - Straßenlaternen (LED-Style, 150 Units hoch)
  - Verkehrsschilder (Geschwindigkeit, Warnung, Stopp)
  - Mülltonnen (grau/grün, verschiedene Größen)
  - Bänke (einfaches Design)
  - Absperrungen (rot-weiß gestreift)
- **Polycount**: Max 200 Dreiecke pro Objekt

#### 3.4 Vegetation (vegetation.glb)
- **Inhalte**:
  - Straßenbäume (Low-Poly, verschiedene Größen)
  - Büsche (rund, verschiedene Grüntöne)
  - Gras-Patches für Straßenränder
- **Stil**: Stylized, nicht photorealistisch
- **Polycount**: Max 300 Dreiecke pro Baum

### 4. SPIELER-CHARAKTER (Player Avatar)

#### 4.1 Basis-Charakter (player_character.glb)
- **Stil**: Low-Poly Humanoid (Stickman-inspiriert)
- **Proportionen**: Leicht überzeichnet (große Hände/Füße)
- **Größe**: 60 Units breit, 80 Units hoch
- **Farben**: Helle, freundliche Farben (Blau, Grün, Orange)
- **Polycount**: Max 800 Dreiecke

#### 4.2 Animationen (in derselben .glb Datei)
- **Idle**: Leichtes Wippen, Atmen
- **Duck**: Schnelles Ducken (Kopf nach unten)
- **Jump**: Sprung mit angewinkelten Beinen
- **Lean_Left**: Körper nach links neigen
- **Lean_Right**: Körper nach rechts neigen
- **Hit**: Zurückprallen bei Kollision
- **Framerate**: 30 FPS, Loop-fähig

### 5. HINTERGRUND-ELEMENTE (Background)

#### 5.1 Himmel-Skybox (skybox_city.glb)
- **Beschreibung**: 360° Stadtpanorama
- **Inhalt**: Entfernte Wolkenkratzer, Berge, Wolken
- **Farben**: Helle Tageszeit (blauer Himmel, weiße Wolken)
- **Stil**: Vereinfacht, nicht ablenkend
- **Polycount**: Max 1000 Dreiecke

#### 5.2 Parallax-Hintergrund (background_layers.glb)
- **Layer 1**: Entfernte Berge (statisch)
- **Layer 2**: Mittlere Gebäude (langsame Bewegung)
- **Layer 3**: Nahe Objekte (schnelle Bewegung)
- **Verwendung**: Parallax-Scrolling für Tiefeneffekt

## TECHNISCHE ANFORDERUNGEN

### Datei-Spezifikationen
- **Format**: GLTF 2.0 (.glb) - Embedded Textures
- **Backup-Format**: OBJ + MTL (falls GLTF Probleme)
- **Texturen**: PNG, max 1024x1024px, Web-optimiert
- **Kompression**: DRACO wenn möglich

### Performance-Ziele
- **Gesamt-Polycount**: Unter 50,000 Dreiecke für alle Assets
- **Textur-Budget**: Max 50MB für alle Texturen
- **Loading-Zeit**: Unter 5 Sekunden auf 4G-Verbindung
- **Frame-Rate**: 60 FPS auf modernen Browsern

### Blender-Workflow
1. **Scene Setup**: Neue .blend Datei pro Asset-Kategorie
2. **Units**: Metrisch, 1 Blender Unit = 1 Game Pixel
3. **Origin**: Alle Objekte am Koordinatenursprung zentriert
4. **Naming**: Descriptive Namen (z.B. "Ball_Main", "Ball_Shadow")
5. **Materials**: Principled BSDF, PBR-Workflow
6. **Lighting**: Consistent 3-Point Setup für alle Assets

### Export-Einstellungen
```
GLTF 2.0 Export Settings:
✓ Include: Selected Objects
✓ Transform: +Y Up
✓ Data: Mesh, Materials, Images
✓ Compression: DRACO (wenn verfügbar)
✓ Animation: Export alle Keyframes
✗ Cameras, Lights (nicht benötigt)
```

## STIL-GUIDE

### Visuelle Richtlinien
- **Stilrichtung**: Low-Poly mit stylized Realismus
- **Farbpalette**: Hell und kontrastreich
  - Primär: Blau (#4299E1), Grün (#48BB78), Orange (#ED8936)
  - Akzent: Gelb (#ECC94B), Rot (#F56565)
  - Neutral: Grau (#718096), Weiß (#FFFFFF)
- **Beleuchtung**: Gleichmäßig ausgeleuchtet, keine harten Schatten
- **Texturen**: Clean, nicht zu detailliert, gut lesbar

### Konsistenz-Regeln
- Alle Assets folgen derselben Polygon-Budget-Verteilung
- Konsistente UV-Mapping-Dichte
- Einheitliche Material-Properties (Roughness, Metallic)
- Gleiche Export-Settings für alle Assets

## DELIVERABLES CHECKLISTE

### Asset-Dateien (18 .glb Dateien)
- [ ] road_segment_straight.glb
- [ ] road_segment_curve.glb
- [ ] sidewalk_elements.glb
- [ ] flying_ball.glb
- [ ] flying_box.glb
- [ ] flying_rocket.glb
- [ ] flying_star.glb
- [ ] building_office_01.glb
- [ ] building_office_02.glb
- [ ] building_office_03.glb
- [ ] building_house_01.glb
- [ ] building_house_02.glb
- [ ] street_furniture.glb
- [ ] vegetation.glb
- [ ] player_character.glb (mit Animationen)
- [ ] skybox_city.glb
- [ ] background_layers.glb
- [ ] flame_effect.glb (für Rakete)

### Zusätzliche Dateien
- [ ] Preview-Screenshots (PNG, 1920x1080)
- [ ] Asset-Spezifikationen (TXT mit Polycount, Texturgröße)
- [ ] Separate Texturen (PNG-Ordner als Backup)
- [ ] Blender-Quelldateien (.blend)

### Organisationsstruktur
```
3d_assets_pushup_panic/
├── models/
│   ├── road/
│   ├── objects/
│   ├── buildings/
│   ├── environment/
│   └── player/
├── textures/
│   ├── road/
│   ├── objects/
│   ├── buildings/
│   └── player/
├── previews/
├── blender_sources/
└── specifications.txt
```

## INTEGRATION VORBEREITUNG

### Asset-Mapping für Code-Integration
```javascript
// Aktuelle 2D → Neue 3D Entsprechungen
const ASSET_MAPPING = {
    // Fliegende Objekte
    'ball': 'flying_ball.glb',
    'box': 'flying_box.glb', 
    'rocket': 'flying_rocket.glb',
    'star': 'flying_star.glb',
    
    // Umgebung
    'road': 'road_segment_straight.glb',
    'player': 'player_character.glb'
};
```

### Performance-Tests
- [ ] Alle Assets in Blender GLB-Viewer testen
- [ ] Gesamtgröße unter 100MB bestätigen
- [ ] Browser-Kompatibilität (Chrome, Firefox, Safari)
- [ ] Mobile Performance (iOS Safari, Chrome Mobile)

## QUALITÄTSKONTROLLE

### Vor Delivery prüfen:
1. **Visuelle Konsistenz**: Alle Assets passen stilistisch zusammen
2. **Performance Budget**: Polycount und Texturgröße eingehalten
3. **Animation Quality**: Alle Animationen sind smooth und loop-fähig
4. **Export Integrity**: Alle .glb Dateien laden korrekt
5. **Naming Convention**: Konsistente, beschreibende Dateinamen
6. **Documentation**: Vollständige Asset-Spezifikationen

### Test-Szenarien:
- Laden aller Assets in einer Blender-Szene
- Export/Import-Roundtrip ohne Verluste
- Skalierung auf verschiedene Auflösungen
- Animation-Playback in verschiedenen Viewern

---

**WICHTIGER HINWEIS**: Diese Assets werden in ein laufendes Webcam-Spiel integriert. Die Performance ist kritisch - lieber etwas weniger Details als Performance-Probleme. Die visuelle Klarheit (Erkennbarkeit der Objekte) ist wichtiger als Photorealismus.

**NÄCHSTER SCHRITT**: Nach Asset-Erstellung folgt die Integration mit Claude Code für nahtlose Copy-Paste-Installation in das bestehende Spiel.2