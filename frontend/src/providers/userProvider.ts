import apiClient from '../services/apiClient'
import type { User } from '../models/User'
import type { ServerResponse } from '../interfaces/ServerResponse'

export async function registerUser(formData: FormData): Promise<User> {
    const { data } = await apiClient.post<{
        token?: string
        user: User
    }>('/register', formData)

    // Guardar token si existe
    if (data.token) {
        localStorage.setItem('token', data.token)
    }

    return data.user
}

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

/**
 * Comprueba si hay un token de sesión válido
 */
export function isLoggedIn(): boolean {
    return Boolean(localStorage.getItem('token'))
}

export async function changePassword(
    oldPassword: string,
    password: string
): Promise<ServerResponse> {
    const { data } = await apiClient.post<ServerResponse>('/change-password', {
        oldPassword,
        password,
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
