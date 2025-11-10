import type { AuthResponse, RegisterData } from "../interfaces/User.mock";

/**
 * IMPORTANTE: Esta función es un Mock (Simulación) temporal para el desarrollo del Frontend.
 * Simula el endpoint POST /api/register que será implementado en el Backend (DWES).
 * Esta función debe ser REEMPLAZADA por la lógica real de FETCH una vez que el backend esté listo.
 */

export const registerUser = (formData:RegisterData): Promise<AuthResponse> => {
    console.log('PROVIDER MOCK: Intentando registrar usuario...',formData);
    //NOTA: Simulamos la respuesta correcta que esperamos del servidor
    return new Promise((resolve,reject) => {
        //simulamos un tiempo de espera de 1.5 segundos
        setTimeout(() =>{
            //Lógica de simulacion de error(por ejemplo si el email es 'error@ejemplo.com')
            if (formData.email.includes('error')) {
                return reject({message: 'El servidor simulado devolvió un error: Email ya en uso'});
            }

            //Respuesta simulada de ecito (status 201 created)
            const mockUser: AuthResponse = {
                user: {
                    id: Math.floor(Math.random() * 1000), // ID simulado
                    nickname:formData.nickname,
                    name:formData.name,
                    lastname: formData.lastname,
                    email: formData.email,

                },
                token: 'MOCK_JWT_TOKEN_PARA_AUTENTICACION', // Token de prueba
            };

            resolve(mockUser);
        },1500);
    });
};