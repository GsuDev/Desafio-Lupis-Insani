import type { User, UserStatisticsData } from '../models/models'
import * as userProvider from '../providers/user.provider'
import type { RegisterPayload } from '../types/payload.types'

let showValidationError: (field: string, message: string) => void
let clearValidationErrors: () => void
let showGlobalMessage: (message: string, isSuccess: boolean) => void
let disableForm: (disabled: boolean) => void

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

    async login(email: string, password: string): Promise<User | undefined> {
        try {
            const response = await userProvider.login(email, password)

            if (!response.success) {
                showGlobalMessage(
                    response.message || 'Error desconocido en login',
                    false
                )
                return undefined
            }

            this._currentUser = response.data?.user
            localStorage.setItem(
                'currentUser',
                JSON.stringify(this._currentUser)
            )

            return this._currentUser
        } catch (error: any) {
            showGlobalMessage(
                error.message || 'Error de conexión al servidor',
                false
            )
            return undefined
        }
    }

    /**Registra un usuario anonimo  */
    async registerAnonymous(
        nickname?: string,
        profileUrl?: string
    ): Promise<User | undefined> {
        try {
            const response = await userProvider.registerAnonymous(
                nickname,
                profileUrl
            )

            if (!response.success || !response.data?.user) {
                if (showGlobalMessage) {
                    showGlobalMessage(
                        response.message || 'Error en el registro anónimo',
                        false
                    )
                }
                return undefined
            }

            this._currentUser = response.data.user

            localStorage.setItem(
                'currentUser',
                JSON.stringify(this._currentUser)
            )

            if (showGlobalMessage) {
                showGlobalMessage(
                    'Has entrado como anónimo correctamente',
                    true
                )
            }

            return this._currentUser
        } catch (error: any) {
            if (showGlobalMessage) {
                showGlobalMessage(
                    error.message || 'Error de conexion al intentar entrar',
                    false
                )
            }

            return undefined
        }
    }

    /**
     * Cierra sesión y elimina los datos locales
     * @throws Error si falla el logout
     */
    async logout(): Promise<void> {
        await userProvider.logout()

        this._currentUser = undefined
        localStorage.removeItem('currentUser')
    }

    async changePassword(
        currentPass: string,
        newPass: string,
        repeatPass: string
    ) {
        try {
            console.log('🔐 Iniciando cambio de password...')

            const response = await userProvider.changePassword(
                currentPass,
                newPass,
                repeatPass
            )

            return response
        } catch (error: any) {
            console.error('Error cambiando contraseña:', error)
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    'Error al conectar con el servidor',
                data: null,
            }
        }
    }

    async restorePassword(email: string) {
        const response = userProvider.restorePassword(email)
        return response
    }
    async loadProfile(): Promise<User | undefined> {
        try {
            const response = await userProvider.getProfile()

            if (!response.success || !response.data?.user) {
                showGlobalMessage(
                    response.message || 'Error cargando perfil',
                    false
                )
                return undefined
            }

            this._currentUser = response.data.user
            localStorage.setItem(
                'currentUser',
                JSON.stringify(this._currentUser)
            )

            return this._currentUser
        } catch (error: any) {
            showGlobalMessage(
                error.message || 'Error de conexión al servidor',
                false
            )
            return undefined
        }
    }

    async updateProfile(
        data: Partial<User> | FormData
    ): Promise<User | undefined> {
        try {
            const response = await userProvider.updateProfile(data)

            if (!response.success || !response.data?.user) {
                showGlobalMessage(
                    response.message || 'Error actualizando perfil',
                    false
                )
                return undefined
            }

            this._currentUser = response.data.user
            localStorage.setItem(
                'currentUser',
                JSON.stringify(this._currentUser)
            )

            return this._currentUser
        } catch (error: any) {
            showGlobalMessage(
                error.message || 'Error de conexión al servidor',
                false
            )
            return undefined
        }
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

    // Declaramos variables globales para que la Vista las inicialice

    // Funcion para inicializar el Controller con las funciones de la vista
    async initController(
        validationCallback: (field: string, message: string) => void,
        clearCallback: () => void,
        messageCallback: (message: string, isSucces: boolean) => void,
        disableCallback: (disabled: boolean) => void
    ) {
        showValidationError = validationCallback
        clearValidationErrors = clearCallback
        showGlobalMessage = messageCallback
        disableForm = disableCallback
    }

    // La función principal que el formulario llamará al hacer Submit
    // Usamos 'async' porque llamaremos a una Promesa (el Provider)
    async handleRegister(formData: FormData) {
        clearValidationErrors()
        disableForm(true)

        const data: RegisterPayload = {
            nickname: formData.get('nickname') as string,
            name: formData.get('name') as string,
            lastname: formData.get('lastname') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            password_confirmation: formData.get(
                'password_confirmation'
            ) as string,
            birthdate: formData.get('birthdate') as string,
        }

        let hasError = false
        if (data.password !== data.password_confirmation) {
            showValidationError(
                'password_confirmation',
                'Las contraseñas no coinciden.'
            )
            hasError = true
        }

        if (!data.email.includes('@') || !data.email.includes('.')) {
            showValidationError(
                'email',
                'Formato de correo electrónico inválido.'
            )
            hasError = true
        }

        if (!data.nickname || data.nickname.length < 3) {
            showValidationError(
                'nickname',
                'El Nickname debe tener al menos 3 caracteres.'
            )
            hasError = true
        }

        if (hasError) {
            disableForm(false)
            return
        }

        try {
            const response = await userProvider.registerUser(formData)

            if (!response.success) {
                showGlobalMessage(
                    response.message || 'Error desconocido del servidor',
                    false
                )
                disableForm(false)
                return
            }

            // Registro exitoso
            this._currentUser = response.data?.user
            localStorage.setItem(
                'currentUser',
                JSON.stringify(this._currentUser)
            )

            showGlobalMessage('¡Registro exitoso! Redirigiendo...', true)
        } catch (error: any) {
            showGlobalMessage(
                error.message || 'Error desconocido del servidor',
                false
            )
        } finally {
            disableForm(false)
        }
    }

    /**
     * Obtiene las estadísticas del usuario actual
     */
    async getStatistics(): Promise<UserStatisticsData | undefined> {
        try {
            const response = await userProvider.getUserStatistics()

           
            if (!response.success || !response.data) {
                if (showGlobalMessage) {
                    showGlobalMessage(
                        response.message || 'Error al cargar las estadísticas',
                        false
                    )
                }
                return undefined
            }

            
            return response.data

        } catch (error: any) {
            if (showGlobalMessage) {
                showGlobalMessage(
                    error.message || 'Error inesperado',
                    false
                )
            }
            return undefined
        }
    }
}

/** Exporta la instancia singleton del UserController */
export const userController = UserController.getInstance()
