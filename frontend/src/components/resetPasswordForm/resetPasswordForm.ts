import { userController } from '../../controllers/UserController'
import './resetPasswordForm.css'

export class ResetPasswordForm {
    private container: HTMLElement
    private token: string

    constructor(container: HTMLElement, token: string) {
        this.container = container
        this.token = token
    }

    public render(): void {
        this.container.innerHTML = ''

        const wrapper = document.createElement('div')
        wrapper.className = 'reset-wrapper'

        // Tarjeta
        const card = document.createElement('div')
        card.className = 'reset-card'

        // Título
        const title = document.createElement('h2')
        title.className = 'reset-title'
        title.textContent = 'Restablecer Contraseña'

        const desc = document.createElement('p')
        desc.className = 'reset-desc'
        desc.textContent =
            'Introduce tu nueva contraseña para recuperar el acceso a tu cuenta.'

        // Formulario
        const form = document.createElement('form')
        form.className = 'reset-form'
        form.onsubmit = (e) => this.handleSubmit(e)

        // Input Password
        const passGroup = this.createInputGroup(
            'Nueva Contraseña',
            'password',
            'new_password'
        )
        const repGroup = this.createInputGroup(
            'Repetir Contraseña',
            'password',
            'repeat_password'
        )

        // Contenedor de Botones
        const actions = document.createElement('div')
        actions.className = 'reset-actions'

        //  Botón Cancelar
        const btnCancel = document.createElement('button')
        btnCancel.type = 'button'
        btnCancel.className = 'btn-reset-cancel'
        btnCancel.textContent = 'Cancelar'
        btnCancel.onclick = () => this.handleCancel()

        // Botón
        const btnSubmit = document.createElement('button')
        btnSubmit.type = 'submit'
        btnSubmit.className = 'btn-reset-confirm'
        btnSubmit.textContent = 'Cambiar Contraseña'

        actions.append(btnCancel, btnSubmit)

        // Mensajes
        const msgArea = document.createElement('div')
        msgArea.id = 'reset-msg-area'
        msgArea.className = 'reset-msg-area'

        form.append(passGroup, repGroup, msgArea, actions)
        card.append(title, desc, form)
        wrapper.append(card)

        this.container.appendChild(wrapper)
    }

    private handleCancel(): void {
        // Redirigimos a la raíz (/)
        // Al no haber "?token=..." en la nueva URL, main.ts mostrará el Login normal.
        window.location.href = '/'
    }

    private createInputGroup(
        labelTxt: string,
        type: string,
        name: string
    ): HTMLDivElement {
        const div = document.createElement('div')
        div.className = 'reset-input-group'

        const label = document.createElement('label')
        label.textContent = labelTxt

        const input = document.createElement('input')
        input.type = type
        input.name = name
        input.required = true
        input.className = 'reset-input'

        div.append(label, input)
        return div
    }

    private showMessage(msg: string, isError: boolean): void {
        const area = document.getElementById('reset-msg-area')
        if (area) {
            area.textContent = msg
            area.className = isError
                ? 'reset-msg-area error'
                : 'reset-msg-area success'
            area.style.display = 'block'
        }
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)
        const pass = formData.get('new_password') as string
        const repeat = formData.get('repeat_password') as string

        // Validación de contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

        if (!passwordRegex.test(pass)) {
            this.showMessage(
                'La contraseña debe tener al menos 8 caracteres, incluyendo 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.',
                true
            )
            return
        }

        if (pass !== repeat) {
            this.showMessage('Las contraseñas no coinciden.', true)
            return
        }

        // Guardamos token temporalmente para Axios
        localStorage.setItem('token', this.token)

        const btn = form.querySelector('button') as HTMLButtonElement
        btn.disabled = true
        btn.textContent = 'Guardando...'

        try {
            const response = await userController.resetPassword(pass)

            if (response && response.success) {
                this.showMessage(
                    '✅ ¡Contraseña cambiada! Redirigiendo al login...',
                    false
                )

                setTimeout(() => {
                    localStorage.removeItem('token')
                    window.location.href = '/'
                }, 2000)
            } else {
                this.showMessage(
                    response?.message || 'Error al cambiar la contraseña.',
                    true
                )
                btn.disabled = false
                btn.textContent = 'Cambiar Contraseña'
            }
        } catch (error) {
            this.showMessage('❌ Error de conexión o token expirado.', true)
            btn.disabled = false
            btn.textContent = 'Cambiar Contraseña'
        }
    }
}
