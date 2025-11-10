// NOTA IMPORTANTE PARA EL HISTORIAL DE COMMITS:
// Este archivo .mock.ts es una interfaz TEMPORAL que simula el Modelo User.ts.
// Lo usamos para que el flujo de Frontend (Componente, Controller, Provider) pueda ser testeado.
// Será ELIMINADO y reemplazado por el archivo User.ts definitivo una vez que la HU3 nos lo proporcione.

//basado en el diagrama de bd
export interface User{
    id:number;
    nickname:string;
    name:string;
    lastname: string;
    email:string;
    profile_url?:string; //? lo hace opcional
    birthday?:string;
}

//NOTA: Esta interfaz describe exactamente los datos que vienen del formulario
export interface RegisterData {
    nickname: string;
    name:string;
    lastname:string;
    email:string;
    password:string;
    password_confirmation:string;
    birthday:string;
    profile_url?:string; //opcional

}

//Esto es lo que esperamos que la API nos devuelva
export interface AuthResponse{
    user:User;
    token:string;
}