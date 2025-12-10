import './userForm.css'
import { userController } from '../../controllers/UserController'
import UserProfileContainer from '../userProfileContainer/userProfileContainer'
import closedEyeIcon from '../../assets/icons/closed-eye.png'
import openEyeIcon from '../../assets/icons/open-eye.png'

const createInputGroup = (
    id: string,
    labelText: string,
    inputType: string,
    name: string,
    required = true,
    placeholder = ''
): HTMLDivElement => {
    const group = document.createElement('div')
    group.className = 'input-group'

    const label = document.createElement('label')
    label.htmlFor = id
    label.textContent = labelText

    const inputWrapper = document.createElement('div')
    inputWrapper.className = 'input-wrapper'

    const input = document.createElement('input')
    input.type = inputType
    input.id = id
    input.name = name
    input.required = required
    if (placeholder) {
        input.placeholder = placeholder
    }
    if (inputType === 'password') {
        input.autocomplete = 'new-password'
    } else if (inputType === 'email') {
        input.autocomplete = 'email'
    } else {
        input.autocomplete = 'off'
    }

    inputWrapper.appendChild(input)

    // Añadir botón de mostrar/ocultar contraseña si es tipo password
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
                toggleButton.setAttribute('aria-label', 'Ocultar contraseña')
            } else {
                input.type = 'password'
                eyeIcon.src = closedEyeIcon
                eyeIcon.alt = 'Mostrar contraseña'
                toggleButton.setAttribute('aria-label', 'Mostrar contraseña')
            }
        })

        inputWrapper.appendChild(toggleButton)
    }

    const errorP = document.createElement('p')
    errorP.className = 'error-message'
    errorP.dataset.input = id

    group.append(label)
    group.append(inputWrapper)
    group.append(errorP)

    return group
}

