import type { AuthResponse} from "../interfaces/User.mock";

const API_URL = 'http://localhost:8000/api';
//Esta función llama el endpoint del backend
//enviando el objeto FormData completo
export const registerUser = async (formData:FormData): Promise<AuthResponse> => {
    console.log('PROVIDER Real: Enviando FormData al backend...',formData);
    try{
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            body: formData,
        
        });
        console.log(formData);

        const data = await response.json();

        if (!response.ok) {
            //si la respuesta no es un 200-299 (por ejemeplo 422 del validator)
            //lanza un error para que lo coja el 'catch' del controller

            //Mapeamos los errores del validator de laravel
            if (response.status === 422) {
                const errors = Object.values(data.errors).join(', ');
                throw new Error(errors);
            }
            throw new Error(data.message || 'Error desconocido del servidor');
        }

        //si la respuesta es ok (200 o 201)
        return data;
    }catch(error){
        console.error('Error en registerUser Provider:', error);
        throw error;
    }
    
};
import apiClient from '../services/apiClient'
import type { User } from '../models/User'

/**
 * Login del usuario
 * @param email Correo electrónico
 * @param password Contraseña
 * @returns Usuario logueado
 * @throws Error si falla el login
 */
export async function login(email: string, password: string): Promise<User> {
    const { data } = await apiClient.post<{
        token?: string
        user: User
    }>('/login', { email, password })

    // Guardar token si existe
    if (data.token) {
        localStorage.setItem('token', data.token)
    }

    return data.user
}

/**
 * Logout del usuario
 * @throws Error si falla el logout
 */
export async function logout(): Promise<void> {
    await apiClient.post('/logout')
    localStorage.removeItem('token')
}

/**
 * Obtener perfil del usuario
 * @returns Usuario
 * @throws Error si falla la petición
 */
export async function getProfile(): Promise<User> {
    const { data } = await apiClient.get<User>('/user')
    return data
}

/*
Export async function register(userData: {
    nickname: string
    name: string
    lastname: string
    email: string
    password: string
    birthdate: string
    profile_url?: string
}): Promise<User> {
    const { data } = await apiClient.post<{
        token?: string
        user: User
    }>('/register', userData)

    // Guardar token si existe
    if (data.token) {
        localStorage.setItem('token', data.token)
    }

    return data.user
}
 */

/**
 * Comprueba si hay un token de sesión válido
 */
export function isLoggedIn(): boolean {
    return Boolean(localStorage.getItem('token'))
}
