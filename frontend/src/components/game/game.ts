import './game.css'
import type { Game, Participant } from '../../models/models'
import { GameParticipant } from '../gameParticipant/gameParticipant'

import campfireImg from '../../assets/gameRenders/night_game_fire.png'

/**
 * Clase GameComponent
 * Componente principal para visualizar la partida activa.
 * Recibe datos del juego y de los participantes para renderizar el estado actual.
 */

export class GameComponent {
    private container: HTMLElement
    private header: HTMLElement
    private statusDisplay: HTMLElement
    private participantsContainer: HTMLElement

    //seguramente crezca en función de los elementos que necesite por ejemplo la carta, la barra de tiempo...
    constructor() {
        this.container = this.createContainer()
        this.header = this.createHeader()
        this.statusDisplay = this.createStatusDisplay()
        this.participantsContainer = this.createParticipantsContainer()
    }

    /**
     * Crea el contenedor principal del componente
     */
    private createContainer(): HTMLElement {
        const container = document.createElement('div')
        container.className = 'game-component'
        return container
    }

    /**
     * Crea el encabezado, TODO: Luego lo cambio al ID de la partida
     */
    private createHeader(): HTMLElement {
        const header = document.createElement('header')
        header.className = 'game-header'
        header.innerHTML = '<h2>Partida en curso</h2>'
        return header
    }

    /**
     * Crea un elemento para mostrar el estado del juego (ej. "Día", "Noche", "Votación") es la barra superior de la pantalla
     */
    private createStatusDisplay(): HTMLElement {
        const div = document.createElement('div')
        div.className = 'game-status'
        div.textContent = 'Estado: Cargando...'
        return div
    }


    /**
     * Crea el contenedor donde se mostrarán los participantes (o sus avatares en el juego) ¿cambiarlo a un componente ? 
     */
    private createParticipantsContainer(): HTMLElement {
        const div = document.createElement('div')
        div.className = 'game-participants-grid'
        return div
    }

    /**
     * Método público para renderizar el componente por primera vez.
     * Devuelve el HTMLElement listo para ser insertado en el DOM principal.
     */
    public render(): HTMLElement {
        this.container.appendChild(this.header)
        this.container.appendChild(this.statusDisplay)
        this.container.appendChild(this.participantsContainer)
        return this.container
    }

    /**
     * Actualiza la interfaz con los datos más recientes del juego y participantes.
     * @param game Datos actuales del objeto Game
     * @param participants Lista de participantes actualizada
     */
    public update(game: Game, participants: Participant[]): void {
        // 1. Actualizar estado del juego
        this.statusDisplay.textContent = `CAMBIAR POR BARRA DE TIEMPO (Componente)`

        // 2. Actualizar participantes
        this.participantsContainer.innerHTML = ''

        //Esto tendría que ir cambiando entre la noche y el dia
        // const campfireDiv = document.createElement('div')
        // campfireDiv.className = 'campfire-container'
        // campfireDiv.innerHTML = `<img src="${campfireImg}" alt="Hoguera" class="campfire-img" />`

        // this.participantsContainer.appendChild(campfireDiv)

        // 3. Separar participantes en anillos
        const MAX_INNER = 10;

        // Primeros 10 (o menos)
        const innerCircleParticipants = participants.slice(0, MAX_INNER);
        // El resto (del 11 en adelante)
        const outerCircleParticipants = participants.slice(MAX_INNER, MAX_INNER + 20);

        // 4. Calcular Radios (en % del tamaño menor de la pantalla para ser responsive)
        // Usamos unidades 'vmin' relativas o píxeles fijos si prefieres.
        // Aquí lo haré con % relativo al contenedor padre.
        const width = window.innerWidth;
        const height = window.innerHeight;
        // const width = this.participantsContainer.clientWidth || window.innerWidth;
        // const height = this.participantsContainer.clientHeight || window.innerHeight;
        const minDim = Math.min(width, height);

        // Radio interior 
        const r1 = minDim * 0.1;
        // Radio exterior 
        const r2 = minDim * 0.18;

        // 5. Renderizar círculos
        this.renderCircle(innerCircleParticipants, r1, width / 2, height / 2);
        this.renderCircle(outerCircleParticipants, r2, width / 2, height / 2);

        // participants.forEach((p) => {
        //     //aqui calcular la posición en función del numero en la lista

        //     //calcula la imagen correcta en función de la posicion en el circulo
        //     const versionIndex = 1;

        //     // 3. Crear instancia del componente
        //     const participantComponent = new GameParticipant(p, versionIndex)

        //     // 4. Añadir al DOM
        //     this.participantsContainer.appendChild(participantComponent.render())
        // })
    }

    /**
     * Función helper para colocar una lista de participantes en círculo
     */
    private renderCircle(list: Participant[], radius: number, centerX: number, centerY: number) {
        if (list.length === 0) return;

        const angleStep = (2 * Math.PI) / list.length;

        list.forEach((p, index) => {
            // Calculamos el ángulo. Restamos PI/2 para empezar arriba (a las 12 en punto)
            const angle = index * angleStep - (Math.PI / 2);

            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);
            const width = window.innerWidth;
            const height = window.innerHeight;
            const midWidth = width / 2;
            const midHeight = height / 2;

            if(x> midWidth){
                x += (x-midWidth)*1;
            }else{
                x -= (midWidth-x)*1;
            }

            if(y> midHeight){ //inverso al width para generar la elipse
                y -= (y-midHeight)*0.1;
            }else{
                y += (midHeight-y)*0.1;
            }
            
            const percentageX = x / width*100;// se calculan los porcentajes para que sea responsive
            const percentageY = y / height *100;


            console.log(`Angulo: ${angle}, x: ${x}, y: ${y}, width: ${width}, height: ${height}`)
            // Crear componente
            // Usar la logica en funcion del la posicion para cargar distintas imagenes
            const versionIndex = 1;
            const pComponent = new GameParticipant(p, versionIndex);
            const pElement = pComponent.render();

            // Aplicar posición
            pElement.style.left = `${percentageX}%`;
            pElement.style.top = `${percentageY}%`;

            this.participantsContainer.appendChild(pElement);
        });
    }

}