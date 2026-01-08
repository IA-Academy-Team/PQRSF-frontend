# PQRSF System - Sistema de Gestión de Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones

Sistema web desarrollado con React y Vite para la gestión integral de PQRSF (Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones) de Campuslands.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Uso del Cliente API](#-uso-del-cliente-api)
- [Estructura de la Base de Datos](#-estructura-de-la-base-de-datos)
- [Desarrollo](#-desarrollo)
- [Build y Despliegue](#-build-y-despliegue)

## ✨ Características

- 🔐 **Autenticación y Autorización**: Sistema de login con roles (Administrador, Usuario de Área Responsable)
- 📝 **Gestión de PQRSF**: Creación, edición, seguimiento y análisis de solicitudes
- 💬 **Sistema de Chats**: Comunicación en tiempo real con clientes vía WhatsApp
- 📊 **Dashboard**: Visualización de métricas y estadísticas
- 🔍 **Búsqueda y Filtros**: Búsqueda avanzada por múltiples criterios
- 📈 **Análisis y Reanálisis**: Sistema de análisis técnico y apelaciones
- 📋 **Encuestas de Satisfacción**: Evaluación de la atención recibida
- 👥 **Gestión de Usuarios**: Administración de usuarios, áreas y responsables
- 🎨 **UI Moderna**: Interfaz construida con Radix UI y Tailwind CSS v4

## 🛠 Tecnologías

### Core
- **React 19.1.1** - Biblioteca de UI
- **TypeScript 5.9.3** - Tipado estático
- **Vite 7.1.2** - Build tool y dev server
- **React Router DOM 7.9.1** - Enrutamiento

### UI y Estilos
- **Tailwind CSS 4.1.13** - Framework de utilidades CSS
- **Radix UI** - Componentes accesibles sin estilos
- **Lucide React** - Iconos
- **Framer Motion** - Animaciones (si se requiere)

### Formularios y Validación
- **React Hook Form 7.60.0** - Manejo de formularios
- **Zod 3.25.76** - Validación de esquemas
- **@hookform/resolvers** - Integración Zod + React Hook Form

### Utilidades
- **date-fns 4.1.0** - Manipulación de fechas
- **clsx & tailwind-merge** - Manejo de clases CSS
- **class-variance-authority** - Variantes de componentes

## 📦 Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x (o pnpm/yarn)
- **Git**

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd pqrsf-system-3
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
VITE_API_DEV=http://localhost:3000/api
VITE_API_PROD=https://api.tudominio.com/api
```

## ⚙️ Configuración

### Alias de Importación

El proyecto usa alias `@/` que apunta a `src/`:

```typescript
import { api } from '@/lib/api'
import { pqrsfService } from '@/services'
import type { DBPQRSF } from '@/types/database'
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo en http://localhost:3000

# Build
npm run build        # Compila el proyecto para producción

# Preview
npm run preview      # Previsualiza el build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
pqrsf-system-3/
├── public/                 # Archivos estáticos
│   ├── images/            # Imágenes del proyecto
│   └── icon.svg           # Favicon
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/           # Componentes UI (Radix UI)
│   │   ├── sidebar.tsx   # Sidebar principal
│   │   └── theme-provider.tsx
│   ├── contexts/         # Contextos de React
│   │   └── auth-context.tsx
│   ├── hooks/            # Hooks personalizados
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── lib/              # Utilidades y configuración
│   │   ├── api.ts        # Cliente HTTP centralizado
│   │   └── utils.ts      # Funciones utilitarias
│   ├── services/         # Servicios de API
│   │   ├── pqrsf.service.ts
│   │   ├── chat.service.ts
│   │   ├── user.service.ts
│   │   ├── area.service.ts
│   │   ├── catalog.service.ts
│   │   └── index.ts
│   ├── types/            # Tipos TypeScript
│   │   ├── database.ts   # Tipos basados en ERD
│   │   └── index.ts      # Tipos generales
│   ├── views/            # Páginas/Vistas
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── PQRSFList.tsx
│   │   ├── PQRSFDetail.tsx
│   │   └── ...
│   ├── App.tsx           # Componente raíz con rutas
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── .gitignore
├── components.json       # Configuración de componentes
├── eslint.config.js      # Configuración ESLint
├── index.html           # HTML base
├── package.json
├── postcss.config.mjs    # Configuración PostCSS
├── tsconfig.json        # Configuración TypeScript
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts        # Configuración Vite
```

## 🔌 Uso del Cliente API

El proyecto incluye un cliente HTTP centralizado ubicado en `src/lib/api.ts`.

### Importación

```typescript
import { api } from '@/lib/api'
import { HttpError } from '@/lib/api'
```

### Métodos Disponibles

```typescript
// GET
const users = await api.get<User[]>('/users')

// POST
const newUser = await api.post<User>('/users', {
  name: 'John',
  email: 'john@example.com'
})

// PUT
const updated = await api.put<User>(`/users/${id}`, {
  name: 'Jane'
})

// PATCH
const patched = await api.patch<User>(`/users/${id}`, {
  email: 'new@example.com'
})

// DELETE
await api.del(`/users/${id}`)
```

### Manejo de Errores

```typescript
import { api, HttpError } from '@/lib/api'

try {
  const data = await api.get('/users')
} catch (error) {
  if (error instanceof HttpError) {
    console.error('Status:', error.status)
    console.error('Message:', error.message)
    console.error('Data:', error.data)
  }
}
```

### Uso con Servicios

```typescript
import { pqrsfService } from '@/services'

// Obtener todos los PQRSF
const pqrsfs = await pqrsfService.getAll()

// Crear un nuevo PQRSF
const newPQRSF = await pqrsfService.create({
  radicado_code: 'PQRSF-2024-001',
  id_user: 1,
  id_type_pqrsf: 1,
  id_chat: 1,
  description: 'Descripción del caso'
})
```

## 🗄️ Estructura de la Base de Datos

El sistema está diseñado para trabajar con una base de datos relacional que incluye las siguientes entidades principales:

### Entidades Principales

- **PQRSF**: Gestión de solicitudes (Peticiones, Quejas, Reclamos, Sugerencias, Felicitaciones)
- **Chat**: Comunicación con clientes
- **Message**: Mensajes dentro de los chats
- **Users**: Usuarios del sistema
- **Area**: Áreas operativas
- **Responsible**: Responsables de área
- **PQRSF_analysis**: Análisis técnico de PQRSF
- **PQRSF_reanalysis**: Reanálisis y apelaciones
- **PQRSF_survey**: Encuestas de satisfacción

### Relaciones

- Un PQRSF pertenece a un Usuario
- Un PQRSF tiene un Chat asociado
- Un Chat tiene múltiples Mensajes
- Un PQRSF puede tener múltiples Análisis
- Un Responsable pertenece a un Área

Los tipos TypeScript completos están definidos en `src/types/database.ts` basados en el ERD.

## 💻 Desarrollo

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000` y se abrirá automáticamente en el navegador.

### Hot Module Replacement (HMR)

Vite incluye HMR por defecto, por lo que los cambios se reflejan instantáneamente sin recargar la página.

### Estructura de Rutas

Las rutas están definidas en `src/App.tsx`:

- `/` - Login
- `/dashboard` - Dashboard principal
- `/pqrsf` - Listado de PQRSF
- `/pqrsf/:id` - Detalle de PQRSF
- `/analisis-pendientes` - PQRSF pendientes de análisis
- `/apelaciones` - Apelaciones
- `/chats` - Sistema de chats
- `/usuarios` - Gestión de usuarios
- `/cargos` - Gestión de cargos
- Y más...

## 🏗️ Build y Despliegue

### Build de Producción

```bash
npm run build
```

Esto generará los archivos optimizados en la carpeta `dist/`.

### Preview del Build

```bash
npm run preview
```

Permite previsualizar el build de producción localmente.

### Variables de Entorno en Producción

Asegúrate de configurar `VITE_API_PROD` en tu plataforma de despliegue (Vercel, Netlify, etc.).

## 🔐 Autenticación

El sistema maneja la autenticación mediante:

- **Token JWT**: Almacenado en `localStorage` con la clave `"token"`
- **Usuario autenticado**: Almacenado en `localStorage` con la clave `"auth_user"`
- **Redirección automática**: En caso de error 401/403, redirige a login

### Roles Disponibles

- **Administrador**: Acceso completo al sistema
- **Usuario de Área Responsable**: Acceso limitado a su área asignada

## 📚 Documentación Adicional

- [README_API.md](./README_API.md) - Documentación detallada del cliente API
- [MIGRACION_VITE.md](./MIGRACION_VITE.md) - Guía de migración de Next.js a Vite (si aplica)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y propiedad de Campuslands.

## 👥 Equipo

Desarrollado para Campuslands - Sistema de Gestión PQRSF

---

**Nota**: Este proyecto requiere un backend API para funcionar completamente. Asegúrate de tener el backend configurado y corriendo antes de usar las funcionalidades que requieren conexión a la API.
