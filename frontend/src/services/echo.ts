import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'

// Necesario para que TypeScript reconozca Pusher en la ventana global
declare global {
    interface Window {
        Pusher: any
        Echo: any
    }
}

// Asignamos Pusher a la ventana global
window.Pusher = Pusher
// Detectar automáticamente si estamos en HTTPS (necesario para Codespaces/Túneles)
const isSecure = window.location.protocol === 'https:'
const currentHost = window.location.hostname
const currentPort = window.location.port
    ? Number(window.location.port)
    : isSecure
      ? 443
      : 80

// Configuración dinámica
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || 'local-app-key'
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1'

// Usamos '/api' relativo para que la autenticación pase por el túnel correctamente
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api'

const echo = new Echo({
    broadcaster: 'pusher',
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,

    // CONFIGURACIÓN CLAVE PARA REMOTO:
    wsHost: currentHost, // Usa el dominio actual (ej: tu-tunel.github.dev)
    wsPort: currentPort, // Usa el puerto actual (443 en https)
    wssPort: currentPort, // Igual para WSS
    forceTLS: isSecure, // Si es https, fuerza WSS

    encrypted: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'], // Intenta ambos

    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios
                    .post(
                        // Asegura que la ruta de auth use la URL relativa correcta
                        `${BACKEND_URL}/broadcasting/auth`,
                        {
                            socket_id: socketId,
                            channel_name: channel.name,
                        },
                        {
                            headers: {
                                Authorization:
                                    'Bearer ' + localStorage.getItem('token'),
                            },
                        }
                    )
                    .then((response) => {
                        callback(null, response.data)
                    })
                    .catch((error) => {
                        callback(
                            error instanceof Error
                                ? error
                                : new Error(String(error)),
                            null
                        )
                    })
            },
        }
    },
})

window.Echo = echo

export default echo
// // Variables de entorno de Vite
// const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || 'local-app-key'
// const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1'
// const BACKEND_URL =
//     import.meta.env.VITE_BACKEND_URL || '/api'
// const REVERB_HOST =
//     import.meta.env.VITE_REVERB_HOST || '/'
// const REVERB_PORT = Number(import.meta.env.VITE_REVERB_PORT) || 80

// // Creamos la instancia de Echo
// const echo = new Echo({
//     broadcaster: 'pusher',
//     key: PUSHER_KEY,
//     cluster: PUSHER_CLUSTER,
//     wsHost: REVERB_HOST,
//     wsPort: REVERB_PORT,
//     wssPort: REVERB_PORT,
//     forceTLS: false,
//     encrypted: true,
//     disableStats: true,
//     enabledTransports: ['ws', 'wss'],
//     // authEndpoint: `${BACKEND_URL}/broadcasting/auth`,
//     // auth: {
//     //     headers: {
//     //         // Token para empezar la comunicación ws
//     //         Authorization: 'Bearer ' + localStorage.getItem('token'),
//     //     },
//     // },
//     authorizer: (channel, options) => {
//         return {
//             authorize: (socketId, callback) => {
//                 axios
//                     .post(
//                         `${BACKEND_URL}/broadcasting/auth`,
//                         {
//                             socket_id: socketId,
//                             channel_name: channel.name,
//                         },
//                         {
//                             headers: {
//                                 // AQUÍ ESTÁ LA CLAVE: Leemos el token EN EL MOMENTO de la petición
//                                 Authorization:
//                                     'Bearer ' + localStorage.getItem('token'),
//                             },
//                         }
//                     )
//                     .then((response) => {
//                         callback(null, response.data)
//                     })
//                     .catch((error) => {
//                         callback(
//                             error instanceof Error
//                                 ? error
//                                 : new Error(String(error)),
//                             null
//                         )
//                     })
//             },
//         }
//     },
// })

// window.Echo = echo

// export default echo
