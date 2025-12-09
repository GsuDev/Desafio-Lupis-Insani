
import './timeBar.css';

export class TimeBar {
    private element: HTMLElement;
    private fillElement!: HTMLElement;
    private markers: HTMLElement[] = [];
    private totalPhases: number;

    constructor(totalPhases: number = 3) {
        this.totalPhases = totalPhases;
        this.element = this.createStructure();
    }

    private createStructure(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'time-bar-container';

        // Barra de relleno interna
        this.fillElement = document.createElement('div');
        this.fillElement.className = 'time-bar-fill';
        container.appendChild(this.fillElement);

        // Crear marcadores visuales para las etapas
        // Si hay 3 etapas, pondremos marcadores en 33% y 66% (o al final de cada una)
        for (let i = 1; i <= this.totalPhases; i++) {
            this.createMarker(container, i);
        }

        return container;
    }

    private createMarker(container: HTMLElement, index: number) {
        const marker = document.createElement('div');
        marker.className = 'time-bar-marker';
        //i cargar estilo
        marker.className += this.getStylePoint(index);

        // Calcular posición: Si son 3 etapas, los puntos van distribuidos
        const leftPos = (index / (this.totalPhases + 1)) * 100;//El +1 evita que se haga al final
        marker.style.left = `${leftPos}%`;

        container.appendChild(marker);
        this.markers.push(marker);
    }
    private getStylePoint(index: number): string {
        switch (index) {
            case 1:
                return ' sol';
            case 2:
                return ' discusion';
            case 7:
            case 3:
                return ' votacion';
            case 4:
                return ' resultado';
            case 5:
                return ' luna';
            case 6:
                return ' lobo';

            default:
                return ' ';
        }

    }
    /**
     * Actualiza la barra basado en la etapa actual.
     * @param currentPhase Índice de la etapa actual (1, 2, 3...)
     */
    public setPhase(currentPhase: number): void {
        // Limitar entre 0 y el total
        const safePhase = Math.max(0, Math.min(currentPhase, this.totalPhases));

        // Calcular porcentaje de llenado
        const percentage = (safePhase / (this.totalPhases + 1)) * 100;
        this.fillElement.style.width = `${percentage}%`;

        // Actualizar estado de los marcadores (activos/inactivos)
        this.markers.forEach((marker, index) => {
            if (index < safePhase) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });
    }

    /**
     * Reinicia la barra a 0 
     */
    public reset(): void {
        this.fillElement.style.width = '0%';
        this.markers.forEach(m => m.classList.remove('active'));
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}