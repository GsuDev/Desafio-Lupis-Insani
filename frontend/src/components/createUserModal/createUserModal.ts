import './createUserModal.css'
import apiClient from '../../services/apiClient'

/**
 * modal para que el admin pueda crear usuarios
 * usa el endpoint de registro pero sin guardar el token
 * asi el admin sigue logueado como admin
 */
export class CreateUserModal {
    private overlay: HTMLDivElement | null = null
    private onSuccess: () => void

    constructor(onSuccess: () => void) {
        this.onSuccess = onSuccess
    }

    show() {
        this.overlay = document.createElement('div')
        this.overlay.className = 'create-user-overlay'

        // crear el contenido del modal
        const modal = document.createElement('div')
        modal.className = 'create-user-modal'

        //esto está metido aqui a embuche, si hay tiempo se mejorara y se hará en condiciones
        modal.innerHTML = `
            <h2>➕ Crear Usuario</h2>
            
            <form id="create-user-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" id="cu-name" placeholder="Nombre" required>
                    </div>
                    <div class="form-group">
                        <label>Apellidos</label>
                        <input type="text" id="cu-lastname" placeholder="Apellidos" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Nickname</label>
                    <input type="text" id="cu-nickname" placeholder="Nickname único" required>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="cu-email" placeholder="correo@ejemplo.com" required>
                </div>

                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" id="cu-password" placeholder="Mínimo 8 caracteres" required>
                </div>

                <div class="form-group">
                    <label>Confirmar Contraseña</label>
                    <input type="password" id="cu-password-confirm" placeholder="Repetir contraseña" required>
                </div>

                <div class="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input type="date" id="cu-birthdate" required>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-cancel">Cancelar</button>
                    <button type="submit" class="btn-create">Crear Usuario</button>
                </div>
            </form>
        `

        this.overlay.appendChild(modal)
        document.body.appendChild(this.overlay)

        // eventos
        const form = modal.querySelector('#create-user-form') as HTMLFormElement
        const btnCancel = modal.querySelector(
            '.btn-cancel'
        ) as HTMLButtonElement

        form.onsubmit = (e) => this.handleSubmit(e)
        btnCancel.onclick = () => this.close()

        // cerrar al hacer clic fuera del modal
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) this.close()
        }
    }

    private close() {
        if (this.overlay) {
            this.overlay.remove()
            this.overlay = null
        }
    }

    /**
     * maneja el envio del formulario
     */
    private async handleSubmit(e: Event) {
        e.preventDefault()

        // recoger los valores
        const name = (
            document.getElementById('cu-name') as HTMLInputElement
        ).value.trim()
        const lastname = (
            document.getElementById('cu-lastname') as HTMLInputElement
        ).value.trim()
        const nickname = (
            document.getElementById('cu-nickname') as HTMLInputElement
        ).value.trim()
        const email = (
            document.getElementById('cu-email') as HTMLInputElement
        ).value.trim()
        const password = (
            document.getElementById('cu-password') as HTMLInputElement
        ).value
        const passwordConfirm = (
            document.getElementById('cu-password-confirm') as HTMLInputElement
        ).value
        const birthdate = (
            document.getElementById('cu-birthdate') as HTMLInputElement
        ).value

        // validaciones basicas
        if (password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres')
            return
        }

        if (password !== passwordConfirm) {
            alert('Las contraseñas no coinciden')
            return
        }

        if (nickname.length < 3) {
            alert('El nickname debe tener al menos 3 caracteres')
            return
        }

        // llamar al endpoint de registro
        // usamos apiClient directamente para no pasar por el controller
        // asi no se guarda el token ni se loguea el nuevo usuario
        try {
            const response = await apiClient.post('/register', {
                name,
                lastname,
                nickname,
                email,
                password,
                password_confirmation: passwordConfirm,
                birthdate,
            })

            if (response.data?.success) {
                // exito: cerramos el modal y refrescamos la tabla
                this.close()
                this.onSuccess()
            } else {
                const errorMsg =
                    response.data?.message || 'Error al crear usuario'
                if (typeof errorMsg === 'object') {
                    const errors = Object.values(errorMsg).flat().join('\n')
                    alert(errors)
                } else {
                    alert(errorMsg)
                }
            }
        } catch (error: any) {
            console.error('Error creando usuario:', error)

            const errorData = error.response?.data?.message
            if (errorData && typeof errorData === 'object') {
                const errors = Object.values(errorData).flat().join('\n')
                alert(errors)
            } else {
                alert(errorData || 'Error de conexión al crear usuario')
            }
        }
    }
}

export default CreateUserModal
