import './NarratorOverlay.css'

export class NarratorOverlay {
    private static readonly CONTAINER_ID = 'narrator-smoke-layer'

    constructor(parentContainer: HTMLElement) {
        if (document.getElementById(NarratorOverlay.CONTAINER_ID)) {
            return
        }

        const container = document.createElement('div')
        container.id = NarratorOverlay.CONTAINER_ID
        // Usamos una clase distinta a la de la hoguera para evitar conflictos
        container.className = 'narrator-smoke-layer'

        // 2. Lo añadimos al contenedor del juego, no al body
        parentContainer.appendChild(container)
    }

    //muestra un mensaje con efecto humo
    public static spawnMessage(text: string): void {
        //crear el elemento en el dom
        const container = document.getElementById(NarratorOverlay.CONTAINER_ID)

        if (!container) {
            console.warn(
                '⚠️ No se encontró el contenedor del narrador (narrator-smoke-layer)'
            )
            return
        }

        const msgElement = document.createElement('div')
        msgElement.className = 'narrator-message'
        msgElement.textContent = text

        msgElement.style.fontFamily = 'Smooky, cursive'

        container.appendChild(msgElement)

        // 3. Ajuste de tiempo para producción (7 segundos coincide con la animación CSS)
        setTimeout(() => {
            if (msgElement.parentElement) {
                msgElement.parentElement.removeChild(msgElement)
            }
        }, 7000)
    }
}
