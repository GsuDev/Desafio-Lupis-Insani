/**
 * Modelos de Dominio del Frontend
 * (Sincronizados con la API del Backend)
 */

export interface Player {
  id: number;
  name: string;
}// de forma temporal ya que necesito crear uno vacio

export interface Message {
  id: number;
  message: string;     
  created_at: string;
  game_id: number;  
  playerName: string; 
}

export interface Game {
  id: number;
  players: Player[];
  messages: Message[];  
  created_at: string;
}