const CACHE_NAME = 'pushup-panic-v1.0.0';
const urlsToCache = [
    '/',
    '/styles.css',
    '/js/performanceManager.js',
    '/js/visualEffects.js',
    '/js/uiManager.js',
    '/js/supabaseManager.js',
    '/js/webcamManager.js',
    '/js/poseTracker.js',
    '/js/gameObjects.js',
    '/js/gameScene.js',
    '/js/gameManager.js',
    '/js/app.js',
    '/assets/female_character_sprite.png',
    '/assets/street_background.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});