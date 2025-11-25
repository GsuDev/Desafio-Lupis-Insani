// Estructura exacta de lo que envía Laravel en el evento WolvesEvent
export interface WolvesEventPayload {
    event: string;
    gameId: number;
    data: {
        message: string;
        playerName: string;
        image_url?: string;
    };
}