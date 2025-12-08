import { userController } from '../../controllers/UserController'
import AccessContainer from '../accessContainer/AccessContainer'
import { renderUserForm } from '../userForm/userForm'
import UserProfileContainer from '../userProfileContainer/userProfileContainer'
import { RestorePasswordModal } from '../restorePasswordModal/restorePasswordModal'
import './loginForm.css'
import closedEyeIcon from '../../assets/icons/closed-eye.png'
import openEyeIcon from '../../assets/icons/open-eye.png'
export class LoginFormComponent {
    private container: HTMLElement
    private rootElement!: HTMLDivElement
    private formElement!: HTMLFormElement

    constructor(container: HTMLElement) {
        this.container = container
    }

    /**
     * Renderiza el formulario de login dentro del contenedor
     */
    render(): void {
        // Contenedor principal
        const loginContainer = document.createElement('div')
        loginContainer.className = 'login-container'

        // Card principal
        const card = document.createElement('div')
        card.className = 'login-card'

        // Header verde
        const header = document.createElement('div')
        header.className = 'login-header'

        const title = document.createElement('h2')
        title.textContent = 'Iniciar Sesión'
        header.append(title)

        // Body del formulario
        const body = document.createElement('div')
        body.className = 'login-body'

        // Descripción
        const description = document.createElement('p')
        description.className = 'login-description'
        description.textContent = 'Ingresa tus credenciales para acceder'

        // Formulario
        const form = document.createElement('form')
        form.className = 'login-form'
        form.id = 'login-form'

        // Input de email
        const emailGroup = this.createInputGroup(
            'email',
            'Correo Electrónico',
            'tu@email.com',
            'email',
            'user@example.com' // TODO: QUITAR
        )

        // Input de contraseña
        const passwordGroup = this.createInputGroup(
            'password',
            'Contraseña',
            '••••••••',
            'password',
            'password' // TODO: QUITAR
        )

        // Botón de submit
        const submitButton = document.createElement('button')
        submitButton.type = 'submit'
        submitButton.className = 'login-submit-button'
        submitButton.id = 'login-submit-button'
        submitButton.textContent = 'Iniciar Sesión'

        form.append(emailGroup, passwordGroup, submitButton)

        // Footer con link
        const footer = document.createElement('div')
        footer.className = 'login-footer'
        footer.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                ¿No tienes cuenta? <a href="#" id="create-account-link">Crear cuenta</a>
            </div>
            <div>
                <a href="#" id="restore-password-link" style="color: #ff8f29; font-size: 0.9em;">
                    ¿Has olvidado tu contraseña?
                </a>
            </div>
        `

        body.append(description, form, footer)
        card.append(header, body)
        loginContainer.append(card)
        this.container.append(loginContainer)

        // Guardamos referencias para usar en otros métodos
        this.rootElement = loginContainer
        this.formElement = form

        // Event Listeners
        this.setupEventListeners()
    }

    /**
     * Crea el grupo de input para el formulario
     */
    private createInputGroup(
        id: string,
        labelText: string,
        placeholder: string,
        inputType: string = 'text',
        devValue: string
    ): HTMLDivElement {
        const group = document.createElement('div')
        group.className = 'login-input-group'

        const label = document.createElement('label')
        label.htmlFor = id
        label.textContent = labelText

        // 🚨 Nuevo: Wrapper para el input y el botón
        const inputWrapper = document.createElement('div')
        inputWrapper.className = 'login-input-wrapper'

        const input = document.createElement('input')
        input.type = inputType
        input.id = id
        input.name = id
        input.placeholder = placeholder
        input.required = true
        input.value = devValue

        // Autocomplete apropiado según el tipo de campo
        if (inputType === 'email') {
            input.autocomplete = 'email'
        } else if (inputType === 'password') {
            input.autocomplete = 'current-password'
        } else {
            input.autocomplete = 'off'
        }

        inputWrapper.appendChild(input) // Añadir el input al wrapper

        // 🚨 Nuevo: Añadir botón de mostrar/ocultar contraseña si es tipo password
        if (inputType === 'password') {
            const toggleButton = document.createElement('button')
            toggleButton.type = 'button'
            toggleButton.className = 'toggle-password'
            toggleButton.setAttribute('aria-label', 'Mostrar contraseña')

            const eyeIcon = document.createElement('img')
            eyeIcon.src = closedEyeIcon
            eyeIcon.alt = 'Mostrar contraseña'
            eyeIcon.className = 'eye-icon'
            toggleButton.appendChild(eyeIcon)

            toggleButton.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text'
                    eyeIcon.src = openEyeIcon
                    eyeIcon.alt = 'Ocultar contraseña'
                    toggleButton.setAttribute(
                        'aria-label',
                        'Ocultar contraseña'
                    )
                } else {
                    input.type = 'password'
                    eyeIcon.src = closedEyeIcon
                    eyeIcon.alt = 'Mostrar contraseña'
                    toggleButton.setAttribute(
                        'aria-label',
                        'Mostrar contraseña'
                    )
                }
            })

            inputWrapper.appendChild(toggleButton) // Añadir el botón al wrapper
        }

        const errorP = document.createElement('p')
        errorP.className = 'error-message'
        errorP.dataset.input = id

        // 🚨 Cambiar: Añadir el wrapper en lugar del input directo
        group.append(label, inputWrapper, errorP)

        return group
    }

    /**
     * Configura los event listeners del componente
     */
    private setupEventListeners(): void {
        const form = this.formElement
        const createAccountLink = this.rootElement.querySelector(
            '#create-account-link'
        )

        const restorePasswordLink = this.rootElement.querySelector(
            '#restore-password-link'
        )

        // Submit del formulario
        if (form) {
            form.addEventListener('submit', (event) => this.handleSubmit(event))
        }

        // Click en "Crear cuenta"
        if (createAccountLink) {
            createAccountLink.addEventListener('click', (event) =>
                this.handleCreateAccountClick(event)
            )
        }

        if (restorePasswordLink) {
            restorePasswordLink.addEventListener('click', (event) =>
                this.handleRestorePasswordClick(event)
            )
        }
    }

    /**
     * Maneja el submit del formulario
     */
    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault()

        const form = event.target as HTMLFormElement
        const emailInput = form.querySelector('#email') as HTMLInputElement
        const passwordInput = form.querySelector(
            '#password'
        ) as HTMLInputElement

        const email = emailInput.value.trim()
        const password = passwordInput.value.trim()

        // Limpiar errores previos
        this.clearErrors()

        // ... (código existente de validación)

        // Validación de contraseña
        if (!password) {
            this.showError('password', 'La contraseña es obligatoria')
            return
        }

        if (password.length < 6) {
            this.showError(
                'password',
                'La contraseña debe tener al menos 6 caracteres'
            )
            return
        }

        console.log('Login enviado:', { email, password })

        // Hacemos login con el userController
        await userController.login(email, password)

        // Verificación del token y redirección
        const token = localStorage.getItem('token')

        if (token) {
            console.log('✅ Login exitoso, token encontrado. Redirigiendo...')
            const app = document.getElementById('app')
            if (app) {
                const userProfileContainer = new UserProfileContainer(app)
                userProfileContainer.render()
            }
        } else {
            // Manejar error si el login es exitoso pero no hay token
            console.error(
                '❌ Login exitoso, pero no se encontró el token de sesión.'
            )
            this.showError('password', 'Error de sesión. Intenta de nuevo.') // Mostrar un error genérico
        }
    }

    /**
     * Maneja el click en "Crear cuenta"
     */
    private handleCreateAccountClick(event: Event): void {
        event.preventDefault()
        console.log('Redirigir a crear cuenta')
        const app = document.getElementById('app')
        if (!app) {
            console.log('ERROR NO DOM')
            return
        }

        // Aquí se llamaría al router o controlador
        renderUserForm(app, () => {
            const form = document.getElementById('register-container')
            form?.remove()
        })
    }

    /**
     * Valida formato de email
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    /**
     * Muestra un mensaje de error en un campo específico
     */
    private showError(fieldId: string, message: string): void {
        if (!this.rootElement) return

        const errorElement = this.rootElement.querySelector(
            `.error-message[data-input="${fieldId}"]`
        ) as HTMLElement | null

        if (errorElement) {
            errorElement.textContent = message
        }
    }

    /**
     * Limpia todos los mensajes de error del formulario
     */
    private clearErrors(): void {
        if (!this.formElement) return

        const errorElements =
            this.formElement.querySelectorAll('.error-message')
        errorElements.forEach((element) => {
            element.textContent = ''
        })
    }

    /** olvidé contraseña */
    private handleRestorePasswordClick(event: Event): void {
        event.preventDefault()
        console.log('abriendo modal de recuperacion')
        const restoreModal = new RestorePasswordModal(this.container)
        restoreModal.render()
    }
}
