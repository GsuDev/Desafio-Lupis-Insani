import type { User } from '../models/User'
import * as userProvider from '../providers/userProvider'

/**
 * Controlador de usuario
 * Gestiona la sesión y la información del usuario actual.
 */
class UserController {
    /** Instancia singleton del controlador */
    private static instance: UserController

    /** Usuario actual logueado */
    private _currentUser: User | undefined

    /** Constructor privado para singleton */
    private constructor() {
        this.restoreSession()
    }

    /**
     * Devuelve la instancia singleton del controlador
     */
    static getInstance(): UserController {
        UserController.instance ||= new UserController()
        return UserController.instance
    }

    /** Usuario actual */
    get currentUser(): User | undefined {
        return this._currentUser
    }

    /** Comprueba si hay sesión activa */
    get isLoggedIn(): boolean {
        return userProvider.isLoggedIn() && Boolean(this._currentUser)
    }

    /**
     * Inicia sesión con email y contraseña
     * @param email Correo electrónico del usuario
     * @param password Contraseña del usuario
     * @returns Usuario logueado
     * @throws Error si falla el login
     */
    async login(email: string, password: string): Promise<User> {
        const user = await userProvider.login(email, password)

        this._currentUser = user
        localStorage.setItem('currentUser', JSON.stringify(user))

        return user
    }

    /*

    
     * Registra un nuevo usuario
     * @param userData Datos del usuario a registrar
     * @returns Usuario registrado
     * @throws Error si falla el registro
    
    async register(userData: {
        nickname: string
        name: string
        lastname: string
        email: string
        password: string
        birthdate: string
        profile_url?: string
    }): Promise<User> {
        const user = await userProvider.register(userData)
        
        this._currentUser = user
        localStorage.setItem('currentUser', JSON.stringify(user))
        
        return user
    }
    */

    /**
     * Cierra sesión y elimina los datos locales
     * @throws Error si falla el logout
     */
    async logout(): Promise<void> {
        await userProvider.logout()

        this._currentUser = undefined
        localStorage.removeItem('currentUser')
    }

    /**
     * Carga el perfil del usuario desde la API y actualiza la sesión
     * @returns Usuario actualizado
     * @throws Error si falla la carga del perfil
     */
    async loadProfile(): Promise<User> {
        const user = await userProvider.getProfile()

        this._currentUser = user
        localStorage.setItem('currentUser', JSON.stringify(user))

        return user
    }

    /** Restaura la sesión desde localStorage si existe */
    private restoreSession(): void {
        const savedUser = localStorage.getItem('currentUser')
        if (savedUser) {
            try {
                this._currentUser = JSON.parse(savedUser) as User
            } catch {
                // Si hay error al parsear, limpiamos el localStorage
                localStorage.removeItem('currentUser')
            }
        }
    }
}

/** Exporta la instancia singleton del UserController */
export const userController = UserController.getInstance()
