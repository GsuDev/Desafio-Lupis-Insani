import { GameChannel } from './channels/GameChannel'
import { WolvesChannel } from './channels/WolvesChannel'
import { emitGameEvent } from './emitters/GameEventEmitter'
import type { EventData } from './interfaces/EventData'

// Estado global para la prueba
let gameChannel: GameChannel | null = null
let wolvesChannel: WolvesChannel | null = null
const gameId = 1 // ID de prueba

// Crear interfaz HTML
function createUI(): void {
    const container = document.createElement('div')
    container.id = 'test-container'
    container.style.cssText = `
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        background: #f5f5f5;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `

    container.innerHTML = `
        <h1>🎮 Game Channel Test Interface</h1>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Panel de Control de Canales -->
            <div style="background: white; padding: 15px; border-radius: 6px;">
                <h2>📡 Canal Control</h2>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Game ID:</label>
                    <input type="number" id="gameId" value="${gameId}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button id="connectGame" style="padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ✅ Conectar Game
                    </button>
                    <button id="disconnectGame" disabled style="padding: 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ❌ Desconectar Game
                    </button>
                    <button id="connectWolves" style="padding: 10px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ✅ Conectar Wolves
                    </button>
                    <button id="disconnectWolves" disabled style="padding: 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ❌ Desconectar Wolves
                    </button>
                </div>

                <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 4px;">
                    <strong>Estado:</strong>
                    <p id="status" style="margin: 5px 0; font-size: 14px;">
                        Game: <span id="gameStatus" style="color: #f44336;">Desconectado</span> | 
                        Wolves: <span id="wolvesStatus" style="color: #f44336;">Desconectado</span>
                    </p>
                </div>
            </div>

            <!-- Panel de Envío de Mensajes -->
            <div style="background: white; padding: 15px; border-radius: 6px;">
                <h2>📤 Enviar Mensaje</h2>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Canal:</label>
                    <select id="channel" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="game">Game Channel</option>
                        <option value="wolves">Wolves Channel</option>
                    </select>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Mensaje:</label>
                    <input type="text" id="messageInput" placeholder="Escribe un mensaje..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button id="sendMessage" style="width: 100%; padding: 10px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    📨 Enviar Mensaje
                </button>
            </div>
        </div>

        <!-- Log de eventos -->
        <div style="background: white; padding: 15px; border-radius: 6px;">
            <h2>📋 Log de Eventos</h2>
            <div id="log" style="
                background: #1e1e1e;
                color: #00ff00;
                padding: 15px;
                border-radius: 4px;
                height: 300px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                border: 1px solid #ddd;
            "></div>
            <button id="clearLog" style="margin-top: 10px; padding: 8px 15px; background: #757575; color: white; border: none; border-radius: 4px; cursor: pointer;">
                🗑️ Limpiar Log
            </button>
        </div>
    `

    document.body.appendChild(container)
    document.body.style.margin = '0'
    document.body.style.background = '#fff'
}

// Función para agregar mensajes al log
function addLog(
    message: string,
    type: 'info' | 'success' | 'error' | 'event' = 'info'
): void {
    const log = document.getElementById('log')
    if (!log) return

    const timestamp = new Date().toLocaleTimeString()
    const colors: Record<string, string> = {
        info: '#00ff00',
        success: '#00ff00',
        error: '#ff4444',
        event: '#ffff00',
    }

    const div = document.createElement('div')
    div.style.color = colors[type]
    div.textContent = `[${timestamp}] ${message}`
    log.appendChild(div)
    log.scrollTop = log.scrollHeight
}

// Conectar a Game Channel
function connectGameChannel(): void {
    try {
        const newGameId = parseInt(
            (document.getElementById('gameId') as HTMLInputElement).value
        )
        gameChannel = new GameChannel(newGameId)

        // Actualizar interfaz
        const gameBtn = document.getElementById(
            'connectGame'
        ) as HTMLButtonElement
        const disconnectBtn = document.getElementById(
            'disconnectGame'
        ) as HTMLButtonElement
        gameBtn.disabled = true
        disconnectBtn.disabled = false

        const gameStatus = document.getElementById('gameStatus')
        if (gameStatus) {
            gameStatus.textContent = '✅ Conectado'
            gameStatus.style.color = '#4CAF50'
        }

        addLog(`✅ Conectado a Game Channel (ID: ${newGameId})`, 'success')
    } catch (error) {
        addLog(`❌ Error conectando Game Channel: ${error}`, 'error')
    }
}