export const renderUserForm = (
    appContainer: HTMLElement,
    onClose?: () => void
) => {
    const container = document.createElement('div')
    container.id = 'register-container'

    const card = document.createElement('div')
    card.className = 'card'

    // Botón de cerrar (X)
    const closeButton = document.createElement('button')
    closeButton.className = 'close-button'
    closeButton.innerHTML = '×'
    closeButton.setAttribute('aria-label', 'Cerrar')
    closeButton.type = 'button'

    // Event listener para cerrar el modal
    closeButton.addEventListener('click', () => {
        if (onClose) {
            onClose()
        } else {
            // Comportamiento por defecto: eliminar el modal
            container.remove()
        }
    })

    // También cerrar al hacer click en el overlay (fondo oscuro)
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            if (onClose) {
                onClose()
            } else {
                container.remove()
            }
        }
    })

    card.appendChild(closeButton)

    const form = document.createElement('form')
    form.id = 'registration-form'

    // Mensajes Globales
    const globalSuccess = document.createElement('p')
    globalSuccess.id = 'global-success'
    globalSuccess.className = 'global-message success'

    const globalError = document.createElement('p')
    globalError.id = 'global-error'
    globalError.className = 'global-message error'

    form.append(globalSuccess)
    form.append(globalError)

    // Círculo perfil + nickname + nombre y apellidos
    const topSection = document.createElement('div')
    topSection.className = 'top-section'

    // Contenedor del perfil (círculo)
    const profileContainer = document.createElement('div')
    profileContainer.className = 'profile-container'

    const profilePictureGroup = createInputGroup(
        'profile_picture',
        'Foto de Perfil',
        'file',
        'profile_picture',
        false
    )
    profilePictureGroup.className = 'input-group profile-input-group'

    const fileInput = profilePictureGroup.querySelector('input')!
    const profileLabel = profilePictureGroup.querySelector('label')!

    if (fileInput) {
        fileInput.accept = 'image/png, image/jpeg'

        // Event listener para previsualizar la imagen
        fileInput.addEventListener('change', () => {
            // Comprobamos si el usuario ha seleccionado un archivo
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0]

                // Usamos FileReader para leer el archivo como una URL
                const reader = new FileReader()
                reader.addEventListener('load', (e) => {
                    // Cuando esté cargado, lo ponemos como fondo del label (círculo)
                    if (e.target?.result && profileLabel) {
                        profileLabel.style.backgroundImage = `url(${e.target.result})`
                        profileLabel.style.backgroundSize = 'cover'
                        profileLabel.style.backgroundPosition = 'center'
                        profileLabel.textContent = '' // Quitamos el texto "Foto de Perfil"

                        // Añadimos una clase para indicar que tiene imagen
                        profileLabel.classList.add('has-image')
                    }
                })
                reader.readAsDataURL(file)
            } else {
                // Si no hay archivo, restauramos el estado original
                if (profileLabel) {
                    profileLabel.style.backgroundImage = ''
                    profileLabel.textContent = 'Foto de Perfil'
                    profileLabel.classList.remove('has-image')
                }
            }
        })
    }

    profileContainer.append(profilePictureGroup)

    // Contenedor derecho (nickname, nombre, apellidos)
    const rightSection = document.createElement('div')
    rightSection.className = 'right-section'

    const nicknameGroup = createInputGroup(
        'nickname',
        'Nickname',
        'text',
        'nickname',
        true,
        'Nombre o apodo del Héroe de Castronegro'
    )
    rightSection.append(nicknameGroup)

    const rowNombre = document.createElement('div')
    rowNombre.className = 'row-group'

    const nameGroup = createInputGroup(
        'name',
        'Nombre',
        'text',
        'name',
        true,
        'Lupi'
    )
    const lastnameGroup = createInputGroup(
        'lastname',
        'Apellidos',
        'text',
        'lastname',
        true,
        'Insani'
    )

    rowNombre.append(nameGroup)
    rowNombre.append(lastnameGroup)
    rightSection.append(rowNombre)

    topSection.append(profileContainer)
    topSection.append(rightSection)
    form.append(topSection)

    const emailGroup = createInputGroup(
        'email',
        'Correo Electrónico',
        'email',
        'email',
        true,
        'ejemplo@correo.com'
    )
    form.append(emailGroup)

    const rowPassword = document.createElement('div')
    rowPassword.className = 'row-group'

    const passwordGroup = createInputGroup(
        'password',
        'Contraseña',
        'password',
        'password',
        true,
        'Mínimo 8 caracteres'
    )
    const passwordConfGroup = createInputGroup(
        'password_confirmation',
        'Repite Contraseña',
        'password',
        'password_confirmation',
        true,
        'Confirma tu contraseña'
    )

    rowPassword.append(passwordGroup)
    rowPassword.append(passwordConfGroup)
    form.append(rowPassword)

    const birthdayGroup = createInputGroup(
        'birthday',
        'Fecha de Nacimiento',
        'date',
        'birthdate',
        false,
        'dd/mm/aaaa'
    )
    form.append(birthdayGroup)

    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.id = 'submit-button'
    submitButton.textContent = 'Crear Cuenta'
    form.append(submitButton)

    card.append(form)
    container.append(card)
    appContainer.append(container)

    // Variable para controlar si el registro fue exitoso
    let registrationSuccess = false

    // Callbacks
    const showValidationError = (field: string, message: string) => {
        const errorElement = container.querySelector(
            `.error-message[data-input="${field}"]`
        )
        if (errorElement) {
            errorElement.textContent = message
        }
    }

    const clearValidationErrors = () => {
        const allErrorElements = container.querySelectorAll('.error-message')
        for (const element of allErrorElements) {
            element.textContent = ''
        }
    }

    const showGlobalMessage = (message: string, isSuccess: boolean) => {
        if (isSuccess) {
            globalSuccess.textContent = message
            globalError.textContent = ''
            registrationSuccess = true

            // Verificar que hay token antes de redirigir
            const token = localStorage.getItem('token')

            if (!token) {
                console.error(
                    '❌ Registro exitoso pero no hay token en localStorage'
                )
                globalError.textContent =
                    'Error: No se pudo autenticar. Intenta iniciar sesión.'
                globalSuccess.textContent = ''
                registrationSuccess = false
                return
            }

            console.log('✅ Token encontrado, redirigiendo al perfil...')

            // Esperar 2 segundos antes de redirigir
            setTimeout(() => {
                container.remove()
                const app = document.getElementById('app')
                if (app) {
                    const userProfileContainer = new UserProfileContainer(app)
                    userProfileContainer.render()
                }
            }, 2000)
        } else {
            globalError.textContent = message
            globalSuccess.textContent = ''
            registrationSuccess = false
        }
    }

    const disableForm = (disabled: boolean) => {
        submitButton.disabled = disabled
        submitButton.textContent = disabled
            ? 'Creando cuenta...'
            : 'Crear Cuenta'
    }

    userController.initController(
        showValidationError,
        clearValidationErrors,
        showGlobalMessage,
        disableForm
    )

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        console.log('VISTA: Submit detectado. Creando FormData...')

        const formData = new FormData(form)
        const fileInput =
            document.querySelector<HTMLInputElement>('#profile_picture')
        if (fileInput?.files?.[0]) {
            formData.append('profile_picture', fileInput.files[0])
        }

        await userController.handleRegister(formData)

        // Solo cerrar si el registro fue exitoso
        // (el cierre y redirección se maneja en showGlobalMessage)
    })
}
