import './participantList.css';
import type { Participant } from '../../models/Participant';
import { participantController } from '../../controllers/participantController';

/**
 * Crea la columna de participantes (jugadores y bots)
 * Devuelve el elemento HTML y callbacks para actualizarlo
 */
export const createParticipantList = (): [
    HTMLElement,
    (participants: Participant[]) => void,
    (isDisabled: boolean) => void
] => {
    const container = document.createElement('div');
    container.className = 'participant-list';

    // Header (contador de jugadores)
    const header = document.createElement('header');
    header.className = 'participant-list-header';
    header.id = 'participant-count-header';
    header.textContent = 'Cargando...';

    // Lista scrolleable de participantes
    const list = document.createElement('div');
    list.className = 'participant-list-body';
    list.id = 'participant-list-body';

    // Footer con botón Iniciar
    const footer = document.createElement('footer');
    footer.className = 'participant-list-footer';

    const btnIniciar = document.createElement('button');
    btnIniciar.className = 'btn-iniciar';
    btnIniciar.id = 'start-game-button';
    btnIniciar.textContent = 'Iniciar';
    btnIniciar.disabled = true; // Deshabilitado hasta que cargue

    footer.appendChild(btnIniciar);

    container.appendChild(header);
    container.appendChild(list);
    container.appendChild(footer);

    // Callback para actualizar la lista de participantes
    const updateParticipantList = (participants: Participant[]) => {
        // Actualiza el header con el contador
        header.textContent = `${participants.length}/15 Jugadores`;

        // Usa el controller para renderizar los participantes
        participantController.renderParticipantList(participants, list);
    };

    // Callback para habilitar/deshabilitar el botón
    const disableStartButton = (isDisabled: boolean) => {
        btnIniciar.disabled = isDisabled;
        btnIniciar.textContent = isDisabled ? 'Cargando...' : 'Iniciar';
    };

    // Devuelve el elemento HTML y las funciones para actualizarlo
    return [container, updateParticipantList, disableStartButton];
};