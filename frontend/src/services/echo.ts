import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Necesario para que TypeScript reconozca Pusher en la ventana global
declare global {
    interface Window {
        Pusher: any
        Echo: any
    }
}

// Asignamos Pusher a la ventana global
window.Pusher = Pusher

// Variables de entorno de Vite
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || 'app-key'
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost'
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST || 'localhost'
const REVERB_PORT = Number(import.meta.env.VITE_REVERB_PORT) || 8080

// Creamos la instancia de Echo
const echo = new Echo({
    broadcaster: 'pusher',
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT,
    wssPort: REVERB_PORT,
    forceTLS: false,
    encrypted: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${BACKEND_URL}/broadcasting/auth`,
    auth: {
        headers: {
            // Token para empezar la comunicación ws
            Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
    },
})

window.Echo = echo

export default echo
