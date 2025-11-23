// importamos la libreria echo que gestiona la conexion
import Echo from 'laravel-echo';
// importamos la libreria pusher, que es el protocolo que usa reverb
import Pusher from 'pusher-js';

// typescript necesita saber que pusher existe en la ventana global
// esto es un truco tecnico para que funcione en el navegador
declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

// asignamos pusher a la ventana global
window.Pusher = Pusher;

// creamos la instancia de la "radio" (echo)
// aqui configuramos donde esta el servidor reverb escuchando
const echo = new Echo({
    broadcaster: 'pusher', // le decimos que usamos el protocolo pusher
    key: 'app-key',
    cluster: 'mt1', // aqui deberia ir tu clave publica (esta en el .env del backend)
    wsHost: 'localhost', // la direccion de tu servidor (tu pc)
    wsPort: 8080, // el puerto por defecto de reverb
    wssPort: 8080, // el puerto seguro (igual que el normal en local)
    forceTLS: false, // en local no usamos https (candado verde), asi que false
    encrypted: true,
    disableStats: true, // para que no envie estadisticas a pusher.com
    enabledTransports: ['ws', 'wss'], // permitimos websockets normales y seguros
    
    // esta parte es crucial para los canales privados
    // aqui le decimos a echo: "cuando necesites permiso, llama a esta url"
    // nota: ajusta '/api/broadcasting/auth' si vuestra ruta es diferente
    // y asegurate de pasar el token de autenticacion si ya teneis login
    authEndpoint: 'http://localhost:8000/api/broadcasting/auth', 
    auth: {
        headers: {
            // si teneis el token guardado en localstorage, hay que ponerlo aqui
            // 'Authorization': 'Bearer ' + localStorage.getItem('token')
            // si usais cookies (sanctum spa), esto no hace falta configurarlo tanto
        }
    }
});

// exportamos la radio encendida para usarla en otros archivos
export default echo;