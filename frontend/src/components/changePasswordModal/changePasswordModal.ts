import './changePasswordModal.css'
import { userController } from '../../controllers/UserController'

export class ChangePasswordModal {
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
    }

    render(): void {
        this.container.innerHTML = ''

        //  Overlay
        const overlay = document.createElement('div')
        overlay.className = 'password-overlay'
        // Cierra al clicar fuera
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal()
        })

        // Tarjeta Estilo Cómic
        const card = document.createElement('div')
        card.className = 'password-card'

        // Título
        const title = document.createElement('h2')
        title.className = 'password-title'
        title.textContent = 'Cambiar Contraseña'

        // Formulario
        const form = document.createElement('form')
        form.className = 'password-form'
        form.onsubmit = (e) => this.handleSubmit(e)

        // Inputs con etiquetas descriptivas como en el wireframe
        const currentPass = this.createInputRow(
            'Introduce tu contraseña actual:',
            'current_password',
            'Contraseña Actual'
        )
        const newPass = this.createInputRow(
            'Introduce tu contraseña nueva:',
            'new_password',
            'Contraseña Nueva'
        )
        const repeatPass = this.createInputRow(
            'Repite tu contraseña nueva:',
            'repeat_password',
            'Contraseña Nueva Rep.'
        )

        // Contenedor de errores
        const errorMsg = document.createElement('div')
        errorMsg.className = 'error-msg'
        errorMsg.id = 'password-error-msg'

        // Botones Footer
        const actionsDiv = document.createElement('div')
        actionsDiv.className = 'password-actions'

        const cancelBtn = document.createElement('button')
        cancelBtn.type = 'button'
        cancelBtn.className = 'btn-cancel'
        cancelBtn.textContent = 'Cancelar'
        cancelBtn.onclick = () => this.closeModal()

        const saveBtn = document.createElement('button')
        saveBtn.type = 'submit'
        saveBtn.className = 'btn-confirm'
        saveBtn.textContent = 'Aceptar'

        actionsDiv.append(cancelBtn, saveBtn)

        // Ensamblaje
        form.append(currentPass, newPass, repeatPass, errorMsg, actionsDiv)
        card.append(title, form)
        overlay.appendChild(card)
        this.container.appendChild(overlay)
    }

    // helper  con el ojo para ver la contraseña
    private createInputRow(
        labelText: string,
        name: string,
        placeholder: string
    ): HTMLDivElement {
        const row = document.createElement('div')
        row.className = 'input-row'

        const label = document.createElement('label')
        label.textContent = labelText
        label.className = 'row-label'

        // contenedor wrapper (necesario para posicionar el ojo)
        const wrapper = document.createElement('div')
        wrapper.className = 'password-input-wrapper'

        const input = document.createElement('input')
        input.type = 'password' // empieza oculto
        input.name = name
        input.placeholder = placeholder
        input.required = true

        // el boton del ojo
        const toggleBtn = document.createElement('button')
        toggleBtn.type = 'button' // para no enviar el form
        toggleBtn.className = 'toggle-password-btn'
        toggleBtn.innerHTML = '👁️' // icono inicial
        toggleBtn.title = 'Mostrar contraseña'

        // la logica del click
        toggleBtn.onclick = () => {
            if (input.type === 'password') {
                input.type = 'text' // al cambiar a text se ve la contraseña
                toggleBtn.innerHTML = '🙈' // icono de "ocultar"
            } else {
                input.type = 'password' // vuelve a ocultarse
                toggleBtn.innerHTML = '👁️'
            }
        }

        wrapper.append(input, toggleBtn)
        row.append(label, wrapper)

        return row
    }

    private closeModal(): void {
        const overlay = this.container.querySelector('.password-overlay')
        if (overlay) overlay.remove()
    }

    private showError(message: string): void {
        const msgDiv = this.container.querySelector(
            '#password-error-msg'
        ) as HTMLElement
        if (msgDiv) {
            msgDiv.textContent = message
            msgDiv.style.display = 'block'
        }
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)

        const current = formData.get('current_password') as string
        const newP = formData.get('new_password') as string
        const repeatP = formData.get('repeat_password') as string

        // Validaciones
        if (newP.length < 8) {
            this.showError('La contraseña debe tener al menos 8 caracteres.')
            return
        }
        if (newP !== repeatP) {
            this.showError('Las contraseñas nuevas no coinciden.')
            return
        }

        console.log('🔒 Cambiando contraseña...')

        const response = await userController.changePassword(
            current,
            newP,
            repeatP
        )

        if (response && response.success) {
            alert('¡Contraseña cambiada correctamente!')
            this.closeModal()
        } else {
            this.showError(
                response?.message || 'Error al cambiar la contraseña'
            )
        }
    }
}

export default ChangePasswordModal
