# PQRSF Frontend

Aplicación web del sistema **PQRSF de Campuslands**.
Permite operar el flujo completo de solicitudes (Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones) desde una interfaz por rol, conectada en tiempo real con el backend.

## 1) Resumen funcional (para clientes y usuarios interesados)
La aplicación permite:

- Iniciar sesión según perfil de usuario.
- Visualizar panel de control con métricas y estado operativo.
- Gestionar PQRSF (bandeja, filtros, detalle, análisis, respuesta, cierre y apelación).
- Atender conversaciones por chat (persona/PQRS) con modo IA o modo administrador.
- Responder encuestas de satisfacción por ticket (vista pública).

## 2) Perfiles y experiencia por rol
### Administrador
- Dashboard global (totales, estado, tipo, chats recientes, promedios).
- Bandeja general de PQRSF.
- Módulos de seguimiento, apelaciones y cerradas.
- Gestión de responsables, áreas y stakeholders.
- Gestión de chats operativos (mensajes, archivos y cambio de modo IA/Admin).
- Visualización administrativa de encuestas.

### Usuario de Área Responsable
- Dashboard de su área (asignadas, pendientes, apelaciones, cerradas).
- Cola de análisis pendientes.
- Gestión de casos en apelación/reanálisis.
- Operación sobre casos asignados según reglas de negocio del backend.

## 3) Stack técnico
- **React 19 + TypeScript**
- **Vite 7**
- **Tailwind CSS 4** + `@tailwindcss/vite` + PostCSS
- **Radix UI** (base de componentes)
- **React Router 7**
- **Socket.IO Client** (chat en tiempo real)
- **React Hook Form + Zod** (formularios y validación)

## 4) Arquitectura del frontend
El frontend está organizado por responsabilidad:

```text
src/
  components/      # componentes reutilizables (incluye ui/)
  contexts/        # estado global (auth, sidebar)
  hooks/           # hooks custom
  lib/             # cliente HTTP, utilidades base
  services/        # capa de acceso a API por dominio
  types/           # contratos TypeScript
  views/           # pantallas por dominio/rol
```

Patrón aplicado:

- **View-first + service layer**.
- Las vistas no consumen `fetch` directamente: dependen de `src/services/*`.
- El cliente HTTP central (`src/lib/api.ts`) concentra autenticación, errores y normalización de URL.

## 5) Flujo de datos
1. Usuario inicia sesión.
2. `AuthProvider` guarda sesión de usuario (local/session storage).
3. Las vistas consumen `services/*`.
4. `lib/api.ts` agrega `Authorization` cuando aplica.
5. Ante `401/403`, limpia sesión y redirige a login.
6. Chats usan Socket.IO para sincronización en tiempo real.

## 6) Rutas principales
### Públicas
- `/` Login
- `/register`
- `/forgot-password`
- `/reset-password`
- `/survey/:ticketNumber`
- `/surver/:ticketNumber` *(alias legacy)*

### Operativas
- `/dashboard`
- `/pqrsf`
- `/pqrsf/:id`
- `/analisis-pendientes`
- `/apelaciones`
- `/seguimiento`
- `/en-apelacion`
- `/cerradas`
- `/chats`
- `/responsables`
- `/areas`
- `/stakeholders`
- `/encuestas`

## 7) Cliente HTTP y autenticación
Archivo clave: `src/lib/api.ts`

Características:

- Resuelve automáticamente la `API_BASE` según host (`localhost` vs productivo).
- Asegura sufijo `/api` aunque la variable no lo incluya.
- Adjunta token Bearer en rutas privadas.
- Soporta `FormData` para subida de archivos.
- Unifica errores con `HttpError`.
- Maneja expiración/no autorización (`401/403`) limpiando sesión.

## 8) Chat en tiempo real
Vista principal: `src/views/admin/Chats.tsx`

Capacidades:

- Filtro de chats por persona o por PQRS.
- Cambio de modo IA/Admin por conversación.
- Envío de texto y archivos.
- Reconexión y refresco por sockets.

Socket:

- Base URL derivada de `API_BASE`.
- Path: `/ws`.
- Eventos esperados:
  - `chat_summary`
  - `chat_message`
  - `chat_mode`

## 9) Variables de entorno
Archivo de ejemplo:

```env
VITE_API_DEV=http://localhost:3001
VITE_API_PROD=https://api.tudominio.com
```

Notas:

- Puedes definir URL con o sin `/api`; el cliente la normaliza.
- Para local, mantener backend disponible en `localhost`.

## 10) Instalación y ejecución
```bash
cd PQRSF-frontend
npm install
npm run dev
```

Aplicación local por defecto:

- `http://localhost:5173`

## 11) Scripts disponibles
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## 12) Integración con backend
Este frontend depende de `PQRSF-backend` para funcionamiento completo:

- Auth/sesión
- Bandeja y detalle PQRSF
- Dashboard
- Chats y sockets
- Encuestas

Secuencia recomendada en local:

1. Levantar backend (`:3001`).
2. Configurar `.env` del frontend.
3. Levantar frontend (`:5173`).
4. Validar login y navegación por rol.

## 13) Guía rápida de QA funcional
Checklist mínimo para validar entrega:

- Login admin y login responsable.
- Carga de dashboard en ambos roles.
- Listado/filtro de PQRSF y apertura de detalle.
- Registro de análisis y respuesta en una PQRS.
- Cambio de estado (incluyendo apelación/reanálisis).
- Chat en modo IA y modo Admin (texto + archivo).
- Encuesta pública por ticket.
- Cierre de sesión y reingreso.

## 14) Consideraciones de mantenimiento
- Mantener tipado de `src/types/database.ts` alineado con respuestas del backend.
- Cualquier endpoint nuevo debe exponerse vía `src/services/*`.
- Evitar llamadas directas a `fetch` dentro de vistas para conservar consistencia.
- Si cambian eventos socket en backend, actualizar listeners en `Chats.tsx`.

## 15) Problemas comunes
- **Pantalla en blanco al cargar**:
  - Revisar `VITE_API_DEV` y disponibilidad del backend.
- **Datos en cero en dashboard**:
  - Confirmar respuesta real de endpoints `/dashboard/*`.
- **Errores 401/403 constantes**:
  - Verificar token y sesión (`auth/me`, `auth/login`).
- **Chats sin actualización en vivo**:
  - Confirmar conexión Socket.IO en path `/ws` y CORS backend.

## 16) Estado del proyecto
Este frontend está orientado a operación productiva interna de PQRSF, con una base modular y tipada para mantenimiento evolutivo por equipos técnicos.

