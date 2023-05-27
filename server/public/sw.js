const cacheVersion = 'v4';

const filesToCache = [
    '/',
    'index.html',
    'login-page/index.html',
    'login-page/login.js',
    'chat-page/index.html',
    'chat-page/chat.js',
    'chat-page/chat-page.css'
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheVersion)
            .then(cache => {
                console.log("Add all files to cache");
                return cache.addAll(filesToCache);
            })
            .then(() => {
                console.log("Skip waiting");
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete outdated caches
                        console.log('Delete outdated caches', cacheName)
                        if (cacheName !== cacheVersion) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Make the service worker take control of the clients immediately')
                // Make the service worker take control of the clients immediately
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                console.log("Fetch Response", response)
                // Return the cached response if available, otherwise fetch it from the network
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('sync', function (event) {
    console.log("Sync Listner: ", event.tag);

    if (event.tag === 'sendMessages') {
        console.log("event tag");

        event.waitUntil(
            sendOfflineMessages()
        );
    }
});

function sendOfflineMessages() {
    const request = indexedDB.open('offline-messages', 4);

    // Handle database opening success
    request.onsuccess = function (event) {
        const db = (event.target).result;
        // Start a transaction and access the object store
        const transaction = db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');

        // Create a new message object

        // Add the message to the object store
        const getAllRequest = store.getAll();

        // Handle message addition success
        getAllRequest.onsuccess = function (event) {
            const messages = event.target.result;

            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(messages)
            }

            fetch("http://localhost:3000/saveofflinemessage", options)
                .then(response => {
                    if(response.ok) {
                        response.json()
                                .then(payload => {});
                    } else {
                        console.log('Error fetching message:', response.statusText);
                    }
                });
                
            store.clear();
        };

        // Handle message addition error
        getAllRequest.onerror = function (error) {
            console.error('Failed to get offline message', error);
        };

        // Close the database connection
        transaction.oncomplete = function () {
            db.close();
        };
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log("Creating Store")
        const objectStore = db.createObjectStore('messages', { autoIncrement: true });
        objectStore.createIndex('timestamp', 'timestamp');
    };

    // Handle database opening error
    request.onerror = function (error) {
        console.error('Failed to open database:', error);
    };
}

