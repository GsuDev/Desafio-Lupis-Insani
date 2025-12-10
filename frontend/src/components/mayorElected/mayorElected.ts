import './mayorElected.css'

/**
 * Componente que muestra un modal cuando el jugador es elegido alcalde
 * Se muestra encima de la pantalla de juego sin oscurecer el fondo
 */
export class MayorElectedModal {
    private overlay: HTMLDivElement | null = null

    constructor() {
        // no necesita parametros
    }

    /**
     * Muestra el modal de alcalde elegido
     */
    public show(): void {
        // creamos el contenedor principal (sin fondo oscuro)
        this.overlay = document.createElement('div')
        this.overlay.className = 'mayor-elected-overlay'

        // creamos el modal
        const modal = document.createElement('div')
        modal.className = 'mayor-elected-modal'

        // icono de corona grande
        const crownIcon = document.createElement('div')
        crownIcon.className = 'mayor-crown-icon'
        crownIcon.textContent = '👑'

        // titulo
        const title = document.createElement('h2')
        title.className = 'mayor-elected-title'
        title.textContent = '¡HAS SIDO ELEGIDO ALCALDE!'

        // mensaje
        const message = document.createElement('p')
        message.className = 'mayor-elected-message'
        message.textContent =
            'El pueblo ha depositado su confianza en ti, ahora tus votos cuentan el doble'

        // boton para cerrar
        const closeBtn = document.createElement('button')
        closeBtn.className = 'mayor-elected-btn'
        closeBtn.textContent = 'CONTINUAR'
        closeBtn.onclick = () => this.hide()

        // montamos el modal
        modal.appendChild(crownIcon)
        modal.appendChild(title)
        modal.appendChild(message)
        modal.appendChild(closeBtn)

        this.overlay.appendChild(modal)
        document.body.appendChild(this.overlay)

        // animacion de entrada
        requestAnimationFrame(() => {
            this.overlay?.classList.add('visible')
        })
    }

    /**
     * Oculta y elimina el modal
     */
    public hide(): void {
        if (this.overlay) {
            this.overlay.classList.remove('visible')
            this.overlay.classList.add('hiding')

            // esperamos a que termine la animacion
            setTimeout(() => {
                this.overlay?.remove()
                this.overlay = null
            }, 300)
        }
    }
}

export default MayorElectedModal
