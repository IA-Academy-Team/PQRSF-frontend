# PQRSF Frontend

Aplicación web para la gestión de PQRSF en Campuslands.  
Incluye panel de Administrador, panel de Responsable de Área, bandeja de PQRSF, chats en tiempo real y encuestas.

## Funcionalidad principal
- **Login con roles** (Administrador, Responsable de Área).
- **Dashboard**:
  - Admin: métricas globales, chats recientes, PQRSF por tipo, tiempo promedio de respuesta.
  - Responsable: métricas de su área, pendientes, apelaciones y cerradas.
- **PQRSF**:
  - Listado, filtros, detalle, adjuntos, respuestas, cierre y apelación.
- **Chats**:
  - Conversación por persona o por PQRS.
  - Envío de mensajes y archivos (admin).
- **Encuestas**:
  - Vista pública por radicado.

## Stack
- **React 19 + TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Radix UI**
- **Socket.IO Client**

## Requisitos
- Node.js >= 18
- npm >= 9

## Instalación
```bash
cd PQRSF-frontend
npm install
```

## Variables de entorno
```env
VITE_API_DEV=http://localhost:3001/api
VITE_API_PROD=https://api.tudominio.com/api
```

## Scripts
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Flujo de uso (resumen)
1. Login.
2. Dashboard según rol.
3. Gestionar PQRSF (listado, detalle, análisis y respuesta).
4. Cerrar o apelar una PQRSF.
5. Consultar chats y encuestas.

## Arquitectura (frontend)
```
src/
  components/     # UI reusable
  contexts/       # auth y sidebar
  hooks/          # hooks personalizados
  lib/            # api client y utilidades
  services/       # llamadas HTTP
  types/          # tipos TS
  views/          # páginas por rol
```

## Cliente HTTP
El cliente está en `src/lib/api.ts`:
- Añade token automáticamente.
- Maneja redirección en 401/403.
- Soporta `FormData`.

## Rutas principales
- `/` login
- `/dashboard`
- `/pqrsf`
- `/pqrsf/:id`
- `/analisis-pendientes`
- `/apelaciones`
- `/chats`
- `/encuestas`

## Tiempo real
Los chats usan WebSocket vía `socket.io-client` con `path: /ws`.

## Notas de operación
- Para que el frontend funcione completo, el backend debe estar activo.
- La URL del backend depende de si el host es localhost.

