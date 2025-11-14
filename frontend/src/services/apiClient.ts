import axios from 'axios'

/**
 * Cliente API configurado con interceptores para:
 * - Añadir token automáticamente a las peticiones
 * - Manejar errores de respuesta de forma centralizada
 */

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        // 'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})

// Interceptor para añadir el token automáticamente
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
    (response) => response, // Si todo va bien, devuelve la respuesta
    (error) => {
        // Extraer mensaje de error del servidor o usar uno por defecto
        const message =
            error?.response?.data?.message ||
            error?.message ||
            'Error en la petición al servidor'

        // Si es error 401 (no autorizado), limpiamos el token
        if (error?.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('currentUser')
            // Opcional: redirigir al login
            // window.location.href = '/login'
        }

        // Lanzamos un error con el mensaje para que lo capture el provider
        throw new Error(message)
    }
)

export default apiClient
