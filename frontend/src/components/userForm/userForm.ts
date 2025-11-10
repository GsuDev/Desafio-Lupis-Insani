import { handleRegister,initController } from "../../controllers/usersController";
import type { RegisterData } from "../../interfaces/User.mock";

//Esta es la función principal que llamará app.ts
//Recibe el <div id="app"> donde se pintará

/**
 * * Esta función crea un grupo de input completo (label, input, p de error)
 * y lo devuelve como un solo elemento HTML.
 */
const createInputGroup = (
    id: string,
    labelText: string,
    inputType: string,
    name: string,
    required: boolean = true // todos son requeridos
    

): HTMLDivElement => {
    
    // El contenedor del grupo
    const group = document.createElement('div');
    group.className = 'input-group';

    // Label
    const label = document.createElement('label');
    label.htmlFor = id; // Esto conecta el label al input 
    label.textContent = labelText;

    // Input
    const input = document.createElement('input');
    input.type = inputType;
    input.id = id;
    input.name = name;
    input.required = required;
    if (inputType === 'password') {
        input.autocomplete = 'new-password'; // Ayuda a los gestores de contraseñas
    } else if (inputType === 'email') {
        input.autocomplete = 'email';
    } else {
        input.autocomplete = 'off';
    }

    // Párrafo de Error
    const errorP = document.createElement('p');
    errorP.className = 'error-message';
    errorP.setAttribute('data-input', id); // Así el callback sabe dónde escribir el error

    // Montamos el grupo
    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(errorP);

    return group;
};

export const renderUserForm = (appContainer: HTMLDivElement) => {
    // Limpiamos el escenario (el <div id="app">) por si había algo antes
    appContainer.innerHTML = '';

    //se construyen los elementos del html
    //contenedor principal
    const container = document.createElement('div');
    container.id = 'register-container';

    const card = document.createElement('div');
    card.className = 'card';

    //Formulario
    const form = document.createElement('form');
    form.id = 'registration-form';
   
    // Mensajes Globales 
    const globalSuccess = document.createElement('p');
    globalSuccess.id = 'global-success';
    globalSuccess.className = 'global-message success';

    const globalError = document.createElement('p');
    globalError.id = 'global-error';
    globalError.className = 'global-message error';

    // Botón de Submit 
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.id = 'submit-button';
    submitButton.textContent = 'Crear Cuenta';

    // Añadimos los elementos básicos al formulario
    form.appendChild(globalSuccess);
    form.appendChild(globalError);
    //añadimos los inputs
    const nicknameGroup = createInputGroup('nickname','Nickname','text','nickname');
    form.appendChild(nicknameGroup)
    const nameGroup = createInputGroup('name','Nombre','text','name');
    form.appendChild(nameGroup);
    const lastnameGroup = createInputGroup('lastname', 'Apellidos', 'text','lastname');
    form.appendChild(lastnameGroup);
    const emailGroup = createInputGroup('email','correo Electrónico','email','email');
    form.appendChild(emailGroup);
    const passwordGroup = createInputGroup('password','Contraseña','password','password');
    form.appendChild(passwordGroup);
    const passwordConfGroup = createInputGroup('password_confirmation', 'Repite Contraseña', 'password', 'password_confirmation');
    form.appendChild(passwordConfGroup);
    const birthdayGroup = createInputGroup('birthday', 'Fecha de Nacimiento', 'date', 'birthday', false); // false = no requerido
    form.appendChild(birthdayGroup);
    const profileUrlGroup = createInputGroup('profile_url', 'Foto de Perfil (URL)', 'url', 'profile_url', false); // false = no requerido
    form.appendChild(profileUrlGroup);
    // (Añadiremos los inputs en el siguiente bloque)
    form.appendChild(submitButton);

    // Añadimos todo al DOM
    card.appendChild(form);
    container.appendChild(card);
    appContainer.appendChild(container);

    //Definimos los callbacks
    //aquí van las funciones que si tocan el DOM y que el controller llamará
    const showValidationError = (field:string, message:string) => {
        
         const errorElement = container.querySelector(`.error-message[data-input="${field}"]`);
         
        if (errorElement) {
            errorElement.textContent = message;
        }else{
            console.log('error de vista');
        }
    };

    const clearValidationErrors = () => {
        const allErrorElements = container.querySelectorAll('.error-message');
        allErrorElements.forEach(el => {
            el.textContent = '';
        });
    };

    const showGlobalMessage = (message:string, isSuccess:boolean) => {
        if (isSuccess) {
            globalSuccess.textContent = message;
            globalError.textContent = '';

        }else{
            globalError.textContent = message;
            globalSuccess.textContent = '';
        }
    };

    const disableForm = (disabled: boolean) => {
        submitButton.disabled = disabled;
        submitButton.textContent = disabled ? 'Creando cuenta..' : 'Crear Cuenta';
    };

    //le pasamos las callbacks (las validaciones al controller)
    initController(
        showValidationError,
        clearValidationErrors,
        showGlobalMessage,
        disableForm
    );

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        
        //Recogemos todos los datos del formulario
        const formData = new FormData(form);
        //convertimos los datos a un objeto que coincida con RegisterData
        const data: RegisterData = {
            nickname: formData.get('nickname') as string,
            name: formData.get('name') as string,
            lastname: formData.get('lastname') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            password_confirmation: formData.get('password_confirmation') as string,
            birthday: formData.get('birthday') as string,
            profile_url: formData.get('profile_url') as string,
        };

        //llamamos al controlador
        handleRegister(data);
    });

};