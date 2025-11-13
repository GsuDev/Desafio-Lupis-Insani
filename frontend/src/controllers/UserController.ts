import type { User } from '../models/User'
import * as userProvider from '../providers/userProvider'
import { registerUser } from "../providers/userProvider";
import type {RegisterData} from "../interfaces/RegisterData";

let showValidationError: (field:string,message:string) => void;
let clearValidationErrors: () => void;
let showGlobalMessage: (message:string, isSuccess: boolean) => void;
let disableForm: (disabled:boolean) => void;


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

    // Declaramos variables globales para que la Vista las inicialice



//Funcion para inicializar el Controller con las funciones de la vista
     async initController(
        validationCallback: (field:string, message:string) => void,
        clearCallback: () => void,
        messageCallback: (message: string, isSucces:boolean) => void,
        disableCallback: (disabled:boolean) => void
    ) {
        showValidationError = validationCallback;
        clearValidationErrors = clearCallback;
        showGlobalMessage = messageCallback;
        disableForm = disableCallback;
    }

    // La función principal que el formulario llamará al hacer Submit
    // Usamos 'async' porque llamaremos a una Promesa (el Provider)
    async handleRegister(formData:FormData){
        clearValidationErrors(); // limpia errores anteriores (llama a la vista)
        disableForm(true); //Desactuva el formulario mientras trabaja (llama a la vista)
        const data: RegisterData = {
            nickname:formData.get('nickname') as string,
            name: formData.get('name') as string,
            lastname: formData.get('lastname') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            password_confirmation: formData.get('password_confirmation') as string,
            birthdate: formData.get('birthdate') as string,
        };
        let hasError = false;
        if (data.password !== data.password_confirmation) {
            showValidationError('password_confirmation', 'Las contraseñas no coinciden.');
            hasError = true;
        }

        if (!data.email.includes('@') || !data.email.includes('.')) {
            showValidationError('email', 'Formato de correo electrónico inválido.');
            hasError = true;
        }
        
        
        if (!data.nickname || data.nickname.length < 3) {
            showValidationError('nickname', 'El Nickname debe tener al menos 3 caracteres.');
            hasError = true;
        }

        if (hasError) {
            disableForm(false); // Vuelve a activar el formulario si falló la validación local
            return; // Detiene el proceso
        }

        try {
            // Llama al Provider (el Mensajero) y espera (await) la respuesta
            const authResponse = await registerUser(formData);
            this._currentUser = authResponse
            localStorage.setItem('currentUser', JSON.stringify(this._currentUser))
    
            showGlobalMessage('¡Registro Exitoso! Redirigiendo...', true);
            //Aqui iria la redireccion a la pantalla del perfil del usuario o del lobby
            //o donde se diriga despues
            

        } catch (error: any) {
            
            showGlobalMessage(`Error: ${error.message || 'Error desconocido del servidor.'}`, false); 
            disableForm(false);

        }

    }

}

/** Exporta la instancia singleton del UserController */
export const userController = UserController.getInstance()


