# Lupis Insani

Versión web del juego *Hombres Lobo de Castronegro*, desarrollada con arquitectura basada en Laravel, Vite y Docker. El proyecto incluye backend con colas y WebSockets, frontend en TypeScript y un entorno completamente dockerizado para facilitar el desarrollo.

---

## Tecnologías utilizadas

### Backend

![Laravel](https://img.shields.io/badge/Laravel_12-FF2D20?style=for-the-badge\&logo=laravel\&logoColor=white)
![Reverb](https://img.shields.io/badge/Laravel_Reverb-FF2D20?style=for-the-badge\&logo=laravel\&logoColor=white)
![Laravel Queue](https://img.shields.io/badge/Laravel_Queue-FF2D20?style=for-the-badge\&logo=laravel\&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge\&logo=mariadb\&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge\&logo=redis\&logoColor=white)

### Frontend

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![JavaScript Vanilla](https://img.shields.io/badge/JavaScript_Vanilla-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)

### Infraestructura

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge\&logo=nginx\&logoColor=white)
![Make](https://img.shields.io/badge/Make-000000?style=for-the-badge\&logo=gnu\&logoColor=white)
![Windows Batch](https://img.shields.io/badge/Windows_Batch-4D4D4D?style=for-the-badge\&logo=windows\&logoColor=white)

---

## Servicios del proyecto

| Servicio  | Puerto | Descripción                               |
| --------- | ------ | ----------------------------------------- |
| `laravel` | 8000   | API HTTP                                  |
| `reverb`  | 8080   | WebSockets                                |
| `worker`  | —      | Procesamiento de colas y lógica del juego |
| `node`    | 5173   | Servidor de desarrollo Vite               |
| `nginx`   | 80     | Proxy inverso                             |
| `mariadb` | 3306   | Base de datos                             |
| `redis`   | 6379   | Sistema de colas/cache                    |

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/GsuDev/Desafio-Lupis-Insani.git
cd lupis-insani
```

---

## Puesta en marcha

### Mac / Linux

El proyecto dispone de un `Makefile` con comandos básicos:

```bash
make start   # Inicia los contenedores Docker
make stop    # Detiene todos los contenedores
```

---

### Windows

En la raíz se incluye `manage.bat`. Comandos disponibles:

```powershell
manage.bat start   # Inicia los contenedores
manage.bat stop    # Detiene los contenedores
```

---

## Estructura del proyecto

```
/backend              # Laravel API, WebSockets y Worker
/frontend             # Vite + TypeScript Vanilla
/nginx                # Configuración de Nginx
docker-compose.yml    # Definición de servicios
manage.bat            # Scripts para Windows
Makefile              # Scripts para Mac/Linux
```

---

## Docker

Ejecución manual del entorno:

```bash
docker compose up -d --build
```

Detener el entorno y eliminar volúmenes:

```bash
docker compose down -v
```

---

## Arquitectura del sistema

```mermaid
flowchart TD

Client[Cliente / Navegador]
Frontend[Node / Vite]
Nginx[Nginx Proxy]
Backend[Laravel Backend]
Worker[Laravel Worker]
Reverb[Servidor Reverb / WebSocket]
Redis[Redis]
DB[MariaDB]

Client -->|HTTP / SPA| Frontend
Client -->|HTTP / API| Nginx
Nginx -->|HTTP /api| Backend

Backend -->|Conexión DB| DB
Backend -->|Jobs / Eventos| Redis

Worker -->|Consume jobs| Redis
Worker -->|Actualiza estado| Backend

Redis -->|Envío de eventos| Reverb
Reverb -->|Tiempo real| Nginx
```

---

## Contribución

Flujo recomendado:

1. Crear rama desde `dev`.
2. Aplicar cambios y realizar commits.
3. Abrir una Pull Request.
4. Revisar con el equipo.
5. Fusionar en `dev` tras aprobación.

---

## Licencia

Licencia pendiente de definir.
