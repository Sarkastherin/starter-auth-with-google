# Starter Auth Monorepo

Repositorio base para arrancar proyectos con autenticación lista (email/password + Google OAuth). Cloná, instalá, y comenzá sobre esta base.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (para PostgreSQL)
- Una cuenta de [Google Cloud Console](https://console.cloud.google.com/) (para OAuth)
- (Opcional) Cuenta de [Mailtrap](https://mailtrap.io/) para pruebas de email

## Inicialización del proyecto

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repo-url>
cd starter-auth

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Levantar PostgreSQL con Docker

```bash
cd backend
docker-compose up -d
```

Esto levanta PostgreSQL 17 en el puerto `5433` con la base `starter_auth`.

> Si ya tenés un contenedor viejo, ejecutá primero `docker-compose down -v` para limpiar volúmenes y que se cree la base limpio.

### 3. Crear archivos de entorno

#### `backend/.env`

```env
DATABASE_URL=postgresql://postgres:123456789@127.0.0.1:5433/starter_auth
JWT_SECRET=tu_jwt_secret
COOKIE_SECRET=tu_cookie_secret
NODE_ENV='development'
PORT=4000
MIN_SESSION_DURATION=1
MAX_SESSION_DURATION=30

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_smtp_user
SMTP_PASS=tu_smtp_pass
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

#### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000
```

### 4. Aplicar migraciones de la base de datos

```bash
cd backend
npx drizzle-kit generate
npx drizzle-kit migrate
```

Esto crea las tablas `users` y `auth_accounts` en PostgreSQL.

### 5. Arrancar el proyecto

En dos terminales separadas:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Backend:** http://localhost:4000
- **Frontend:** http://localhost:5173

## Configuración de Google OAuth

1. Ir a [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Crear una **OAuth 2.0 Client ID** (tipo Web Application)
3. En **Authorized redirect URIs** agregar:
   ```
   http://localhost:4000/api/auth/google/callback
   ```
4. Copiar el **Client ID** y **Client Secret** en tu `backend/.env`

## Arquitectura del proyecto

```
├── backend/          # API REST con Fastify, TypeScript y Drizzle ORM
│   ├── src/
│   │   ├── db/           # Conexión a BD y esquemas
│   │   ├── routes/       # Rutas de autenticación
│   │   ├── services/     # Lógica de negocio (auth, email)
│   │   ├── middlewares/  # Middleware de autorización JWT
│   │   └── types/        # Tipos TypeScript
│   └── docker-compose.yml
└── frontend/         # React + React Router v7 + Tailwind CSS
    └── app/
        ├── routes/       # Páginas (login, register, dashboard, etc.)
        ├── context/      # AuthContext (estado de sesión)
        ├── layouts/      # Route guards (público/protégido)
        └── components/   # Componentes reutilizables
```

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Fastify, TypeScript, Drizzle ORM, PostgreSQL |
| Frontend | React 19, React Router v7, Tailwind CSS, Flowbite |
| Auth | JWT (httpOnly cookies), Argon2, Google OAuth 2.0 |
| Infra | Docker, Nodemailer (SMTP) |

## Funcionalidades de auth

- **Registro** con validación (Zod) y verificación por email
- **Login** con email/password (recordar sesión 1h o 30 días)
- **Google OAuth** con vinculación automática de cuentas existentes
- **Recuperación de contraseña** por email (token de 15 min)
- **Rutas protegidas** con middleware JWT
