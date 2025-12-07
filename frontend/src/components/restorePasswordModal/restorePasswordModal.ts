import { userController } from '../../controllers/UserController'
import './restorePasswordModal.css'

export class RestorePasswordModal {
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
    }

    public render(): void {
        const overlay = document.createElement('div')
        overlay.className = 'restore-overlay'

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal()
        })

        // Tarjeta
        const card = document.createElement('div')
        card.className = 'restore-card'

        // Título
        const title = document.createElement('h2')
        title.className = 'restore-title'
        title.textContent = 'Recuperar Contraseña'

        // Descripción
        const description = document.createElement('p')
        description.className = 'restore-description'
        description.textContent =
            'Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.'

        // Formulario
        const form = document.createElement('form')
        form.className = 'restore-form'
        form.onsubmit = (e) => this.handleSubmit(e)

        // Input Email
        const emailGroup = document.createElement('div')
        emailGroup.className = 'input-group'

        const emailLabel = document.createElement('label')
        emailLabel.textContent = 'Correo Electrónico'

        const emailInput = document.createElement('input')
        emailInput.type = 'email'
        emailInput.name = 'email'
        emailInput.placeholder = 'ejemplo@correo.com'
        emailInput.required = true
        emailInput.className = 'restore-input'

        emailGroup.append(emailLabel, emailInput)

        // Área de Mensajes (Error / Éxito)
        const messageArea = document.createElement('div')
        messageArea.id = 'restore-message-area'
        messageArea.className = 'message-area'

        // Botonera
        const actions = document.createElement('div')
        actions.className = 'restore-actions'

        const btnCancel = document.createElement('button')
        btnCancel.type = 'button'
        btnCancel.textContent = 'Cancelar'
        btnCancel.className = 'btn-cancel'
        btnCancel.onclick = () => this.closeModal()

        const btnSubmit = document.createElement('button')
        btnSubmit.type = 'submit'
        btnSubmit.textContent = 'Enviar Correo'
        btnSubmit.className = 'btn-submit'

        actions.append(btnCancel, btnSubmit)

        // Ensamblaje
        form.append(emailGroup, messageArea, actions)
        card.append(title, description, form)
        overlay.append(card)

        //this.container.appendChild(overlay);
        document.body.appendChild(overlay)

        // Animación de entrada
        requestAnimationFrame(() => {
            overlay.classList.add('visible')
            card.classList.add('visible')
        })
    }

    private closeModal(): void {
        const overlay = document.querySelector('.restore-overlay')
        if (overlay) {
            overlay.classList.remove('visible')
            setTimeout(() => overlay.remove(), 300)
        }
    }

    private showMessage(msg: string, type: 'error' | 'success'): void {
        const area = document.getElementById('restore-message-area')
        if (area) {
            area.textContent = msg
            area.className = `message-area ${type}`
            area.style.display = 'block'
        } else {
            console.error('❌ No encuentro el div #restore-message-area')
        }
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)
        const email = formData.get('email') as string

        // Limpiamos mensajes previos
        const area = document.getElementById('restore-message-area')
        if (area) area.style.display = 'none'

        // Botón en estado de carga
        const btnSubmit = form.querySelector('.btn-submit') as HTMLButtonElement
        const originalText = btnSubmit.textContent
        btnSubmit.textContent = 'Enviando...'
        btnSubmit.disabled = true

        try {
            // llamada al controller
            const response = await userController.restorePassword(email)

            if (response && response.success) {
                this.showMessage(
                    '✅ ' +
                        (response.message ||
                            'Correo enviado. Revisa tu bandeja.'),
                    'success'
                )

                setTimeout(() => this.closeModal(), 3000)
            } else {
                this.showMessage(
                    '⚠️ ' +
                        (response?.message || 'Error al enviar la solicitud.'),
                    'error'
                )
            }
        } catch (error) {
            this.showMessage('❌ Error de conexión con el servidor.', 'error')
        } finally {
            btnSubmit.textContent = originalText
            btnSubmit.disabled = false
        }
    }
}