// Desconectar Game Channel
function disconnectGameChannel(): void {
    try {
        if (gameChannel) {
            gameChannel.leave()
            gameChannel = null
        }

        const gameBtn = document.getElementById(
            'connectGame'
        ) as HTMLButtonElement
        const disconnectBtn = document.getElementById(
            'disconnectGame'
        ) as HTMLButtonElement
        gameBtn.disabled = false
        disconnectBtn.disabled = true

        const gameStatus = document.getElementById('gameStatus')
        if (gameStatus) {
            gameStatus.textContent = '❌ Desconectado'
            gameStatus.style.color = '#f44336'
        }

        addLog('👋 Desconectado de Game Channel', 'info')
    } catch (error) {
        addLog(`❌ Error desconectando: ${error}`, 'error')
    }
}

// Conectar a Wolves Channel
function connectWolvesChannel(): void {
    try {
        const newGameId = parseInt(
            (document.getElementById('gameId') as HTMLInputElement).value
        )
        wolvesChannel = new WolvesChannel(newGameId)

        const wolvesBtn = document.getElementById(
            'connectWolves'
        ) as HTMLButtonElement
        const disconnectBtn = document.getElementById(
            'disconnectWolves'
        ) as HTMLButtonElement
        wolvesBtn.disabled = true
        disconnectBtn.disabled = false

        const wolvesStatus = document.getElementById('wolvesStatus')
        if (wolvesStatus) {
            wolvesStatus.textContent = '✅ Conectado'
            wolvesStatus.style.color = '#4CAF50'
        }

        addLog(`✅ Conectado a Wolves Channel (ID: ${newGameId})`, 'success')
    } catch (error) {
        addLog(`❌ Error conectando Wolves Channel: ${error}`, 'error')
    }
}

// Desconectar Wolves Channel
function disconnectWolvesChannel(): void {
    try {
        if (wolvesChannel) {
            wolvesChannel.leave()
            wolvesChannel = null
        }

        const wolvesBtn = document.getElementById(
            'connectWolves'
        ) as HTMLButtonElement
        const disconnectBtn = document.getElementById(
            'disconnectWolves'
        ) as HTMLButtonElement
        wolvesBtn.disabled = false
        disconnectBtn.disabled = true

        const wolvesStatus = document.getElementById('wolvesStatus')
        if (wolvesStatus) {
            wolvesStatus.textContent = '❌ Desconectado'
            wolvesStatus.style.color = '#f44336'
        }

        addLog('👋 Desconectado de Wolves Channel', 'info')
    } catch (error) {
        addLog(`❌ Error desconectando: ${error}`, 'error')
    }
}

// Enviar mensaje
async function sendMessage(): Promise<void> {
    const channel = (document.getElementById('channel') as HTMLSelectElement)
        .value
    const input = document.getElementById('messageInput') as HTMLInputElement
    const message = input.value.trim()

    if (!message) {
        addLog('⚠️ El mensaje está vacío', 'error')
        return
    }

    try {
        const newGameId = parseInt(
            (document.getElementById('gameId') as HTMLInputElement).value
        )
        const eventData: EventData = {
            message,
            timestamp: new Date().toISOString(),
            userId: 'test-user',
        }

        if (channel === 'game') {
            const success = await emitGameEvent(
                newGameId,
                'chat.message',
                eventData
            )
            addLog(
                `${success ? '✅' : '❌'} Mensaje enviado a Game Channel: "${message}"`,
                success ? 'success' : 'error'
            )
        } else {
            const success = await emitWolvesEvent(
                newGameId,
                'chat.message',
                eventData
            )
            addLog(
                `${success ? '✅' : '❌'} Mensaje enviado a Wolves Channel: "${message}"`,
                success ? 'success' : 'error'
            )
        }

        input.value = ''
    } catch (error) {
        addLog(`❌ Error enviando mensaje: ${error}`, 'error')
    }
}

// Inicializar
function init(): void {
    createUI()

    // Event listeners
    document
        .getElementById('connectGame')
        ?.addEventListener('click', connectGameChannel)
    document
        .getElementById('disconnectGame')
        ?.addEventListener('click', disconnectGameChannel)
    document
        .getElementById('connectWolves')
        ?.addEventListener('click', connectWolvesChannel)
    document
        .getElementById('disconnectWolves')
        ?.addEventListener('click', disconnectWolvesChannel)
    document
        .getElementById('sendMessage')
        ?.addEventListener('click', sendMessage)
    document.getElementById('clearLog')?.addEventListener('click', () => {
        const log = document.getElementById('log')
        if (log) log.innerHTML = ''
    })

    // Permitir enviar con Enter
    document
        .getElementById('messageInput')
        ?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage()
        })

    addLog('🚀 Interface de prueba inicializada', 'success')
    addLog('Conecta a los canales y prueba enviar/recibir mensajes', 'info')
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
