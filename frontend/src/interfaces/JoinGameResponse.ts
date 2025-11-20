import type { Game } from "../interfaces/game.models";


export type IJoinGameResponse = {
    success: boolean
    message: string
    data: Game
}