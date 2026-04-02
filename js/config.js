// Configuración centralizada del API.
// Resuelve dinámicamente BASE_URL según el entorno:
//
//  - Desarrollo local (localhost / 127.0.0.1):
//      → usa http://localhost:8000
//  - Producción (cualquier otro host):
//      → usa el mismo origen/host que sirve el frontend
//
// Uso:
//   import { API_URL } from './config.js';
//   fetch(API_URL + '/login', ...)

const API_CONFIG = (function () {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    const BASE_URL = isLocal
        ? 'http://localhost:8000'
        : `${window.location.protocol}//${window.location.host}`;

    return {
        BASE_URL,
        API_PATH: '/api/auth',
        API_URL: BASE_URL + '/api/auth',
        API_USERS_URL: BASE_URL + '/api/users',
        isLocal,
    };
})();
