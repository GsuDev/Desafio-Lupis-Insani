import type { User } from '../models/User'

/**
 * Respuesta al iniciar sesión
 */
export type ServerResponse = {
    token?: string
    user?: User
    success?: boolean
    message?: string
}
