import type { User } from '../models/models'
import apiClient from '../services/apiClient'
import type { ApiErrorResponse } from '../types/api.types'
import type { AnonymousRegisterPayload } from '../types/payload.types'
import type {
    AuthResponse,
    UserResponse,
    VoidResponse,
    UserStatisticResponse,
} from '../types/response.types'

/**
 * Registra un usuario usando un FormData
 * Devuelve un objeto tipado al estilo de los otros endpoints
 */
export async function registerUser(
    formData: FormData
): Promise<AuthResponse | ApiErrorResponse> {
    try {
        const { data } = await apiClient.post<AuthResponse>(
            '/register',
            formData
        )

        // Guardar token si existe
        if (data?.data?.token) {
            localStorage.setItem('token', data.data.token)
        }

        return data
    } catch (error) {
        console.error('❌ Error en registerUser:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado durante el registro del usuario',
            data: null,
        }
    }
}

/**
 * Logea un usuario con email y password
 * Devuelve AuthResponse o ApiErrorResponse tipado
 */
export async function login(
    email: string,
    password: string
): Promise<AuthResponse | ApiErrorResponse> {
    try {
        const { data: authResponse } = await apiClient.post<
            AuthResponse | ApiErrorResponse
        >('/login', { email, password })

        // Guardar token si existe
        if (authResponse?.data?.token) {
            localStorage.setItem('token', authResponse.data.token)
        }

        return authResponse
    } catch (error) {
        console.error('❌ Error en login:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado durante el inicio de sesión',
            data: null,
        }
    }
}

/**
 * Logout del usuario
 * Devuelve VoidResponse o ApiErrorResponse tipado
 */
export async function logout(): Promise<VoidResponse | ApiErrorResponse> {
    try {
        const { data: voidResponse } =
            await apiClient.post<VoidResponse>('/logout')

        // Limpiar token
        localStorage.removeItem('token')

        return {
            success: voidResponse.success,
            message: voidResponse.message ?? null,
            data: null,
        }
    } catch (error) {
        console.error('❌ Error en logout:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado cerrando sesión',
            data: null,
        }
    }
}

/**
 * Obtiene el perfil del usuario logeado
 * Devuelve AuthResponse con el usuario o ApiErrorResponse en caso de fallo
 */
export async function getProfile(): Promise<UserResponse | ApiErrorResponse> {
    try {
        const { data: userResponse } =
            await apiClient.get<AuthResponse>('/user')

        return userResponse
    } catch (error) {
        console.error('❌ Error en getProfile:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error insesperado recuperando perfil de usuario',
            data: null,
        }
    }
}

/**
 * Comprueba si hay un token de sesión válido
 */
export function isLoggedIn(): boolean {
    //comprobar si el usuario asociado al token tiene email null 
    //ya que si tiene campo a null indentifica si es anonimo
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
        const user: User = JSON.parse(currentUser)
        if (user.email === null) {
            return false
        }
    }
    
    return Boolean(localStorage.getItem('token'))
}

/**
 * Cambia la contraseña del usuario
 * Devuelve VoidResponse o ApiErrorResponse
 */
export async function changePassword(
    current_password: string,
    password: string,
    password_confirmation: string
): Promise<VoidResponse | ApiErrorResponse> {
    try {
        const { data: response } = await apiClient.put<VoidResponse>(
            '/profile/password',
            {
                oldPassword: current_password, // Backend espera 'oldPassword'
                password,
                password_confirmation, // Se envía por si acaso, aunque el back solo valida 'password'
            }
        )

        return response
    } catch (error) {
        console.error('❌ Error cambiando contraseña:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error Inesperado cambiando la contraseña',
            data: null,
        }
    }
}

/**
 * Restaura la contraseña del usuario enviando su email
 * Devuelve VoidResponse o ApiErrorResponse
 */
export async function restorePassword(
    email: string
): Promise<VoidResponse | ApiErrorResponse> {
    try {
        const { data: response } = await apiClient.post<VoidResponse>(
            '/restore-password',
            { email }
        )

        return response
    } catch (error) {
        console.error('❌ Error en restorePassword:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado restaurando la contraseña',
            data: null,
        }
    }
}

/**
 * Resetea la contraseña del usuario
 * Devuelve VoidResponse o ApiErrorResponse
 */
export async function resetPassword(
    password: string
): Promise<VoidResponse | ApiErrorResponse> {
    try {
        const { data: response } = await apiClient.post<VoidResponse>(
            '/reset-password',
            { password }
        )

        return response
    } catch (error) {
        console.error('❌ Error en resetPassword:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado reseteando la contraseña',
            data: null,
        }
    }
}

/**
 * Actualiza el perfil del usuario
 * - Si es FormData (con archivos) usa POST con _method="PUT"
 * - Si es JSON normal usa PUT directo
 * Devuelve AuthResponse con el usuario actualizado o ApiErrorResponse
 */
export async function updateProfile(
    userData: Partial<User> | FormData
): Promise<UserResponse | ApiErrorResponse> {
    try {
        let response: UserResponse

        if (userData instanceof FormData) {
            // FormData -> POST simulando PUT
            userData.append('_method', 'PUT')
            const { data } = await apiClient.post<UserResponse>(
                '/users',
                userData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            )
            response = data
        } else {
            // JSON normal -> PUT directo
            const { data } = await apiClient.put<UserResponse>(
                '/users',
                userData
            )
            response = data
        }

        return response
    } catch (error) {
        console.error('❌ Error en updateProfile:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado actualizando perfil',
            data: null,
        }
    }
}

/**registra un usuario anonimo en el sistema
 * nickname es opcional el nombre que quiere el usuario
 */

export async function registerAnonymous(
    nickname?: string,
    profileUrl?: string
): Promise<AuthResponse | ApiErrorResponse> {
    try {
        //si hay nickname lo ponemos si no, enviamos un objeto vacio
        const payload: AnonymousRegisterPayload = {}
        if (nickname) payload.nickname = nickname
        if (profileUrl) payload.profile_url = profileUrl

        const { data: response } = await apiClient.post<AuthResponse>(
            '/register/anonymous',
            payload
        )

        if (response?.data?.token) {
            localStorage.setItem('token', response.data.token)
        }

        return response
    } catch (error) {
        console.error('❌ Error en registerAnonymous:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado durante el registro anónimo',
            data: null,
        }
    }
}

/**
 * Obtiene las estadisticas de juego del usuario actual
 * Endpoint: GET /users/statistics
 *
 */

export async function getUserStatistics(): Promise<
    UserStatisticResponse | ApiErrorResponse
> {
    try {
        const { data } =
            await apiClient.get<UserStatisticResponse>('/users/statistics')
        return data
    } catch (error) {
        console.error('❌ Error en getUserStatistics:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado obteniendo estadisticas',
            data: null,
        }
    }
}
