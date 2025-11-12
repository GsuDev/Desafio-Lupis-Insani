import { registerUser } from "../providers/userProvider";
import type {RegisterData} from "../interfaces/User.mock";

// Declaramos variables globales para que la Vista las inicialice


let showValidationError: (field:string,message:string) => void;
let clearValidationErrors: () => void;
let showGlobalMessage: (message:string, isSuccess: boolean) => void;
let disableForm: (disabled:boolean) => void;

//Funcion para inicializar el Controller con las funciones de la vista
export const initController = (
    validationCallback: (field:string, message:string) => void,
    clearCallback: () => void,
    messageCallback: (message: string, isSucces:boolean) => void,
    disableCallback: (disabled:boolean) => void
) => {
    showValidationError = validationCallback;
    clearValidationErrors = clearCallback;
    showGlobalMessage = messageCallback;
    disableForm = disableCallback;
};

// La función principal que el formulario llamará al hacer Submit
// Usamos 'async' porque llamaremos a una Promesa (el Provider)
export const handleRegister = async(formData:FormData) => {
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
        const authResponse = await registerUser(formData); // El 'await' espera que la Promesa se resuelva

       localStorage.setItem('auth_token',authResponse.token);
        showGlobalMessage('¡Registro Exitoso! Redirigiendo...', true);
        //Aqui iria la redireccion a la pantalla del perfil del usuario o del lobby
        //o donde se diriga despues
        

    } catch (error: any) {
        
        showGlobalMessage(`Error: ${error.message || 'Error desconocido del servidor.'}`, false); 
        disableForm(false);

    }

};
