# 🚀 PushUp Panic - GitHub → Hostinger Deployment

## ⚡ **AUTOMATED DEPLOYMENT SETUP**

### **1. GitHub Repository Setup**

Erstelle ein neues Repository:
```bash
# GitHub Repository erstellen:
# 1. Gehe zu https://github.com/new
# 2. Name: pushup-panic
# 3. Description: Webcam-based action dodge game with AI pose detection
# 4. ✅ Public
# 5. Create repository

# Dann lokal:
git remote add origin https://github.com/DEIN_USERNAME/pushup-panic.git
git branch -M main
git push -u origin main
```

### **2. Hostinger FTP-Credentials Setup**

Du brauchst deine **FTP-Daten von Hostinger**:

1. **Hostinger hPanel** öffnen: https://hpanel.hostinger.com
2. **File Manager** → **FTP Details** (oder **Advanced** → **FTP Accounts**)
3. **Folgende Daten notieren**:
   - **FTP Server**: (z.B. `ftp.aiworkflows.at` oder IP-Adresse)
   - **Username**: (dein FTP-Benutzername)
   - **Password**: (dein FTP-Passwort)

### **3. GitHub Secrets konfigurieren**

In deinem GitHub Repository:

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** für jeden Wert:

```
Name: FTP_SERVER
Value: ftp.aiworkflows.at (dein FTP Server)

Name: FTP_USERNAME  
Value: dein_ftp_username

Name: FTP_PASSWORD
Value: dein_ftp_password
```

### **4. Automatisches Deployment**

**✅ FERTIG!** Ab jetzt:

- **Jeder Push zu `main`** deployt automatisch
- **Files landen in** `/public_html/pushup-panic/`
- **Live unter**: https://aiworkflows.at/pushup-panic/

## 🎯 **Workflow-Features**

### **GitHub Actions Pipeline:**
- ✅ **Automatischer Build** bei jedem Push
- ✅ **Production-Optimierung** (HTML, CSS, JS)
- ✅ **HTTPS-Enforcement** via .htaccess
- ✅ **FTP-Upload** zu Hostinger
- ✅ **Cache-Headers** für Performance
- ✅ **Security-Headers** für Sicherheit

### **Deployment-Verzeichnis:**
```
/public_html/pushup-panic/
├── index.html (production-optimized)
├── styles.css
├── sw.js (Service Worker)
├── .htaccess (HTTPS + Security)
├── js/
│   ├── gameManager.js
│   ├── supabaseManager.js
│   └── ... (alle Game-Files)
└── assets/
    ├── female_character_sprite.png
    ├── street_background.png
    └── ... (alle 3D-Assets)
```

## 🔧 **Manuelle Deployment-Optionen**

### **Option 1: GitHub Actions (Empfohlen)**
```bash
git add .
git commit -m "Deploy PushUp Panic"
git push origin main
# → Automatisches Deployment startet
```

### **Option 2: Manueller Trigger**
1. GitHub Repository → **Actions**
2. **Deploy PushUp Panic to Hostinger**
3. **Run workflow** → **Run workflow**

### **Option 3: Lokaler Build + Upload**
```bash
# Production Build erstellen:
cp index-production.html index.html

# Manual FTP upload (mit deinen Credentials):
curl -T index.html ftp://ftp.aiworkflows.at/public_html/pushup-panic/ --user "username:password"
```

## 🌐 **Nach dem Deployment**

### **Live-URL**: https://aiworkflows.at/pushup-panic/

### **Deployment-Verifikation**:
1. **Webcam-Zugriff** testen (Browser fragt nach Berechtigung)
2. **Pose-Detection** testen (vor Kamera bewegen)
3. **Game Over** → **Highscore-System** testen
4. **Responsive Design** auf verschiedenen Geräten

### **Monitoring**:
- **GitHub Actions** → Status der Deployments
- **Browser DevTools** → Console für Errors
- **Hostinger hPanel** → File Manager für deployed Files

## 🎮 **Game Features (Production-Ready)**

- ✅ **TensorFlow.js MoveNet** Pose Detection
- ✅ **Supabase PostgreSQL** Highscore System  
- ✅ **Phaser 3** Game Engine mit Physics
- ✅ **Progressive Difficulty** Scaling
- ✅ **Cyberpunk Visual Effects** 
- ✅ **Service Worker** für Performance
- ✅ **HTTPS Security** (required für Webcam)
- ✅ **Responsive Design** für alle Devices

---

## 🚀 **READY TO DEPLOY!**

**Next Steps:**
1. **FTP-Credentials** aus Hostinger hPanel holen
2. **GitHub Secrets** konfigurieren  
3. **Push to main** → Automatic deployment!

**Target**: https://aiworkflows.at/pushup-panic/ 🎯