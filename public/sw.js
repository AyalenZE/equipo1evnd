// imports
importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js')

importScripts('js/sw-db.js');
importScripts('js/sw-utils.js');


const STATIC_CACHE    = 'static-v1';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';


const APP_SHELL = [
    '/',
    'index.html',
    'registro.html',
    'css/style.css',
    'css/base.css',
    'css/bg.png',
    'img/favicon.ico',
    'img/carreras/AnimacionDigital.png',
    'img/carreras/Impresora3D.png',
    'img/carreras/DesarrolloSoftware.png',
    'img/carreras/Cisco.png',
    'img/carreras/VideoJuegos.png',
    'img/carreras/1.jpg',
    'img/carreras/2.jpg',
    'img/carreras/3.jpg',
    'img/carreras/4.jpg',
    'img/carreras/5.jpg',
    'img/carreras/6.jpg',
    'img/carreras/7.jpg',
    'img/carreras/8.jpg',
    'img/icons/icon-152x152.png',
    'js/app.js',
    'js/camara-class.js',
    'js/sw-utils.js',
    'js/sw-db.js',
    'js/base.js',
    'js/libs/plugins/mdtoast.min.js',
    'js/libs/plugins/mdtoast.min.css'
];

const APP_SHELL_INMUTABLE = [
    'https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.0.0/mdb.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js',
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js',
    'https://kit.fontawesome.com/2dacfe4099.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.0.1/mdb.min.css',
    'https://rsms.me/inter/inter.css',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.3.0/dist/pouchdb.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.0.0/mdb.min.js',
    
    
];


self.addEventListener('install', e => {


    const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
        cache.addAll(APP_SHELL));

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache =>
        cache.addAll(APP_SHELL_INMUTABLE));


    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));

});


self.addEventListener('activate', e => {

    const respuesta = caches.keys().then(keys => {

        keys.forEach(key => {

            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }

            if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil(respuesta);

});


self.addEventListener('fetch', e => {

    let respuesta;
    if (e.request.url.includes('/api')) {

        respuesta = manejoApiMensaje(DYNAMIC_CACHE, e.request);

    } else {
        respuesta = caches.match(e.request).then(res => {

            if (res) {

                actualizaCacheStatico(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
                return res;
            } else {

                return fetch(e.request).then(newRes => {

                    return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);

                });

            }
        });

    }


    e.respondWith(respuesta);

});

//Tareas asíncronas

self.addEventListener('sync', e => {
    console.log('SW:Syncronizada');
    if (e.tag === 'nuevo-post') {
        //postear a DB cuando hay conexion

        const respuesta = postearMensajes();

        e.waitUntil(respuesta);
    }
});
