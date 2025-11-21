
import './changePasswordModal.css'
import { userController } from '../../controllers/UserController'

export class ChangePasswordModal {
    // aqui guardamos donde vamos a pintar el modal
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
    }

    // metodo principal para pintar todo el html
    render(): void {
        // limpiamos por si acaso
        this.container.innerHTML = ''

        //  overlayel fondo oscuro de detras
        const overlay = document.createElement('div')
        overlay.className = 'password-overlay'
        // si haces click fuera del modal se cierra
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal()
        })

        // el cuadro central estilo comic
        const card = document.createElement('div')
        card.className = 'password-card'

        // titulo del modal
        const title = document.createElement('h2')
        title.className = 'password-title'
        title.textContent = 'Cambiar Contraseña'

        // formulario 
        const form = document.createElement('form')
        form.className = 'password-form'
        // al enviar el formulario llamamos a handlesubmit
        form.onsubmit = (e) => this.handleSubmit(e)

        // creamos los inputs usando el helper de abajo
        // input para la contraseña actual
        const currentPass = this.createInputRow('Introduce tu contraseña actual:', 'current_password', 'Contraseña Actual')
        // input para la nueva contraseña
        const newPass = this.createInputRow('Introduce tu contraseña nueva:', 'new_password', 'Contraseña Nueva')
        // input para repetir la nueva contraseña
        const repeatPass = this.createInputRow('Repite tu contraseña nueva:', 'repeat_password', 'Contraseña Nueva Rep.')

        // div para mostrar errores si algo sale mal
        const statusMsg = document.createElement('div')
        statusMsg.className = 'status-msg' 
        statusMsg.id = 'password-status-msg'    

        // contenedor para los botones de abajo
        const actionsDiv = document.createElement('div')
        actionsDiv.className = 'password-actions'

        // boton de cancelar
        const cancelBtn = document.createElement('button')
        cancelBtn.type = 'button' // importante type button para que no envie el form
        cancelBtn.className = 'btn-cancel'
        cancelBtn.textContent = 'Cancelar'
        cancelBtn.onclick = () => this.closeModal()

        // boton de aceptar
        const saveBtn = document.createElement('button')
        saveBtn.type = 'submit' // este si envia el form
        saveBtn.className = 'btn-confirm'
        saveBtn.textContent = 'Aceptar'

        // metemos los botones en su div
        actionsDiv.append(cancelBtn, saveBtn)

        // juntamos todo en el formulario y la tarjeta
        form.append(currentPass, newPass, repeatPass, statusMsg, actionsDiv)
        card.append(title, form)
        overlay.appendChild(card)
        // y finalmente lo metemos en el dom
        this.container.appendChild(overlay)
    }

    // funcion para crear una fila con label e input y no repetir codigo
    private createInputRow(labelText: string, name: string, placeholder: string): HTMLDivElement {
        const row = document.createElement('div')
        row.className = 'input-row'
        
        const label = document.createElement('label')
        label.textContent = labelText
        label.className = 'row-label'
        
        const input = document.createElement('input')
        input.type = 'password' // siempre password para que salgan puntitos
        input.name = name
        input.placeholder = placeholder
        input.required = true // obligatorio
        input.className = 'row-input'
        
        row.append(label, input)
        return row
    }

    // funcion para cerrar el modal borrandolo del dom
    private closeModal(): void {
        const overlay = this.container.querySelector('.password-overlay')
        if (overlay) overlay.remove()
    }

    private showMessage(message: string, type: 'error' | 'success'): void {
        const msgDiv = this.container.querySelector('#password-status-msg') as HTMLElement
        if (msgDiv) {
            msgDiv.textContent = message
            // Reseteamos clases y ponemos la nueva
            msgDiv.className = `status-msg ${type}`
            msgDiv.style.display = 'block'
        }
    }
    
    // funcion para mostrar mensajes de error en rojo
    private showError(message: string): void {
        const msgDiv = this.container.querySelector('#password-error-msg') as HTMLElement
        if (msgDiv) {
            msgDiv.textContent = message
            msgDiv.style.display = 'block'
        }
    }

    // funcion que maneja el envio del formulario
    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault() 
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)

        // sacamos los valores de los inputs
        const current = formData.get('current_password') as string
        const newP = formData.get('new_password') as string
        const repeatP = formData.get('repeat_password') as string

        if (newP.length < 8) {
            this.showMessage('La contraseña debe tener al menos 8 caracteres.', 'error')
            return
        }
        if (newP !== repeatP) {
            this.showMessage('Las contraseñas nuevas no coinciden.', 'error')
            return
        }

        
        
        // Desactivar botón para evitar doble click 
        const submitBtn = this.container.querySelector('.btn-confirm') as HTMLButtonElement
        if(submitBtn) {
             submitBtn.textContent = 'Procesando...'
             submitBtn.disabled = true
        }

        const response = await userController.changePassword(current, newP, repeatP)
        
        if (response && response.success) {
            this.showMessage('¡Contraseña actualizada correctamente!', 'success')
            
            //  Esperar 1.5 segundos antes de cerrar para que lo lean
            setTimeout(() => {
                this.closeModal()
            }, 1500)
            
        } else {
            // Si falla, reactivamos el botón y mostramos error
            if(submitBtn) {
                submitBtn.textContent = 'Aceptar'
                submitBtn.disabled = false
            }
            this.showMessage(response?.message || 'Error al cambiar la contraseña', 'error')
        }
    }
}

export default ChangePasswordModal