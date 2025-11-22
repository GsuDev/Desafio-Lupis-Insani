import apiClient from '../services/apiClient'
import type { User } from '../models/User'
import type { ServerResponse } from '../interfaces/ServerResponse'

export async function registerUser(formData: FormData): Promise<User> {
    const { data } = await apiClient.post<{
        success: boolean
        message: string
        data: {
            user: User
            token: string
        }
    }>('/register', formData)

    // Guardar token si existe
    if (data && data.data && data.data.token) {
        localStorage.setItem('token', data.data.token)
    }

    return data.data.user
}

/**
 * Login del usuario
 * @param email Correo electrónico
 * @param password Contraseña
 * @returns Usuario logueado
 * @throws Error si falla el login
 */
export async function login(
    email: string,
    password: string
): Promise<User | undefined> {
    const { data } = await apiClient.post<{
        success: boolean
        message: string
        data: {
            user: User
            token: string
        }
    }>('/login', { email, password })

    // Guardar token si existe
    if (data && data.data && data.data.token) {
        localStorage.setItem('token', data.data.token)
    }

    return data.data.user
}

/**
 * Logout del usuario
 * @throws Error si falla el logout
 */
export async function logout(): Promise<void> {
    await apiClient.post('/logout')
    localStorage.removeItem('token')
}
//CAMBIO
/**
 * Obtener perfil del usuario
 * @returns Usuario
 * @throws Error si falla la petición
 */

export async function getProfile(): Promise<User> {
    // Tipamos la respuesta esperada
    const { data } = await apiClient.get<{
        success: boolean
        message: string
        data: { user: User }
    }>('/user')

    return data.data.user
}

/**
 * Comprueba si hay un token de sesión válido
 */
export function isLoggedIn(): boolean {
    return Boolean(localStorage.getItem('token'))
}

export async function changePassword(
    current_password: string,
    password: string,
    password_confirmation: string
): Promise<ServerResponse> {
    const { data } = await apiClient.put<ServerResponse>('/profile/password', {
        oldPassword: current_password, //  Backend espera 'oldPassword'
        password,
        password_confirmation, // Se envía por si acaso, aunque el back solo valida 'password'
    })
    return data
}

export async function restorePassword(email: string) {
    const { data } = await apiClient.post<ServerResponse>('/restore-password', {
        email,
    })
    return data
}

export async function resetPassword(password: string) {
    const { data } = await apiClient.post<ServerResponse>('/reset-password', {
        password,
    })
    return data
}

/**
 *
 * * NOTA SOBRE FORMDATA:
 * Si enviamos ficheros (FormData), Laravel no procesa bien multipart/form-data en PUT.
 * El truco es enviar POST con el campo _method="PUT".
 */
/**
 *
 *  Si es FormData, usamos POST con _method="PUT". Si es JSON, usamos PUT.
 */
export async function updateProfile(
    userData: Partial<User> | FormData
): Promise<User> {
    // Definimos el tipo de respuesta del backend
    type UpdateResponse = {
        success: boolean
        message: string
        data: { user: User }
    }

    // CAMINO A: FormData (Archivos) -> POST simulando PUT
    if (userData instanceof FormData) {
        userData.append('_method', 'PUT')
        const { data } = await apiClient.post<UpdateResponse>(
            '/users',
            userData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        )
        return data.data.user
    }

    // CAMINO B: JSON normal -> PUT directo
    else {
        const { data } = await apiClient.put<UpdateResponse>('/users', userData)
        return data.data.user
    }
}
