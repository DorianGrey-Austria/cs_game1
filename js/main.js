document.addEventListener('DOMContentLoaded', async () => {
    const game = new Game();
    
    // Global error handling
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        document.getElementById('status').textContent = 'Ein Fehler ist aufgetreten. Seite neu laden.';
    });

    // Check browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        document.getElementById('status').textContent = 'Browser unterstützt keine Webcam-Funktionen';
        document.getElementById('feedback').className = 'feedback error';
        document.querySelector('.feedback-text').textContent = 'Bitte verwenden Sie einen modernen Browser (Chrome, Firefox, Safari)';
        return;
    }

    // Check TensorFlow.js support
    if (typeof tf === 'undefined') {
        document.getElementById('status').textContent = 'TensorFlow.js konnte nicht geladen werden';
        document.getElementById('feedback').className = 'feedback error';
        document.querySelector('.feedback-text').textContent = 'Bitte überprüfen Sie Ihre Internetverbindung';
        return;
    }

    // Initialize the game
    try {
        const initialized = await game.initialize();
        if (!initialized) {
            document.querySelector('.feedback-text').textContent = 'Spiel konnte nicht initialisiert werden. Webcam-Zugriff erforderlich.';
            document.getElementById('feedback').className = 'feedback error';
        }
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('status').textContent = 'Initialisierung fehlgeschlagen';
        document.getElementById('feedback').className = 'feedback error';
        document.querySelector('.feedback-text').textContent = error.message;
    }

    // Debug information (remove in production)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setInterval(() => {
            const stats = game.getGameStats();
            console.log('Game Stats:', stats);
        }, 5000);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                document.getElementById('startBtn').click();
                break;
            case 'KeyR':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    document.getElementById('resetBtn').click();
                }
                break;
        }
    });

    // Add resize handler for responsive canvas
    window.addEventListener('resize', () => {
        // Canvas will automatically adjust due to CSS, but we might need to update internal dimensions
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        if (video && canvas) {
            const rect = video.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
    });

    // Visibility API to pause game when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.isRunning && !game.isPaused) {
            game.pause();
        }
    });
});