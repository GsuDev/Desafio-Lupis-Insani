import './userForm.css'
import { userController } from '../../controllers/UserController'

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

    const errorP = document.createElement('p')
    errorP.className = 'error-message'
    errorP.dataset.input = id

    group.append(label)
    group.append(input)
    group.append(errorP)

    return group
}

export const renderUserForm = (appContainer: HTMLDivElement) => {
    appContainer.innerHTML = ''

    const container = document.createElement('div')
    container.id = 'register-container'

    const card = document.createElement('div')
    card.className = 'card'

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

    // Circulo perfil + nickname + nombre y apellidos
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
    // Form.appendChild(fileInput);

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
        'Nombre o apodo del Héroe de castonegro'
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
        } else {
            globalError.textContent = message
            globalSuccess.textContent = ''
        }
    }

    const disableForm = (disabled: boolean) => {
        submitButton.disabled = disabled
        submitButton.textContent = disabled
            ? 'Creando cuenta..'
            : 'Crear Cuenta'
    }

    userController.initController(
        showValidationError,
        clearValidationErrors,
        showGlobalMessage,
        disableForm
    )

    form.addEventListener('submit', (e) => {
        e.preventDefault()
        console.log('VISTA: Submit detectado. Creando FormData..')

        const formData = new FormData(form)
        const fileInput =
            document.querySelector<HTMLInputElement>('#profile_picture')
        if (fileInput?.files?.[0]) {
            formData.append('profile_picture', fileInput.files[0])
        }

        userController.handleRegister(formData)
    })
}
