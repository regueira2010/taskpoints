# ⚡ TaskPoints Pro — Gestor de Productividad Estratégica con Gamificación y Matriz de Eisenhower

[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443e38)](https://github.com/pmndrs/zustand)
[![Architecture](https://img.shields.io/badge/Architecture-Self--Contained%20SPA-blueviolet)](#-stack-tecnológico)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Served_by-Nginx-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](#-características-principales)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> ⚡ **TaskPoints Pro** es un gestor de productividad estratégica basado en la **Matriz de Eisenhower** con mecánicas de **gamificación (RPG)**, delegación colaborativa y sincronización multi-pestaña en tiempo real entre compañeros de equipo. Diseñado como una arquitectura **100% frontend autónoma** (Self-Contained SPA) en React 19 + Zustand, sin requerir backend ni bases de datos externas.

---

## 🌟 Características Principales

### 🎯 1. Matriz Estratégica de Eisenhower
Organiza tus tareas en los 4 cuadrantes esenciales de toma de decisiones con soporte intuitivo de **Drag & Drop**:
- **⚡ Hacer (Urgente e Importante):** Tareas críticas con vencimiento en 24h. Recompensa: **+20 PTS**.
- **📅 Programar (No urgente, pero Importante):** Proyectos y objetivos a mediano plazo (plazo 7 días). Recompensa: **+10 PTS**.
- **👥 Delegar (Urgente, no Importante):** Asigna tareas a otros miembros del equipo. Coste: **-15 PTS**, Recompensa para quien la realiza: **+10 PTS**, Bonificación para el creador: **+5 PTS**.
- **🗑️ Eliminar (Ni urgente ni importante):** Purga distracciones y tareas irrelevantes. Coste de penalización por descarte: **-5 PTS**.

### 🎮 2. Sistema de Gamificación y Niveles
- **Niveles por Experiencia:**
  - 🥉 **Bronce:** 0 – 499 PTS
  - 🥈 **Plata:** 500 – 1,999 PTS
  - 🥇 **Oro:** 2,000 – 4,999 PTS
  - 💎 **Diamante:** 5,000+ PTS
- **Rachas Diarias (Streaks):** Mantén tu racha de días consecutivos completando tareas para desbloquear bonificaciones.
- **Feedback Sensorial:** Animaciones de confeti reactivo al subir de puntos y notificaciones toast contextuales.

### 👥 3. Delegación Colaborativa Multi-Usuario en Tiempo Real
- **Flujo de Delegación Transaccional:**
  1. El usuario creador selecciona a un compañero del equipo desde un menú desplegable (evita errores de tipeo) y abona **15 PTS**.
  2. La tarea se bloquea para el creador (*🔒 Solo el compañero asignado puede completarla*).
  3. El compañero recibe una notificación en tiempo real y puede **Aceptar** o **Rechazar** la tarea.
  4. Si la **Rechaza**, regresa a la columna "Hacer" del creador y se le reembolsan automáticamente los **15 PTS**.
  5. Si la **Completa**, quien la realizó gana **+10 PTS** y el creador recibe un **Bono de Colaboración de +5 PTS**.

### ⚡ 4. Sincronización Instantánea Multi-Pestaña
- Mecanismo dual de baja latencia: **`BroadcastChannel` API** (entrega sub-milisegundo entre pestañas activas) combinado con **`window.onstorage`** reactivo.
- **Aislamiento de Sesiones:** Cada pestaña gestiona su propio usuario activo mediante `sessionStorage`, permitiendo abrir dos ventanas del navegador y probar la interacción colaborativa entre Ana, Carlos y Lucía simultáneamente sin mezclar sesiones.

### 📊 5. Dashboard Analítico y Modo Oscuro
- Gráfico interactivo semanal con **Chart.js** para monitorear tu rendimiento diario.
- Conmutador integrado de **Modo Claro / Modo Oscuro**.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Framework UI** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Gestor de Estado** | [Zustand](https://github.com/pmndrs/zustand) (Motor reactivo sin persist loops) |
| **Persistencia** | `localStorage` (DB Compartida versionada) + `sessionStorage` (Sesión aislada) |
| **Sincronización** | `BroadcastChannel API` + `StorageEvent Listener` nativo |
| **Estilos & UI** | [Bootstrap 5.3](https://getbootstrap.com/) + [React-Bootstrap](https://react-bootstrap.github.io/) |
| **Drag and Drop** | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) |
| **Gráficos** | [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) |
| **Feedback UI** | [react-hot-toast](https://react-hot-toast.com/) + [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Contenedorización** | [Docker](https://www.docker.com/) + [Nginx Alpine](https://hub.docker.com/_/nginx) |

---

## 📁 Estructura del Proyecto

```text
taskpoints/
├── 📁 public/                     # Recursos estáticos servidos directamente
│   ├── favicon.svg                # Favicon vectorial de la aplicación
│   └── icons.svg                  # Sprites e iconos SVG del sistema
├── 📁 src/                        # Código fuente principal de la aplicación
│   ├── 📁 components/             # Componentes modulares de interfaz de usuario
│   │   ├── 📁 auth/               # Flujos y pantallas de autenticación
│   │   │   ├── Login.jsx          # Login con selectores rápidos de usuarios demo
│   │   │   ├── Register.jsx       # Registro de nuevas cuentas con avatar
│   │   │   └── VerifyEmail.jsx    # Componente de verificación de credenciales
│   │   ├── 📁 common/             # Componentes compartidos y utilitarios UI
│   │   │   └── Confetti.jsx       # Efecto de confeti para celebraciones de nivel
│   │   ├── 📁 dashboard/          # Núcleo de productividad y gamificación
│   │   │   ├── Dashboard.jsx      # Vista principal: métricas, racha, gráfico y tablero
│   │   │   ├── KanbanBoard.jsx    # Tablero Eisenhower con Drag & Drop (4 cuadrantes)
│   │   │   ├── KanbanColumn.jsx   # Columna receptora de tareas con drop zones
│   │   │   ├── NewTaskModal.jsx   # Modal de creación y delegación de tareas
│   │   │   ├── ProductivityChart.jsx # Gráfica semanal interactiva (Chart.js)
│   │   │   └── TaskCard.jsx       # Tarjeta de tarea: temporizador, badges y acciones
│   │   └── 📁 layout/             # Componentes estructurales de diseño
│   │       └── Navbar.jsx         # Barra superior: puntos, nivel, tema claro/oscuro y logout
│   ├── 📁 contexts/               # Proveedores de contexto React para estado transversal
│   │   ├── AuthContext.jsx        # Contexto de autenticación enlazado a useTaskStore
│   │   ├── TasksContext.jsx       # Contexto reactivo de tareas filtradas por sesión
│   │   └── ThemeContext.jsx       # Gestión de modo oscuro/claro y data-bs-theme
│   ├── 📁 data/                   # Datos semilla y estructuras iniciales
│   │   └── users.json             # Cuentas iniciales precargadas para testing colaborativo
│   ├── 📁 hooks/                  # Custom hooks reutilizables
│   │   ├── useConfetti.js         # Disparador del efecto de confeti
│   │   └── useSoundEffects.js     # Efectos de sonido y retroalimentación auditiva
│   ├── 📁 store/                  # Gestión de estado global y sincronización
│   │   └── useTaskStore.js        # Store Zustand: DB compartida, BroadcastChannel y persistencia
│   ├── App.css                    # Estilos complementarios y animaciones
│   ├── App.jsx                    # Enrutador principal, Providers y rutas protegidas
│   ├── index.css                  # Estilos globales, Bootstrap y paleta Dark/Light Mode
│   └── main.jsx                   # Punto de entrada raíz de la aplicación React
├── .dockerignore                  # Reglas de exclusión para imágenes Docker
├── .env                           # Variables de entorno de la aplicación
├── .gitignore                     # Archivos y carpetas omitidos por Git
├── Dockerfile                     # Construcción multi-stage (Node 20 Alpine -> Nginx Alpine)
├── docker-compose.yml             # Orquestación de servicios y mapeo de puertos (3000:80)
├── eslint.config.js               # Configuración de linter ESLint
├── index.html                     # Plantilla HTML base y viewport
├── nginx.conf                     # Configuración Nginx (SPA routing + cabeceras anti-cache)
├── package.json                   # Dependencias del proyecto y scripts npm
└── vite.config.js                 # Configuración del empaquetador Vite
```

---

## 👥 Cuentas de Prueba Disponibles

La aplicación cuenta con 3 usuarios precargados listos para probar la delegación cruzada:

| Nombre | Correo | Contraseña | Nivel Inicial |
| :--- | :--- | :--- | :--- |
| **Ana García** | `ana@ejemplo.com` | `password123` | Bronce 🥉 (0 pts) |
| **Carlos Méndez** | `carlos@ejemplo.com` | `password123` | Bronce 🥉 (0 pts) |
| **Lucía Fernández** | `lucia@ejemplo.com` | `password123` | Bronce 🥉 (0 pts) |

*(También puedes registrar nuevas cuentas libres desde el botón "Regístrate" en la pantalla de inicio).*

---

## 🚀 Instalación y Despliegue

### Opción A: Despliegue con Docker (Recomendado)

La aplicación está lista para ejecutarse en un contenedor ultra liviano con Nginx Alpine.

#### 1. Con Docker Compose (Un solo comando):
```powershell
# Clonar repositorio
git clone https://github.com/tu-usuario/taskpoints-pro.git
cd taskpoints-pro

# Construir y levantar en segundo plano
docker compose up --build -d
```
Abre tu navegador en: **`http://localhost:3000`**

#### Comandos útiles de Docker Compose:
```powershell
# Ver logs en tiempo real
docker compose logs -f

# Detener el contenedor
docker compose down

# Forzar reconstrucción limpia (sin caché)
docker compose build --no-cache
docker compose up -d
```

#### 2. Con Docker CLI Tradicional:
```powershell
# Construir imagen
docker build -t taskpoints-app .

# Correr contenedor mapeando el puerto 80 del Nginx al 3000 del host
docker run -d -p 3000:80 --name taskpoints-container taskpoints-app
```

---

### Opción B: Ejecución en Entorno Local (Node.js)

Requisitos: **Node.js 18+** y **npm**.

```powershell
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo Vite con Hot Reload
npm run dev
```
Abre tu navegador en la URL indicada por Vite (usualmente `http://localhost:5173`).

Para compilar para producción localmente:
```powershell
npm run build
npm run preview
```

---

## 🧪 Guía Rápida para Probar la Sincronización Multi-Pestaña

Para verificar cómo interactúan dos usuarios en tiempo real sin backend externo:

1. Abre **dos pestañas normales** (en la misma ventana o ventanas separadas) apuntando a `http://localhost:3000`.
   > ⚠️ **Importante:** Ambas deben usar exactamente la misma URL (`http://localhost:3000`) y ventanas normales (no modo incógnito), ya que los navegadores aíslan el almacenamiento entre diferentes orígenes o sesiones privadas.
2. En la **Pestaña 1**, inicia sesión como **Ana García** (`ana@ejemplo.com`).
3. En la **Pestaña 2**, inicia sesión como **Carlos Méndez** (`carlos@ejemplo.com`).
4. **Prueba el flujo:**
   - En la pestaña de Ana, crea una tarea en "Hacer", complétala para ganar puntos (+20 PTS).
   - Ahora delega una tarea a Carlos seleccionando `carlos@ejemplo.com` en el desplegable.
   - Observa la **Pestaña 2 de Carlos**: La tarea aparecerá **de inmediato sin refrescar**.
   - Carlos pulsa `[✓ Aceptar]` y luego `[✓ Completar]`: la tarea desaparecerá automáticamente de ambas pantallas y Ana recibirá un mensaje toast de felicitación con un bono de **+5 PTS**.

---

## ⚖️ Tabla de Reglas y Puntuaciones

| Acción | Puntos | Restricción / Condición |
| :--- | :---: | :--- |
| **Completar tarea en Hacer** | `+20 PTS` | Debe completarse antes del deadline (24h) |
| **Completar tarea en Programar** | `+10 PTS` | Deadline de 7 días |
| **Delegar tarea a compañero** | `-15 PTS` | Requiere saldo mínimo de 15 pts |
| **Completar tarea delegada (Asignado)** | `+10 PTS` | Solo el asignado puede completarla |
| **Bono de Colaboración (Creador)** | `+5 PTS` | Se acredita cuando el compañero completa la tarea delegada |
| **Rechazo de Delegación** | `+15 PTS` | Se reembolsa al creador y vuelve a su columna "Hacer" |
| **Rehacer tarea vencida** | `-5 PTS` | Máximo 3 reintentos por tarea |
| **Eliminar tarea** | `-5 PTS` | Requiere motivo y saldo mínimo de 5 pts |

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
