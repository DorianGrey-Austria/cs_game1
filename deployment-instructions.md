# 🚀 PushUp Panic - Deployment Instructions

## Prepared Files
✅ **Production-optimized HTML** mit Security Headers und HTTPS-Enforcement
✅ **Service Worker** für bessere Performance und Caching
✅ **Deployment ZIP** ready für Upload: `deployment/pushup-panic-deploy.zip`
✅ **.htaccess** mit HTTPS-Redirect und Security Headers

## Manual Upload Steps (Recommended)

### Option 1: Via Hostinger File Manager (Einfachste Methode)
1. **Hostinger Dashboard öffnen**: https://hpanel.hostinger.com
2. **File Manager aufrufen** (wie im Screenshot gezeigt)
3. **Navigation**: `public_html/` Verzeichnis öffnen
4. **Upload**: `deployment/pushup-panic-deploy.zip` hochladen
5. **Entpacken**: ZIP-Datei im File Manager entpacken
6. **Zugriff**: https://aiworkflows.at/pushup-panic/

### Option 2: Via FTP
```bash
# FTP Credentials von Hostinger Dashboard holen
# Upload deployment/pushup-panic/ zu public_html/pushup-panic/
```

## Was wurde optimiert für Production:

### 🔒 Security & HTTPS
- Content Security Policy für sicheren Code-Ausführung
- HTTPS-Enforcement (Required für Webcam!)
- Security Headers (X-Frame-Options, X-XSS-Protection)

### ⚡ Performance
- Script-Dateien mit `defer` für bessere Load-Performance
- Service Worker für Caching
- Gzip-Kompression via .htaccess
- Cache Headers für statische Assets

### 🎮 Game Features
- Vollständige Supabase Integration für Highscores
- Webcam-Funktionalität (requires HTTPS)
- Responsive Design für verschiedene Bildschirmgrößen
- Debug Panel versteckt in Production

## Nach dem Upload testen:

1. **Grundfunktion**: https://aiworkflows.at/pushup-panic/
2. **Webcam-Zugriff**: Browser sollte um Webcam-Berechtigung fragen
3. **Pose Detection**: TensorFlow.js sollte erfolgreich laden
4. **Supabase**: Highscores sollten nach Game Over gespeichert werden

## Troubleshooting:

**Problem**: Webcam funktioniert nicht
**Lösung**: HTTPS muss aktiv sein (automatisch via .htaccess redirect)

**Problem**: TensorFlow.js lädt nicht
**Lösung**: CSP-Header prüfen, eventuell anpassen

**Problem**: Supabase Connection Error
**Lösung**: Prüfen ob Supabase-Domain in CSP whitelisted ist

## Ready to go! 🎯

Die komplette Deployment-Struktur ist vorbereitet. Einfach den "Hosting" Bereich im Hostinger Dashboard aufrufen (wie im Screenshot) und die Dateien uploaden.