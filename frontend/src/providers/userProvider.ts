import type { AuthResponse} from "../interfaces/User.mock";

const API_URL = 'http://localhost:8000/api';
//Esta función llama el endpoint del backend
//enviando el objeto FormData completo
export const registerUser = async (formData:FormData): Promise<AuthResponse> => {
    console.log('PROVIDER Real: Enviando FormData al backend...',formData);
    try{
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            body: formData,
        
        });
        console.log(formData);

        const data = await response.json();

        if (!response.ok) {
            //si la respuesta no es un 200-299 (por ejemeplo 422 del validator)
            //lanza un error para que lo coja el 'catch' del controller

            //Mapeamos los errores del validator de laravel
            if (response.status === 422) {
                const errors = Object.values(data.errors).join(', ');
                throw new Error(errors);
            }
            throw new Error(data.message || 'Error desconocido del servidor');
        }

        //si la respuesta es ok (200 o 201)
        return data;
    }catch(error){
        console.error('Error en registerUser Provider:', error);
        throw error;
    }
    
};