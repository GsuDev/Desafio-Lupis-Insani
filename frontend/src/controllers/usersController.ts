import { registerUser } from "../providers/userProvider";
import type {RegisterData} from "../interfaces/User.mock";

// CALLBACKS: Funciones que la Vista (el DOM) le pasa al Controller para mostrar resultados
// NOTA: Declaramos variables globales para que la Vista las inicialice
// [HU4 Requisito: Mostrar mensajes de error/éxito]

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
export const handleRegister = async(data:RegisterData) => {
    clearValidationErrors(); //paso1: limpia errores anteriores (llama a la vista)
    disableForm(true); //Desactuva el formulario mientras trabaja (llama a la vista)
    //Validación Visual/Frontend (HU4 Requisito: validaciones visuales)
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
        console.log('CONTROLLER: Llamando al Provider...');
        const authResponse = await registerUser(data); // El 'await' espera que la Promesa se resuelva

        //  Éxito: El registro fue exitoso
        console.log('CONTROLLER: Registro exitoso. Token:', authResponse.token);
        showGlobalMessage('¡Registro Exitoso! Redirigiendo...', true); // Muestra éxito
        
        // Aquí se guardaría el token en localStorage y se redirigiría

    } catch (error: any) {
        //  Error: Si la Promesa falla (error del Mock/Servidor)
        console.error('CONTROLLER: Error durante el registro:', error);
        
        // Asumiendo que el error del servidor es el que devuelve el Provider Mock.
        showGlobalMessage(`Error: ${error.message || 'Error desconocido del servidor.'}`, false); 

    } finally {
        // Se ejecuta siempre, haya éxito o error
        disableForm(false);
    }

};
