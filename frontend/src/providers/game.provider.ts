import type { Game, Player, Message } from '../interfaces/game.models';

/**
 * --- PROVEEDOR DE API REAL ---
 * * Este provider reemplaza al MOCK.
 * Hace llamadas 'fetch' reales a tu API de Laravel.
 */

// Define la URL base de tu API de Laravel
// (Si usas 'php artisan serve', normalmente es 8000)
const API_URL = 'http://localhost:8000/api';

/**
 * Función auxiliar para manejar errores de 'fetch'
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
};

/**
 * Llama a: GameController@getGame, getPlayersByGame, getMessagesByGame
 * * Esta es una función "inteligente":
 * 1. Obtiene los datos base de la partida (id, url, ended)
 * 2. Obtiene la lista de jugadores de esa partida
 * 3. Obtiene los mensajes de esa partida
 * 4. Combina todo en un solo objeto 'Game' para el frontend.
 */
export const getGame = async (gameId: string): Promise<Game> => {
  console.log(`PROVIDER REAL: Buscando partida con ID: ${gameId}...`);

  try {
    // 1. Llama a las 3 rutas en paralelo para más eficiencia
    const [gameData, playersData, messagesData] = await Promise.all([
      fetch(`${API_URL}/games/${gameId}`).then(handleResponse),        // Llama a getGame
      fetch(`${API_URL}/games/${gameId}/players`).then(handleResponse),  // Llama a getPlayersByGame
      fetch(`${API_URL}/games/${gameId}/messages`).then(handleResponse) // Llama a getMessagesByGame
    ]);

    // 2. Combina los resultados en el objeto Game que tu frontend espera
    const game: Game = {
      id: gameData.id,
      created_at: gameData.created_at,
      players: playersData as Player[],     // Asumimos que la API devuelve Player[]
      messages: messagesData as Message[],   // Asumimos que la API devuelve Message[]
    };
    
    return game;

  } catch (error) {
    console.error('Error al obtener la partida completa:', error);
    throw error; // Lanza el error para que el componente lo capture
  }
};

/**
 * Llama a: GameController@addMessageByGame
 */
export const addMessage = async (gameId: string, messageContent: string, userId: number | null): Promise<Message> => {
  console.log(`PROVIDER REAL: Añadiendo mensaje a la partida ${gameId}...`);

  // ¡IMPORTANTE! El backend espera 'user_id', 'type', 'message'
  // (Ajustar esto a lo que tu componente vaya a enviar)
  const payload = {
    user_id: userId,
    type: 'MESSAGE', // O el tipo que sea
    message: messageContent
  };
  
  const response = await fetch(`${API_URL}/games/${gameId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

// --- (Aquí añadirías el RESTO de funciones del provider...) ---
// createGame, getGames, updateGame, deleteGame...