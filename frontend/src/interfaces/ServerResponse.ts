import type { User } from '../models/User'

export interface ServerResponse {
    success: boolean
    message: string | null
    data: {
        user?: User
        token?: string
    } | null
}
