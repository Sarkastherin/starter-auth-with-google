# Starter Auth Monorepo 🔐

Este repositorio contiene un sistema de autenticación completo, moderno y seguro, estructurado como un monorepo dividido en dos áreas independientes de responsabilidad: un backend de alto rendimiento y un frontend reactivo.

## 🚀 Arquitectura del Proyecto

El proyecto está organizado en dos carpetas principales dentro de la raíz:
```
├── backend/          # API REST con Fastify, TypeScript y Drizzle ORM
└── frontend/         # Interfaz de usuario con React, TypeScript y Tailwind CSS
```

## 🛠️ Tecnologías Utilizadas

### Backend
* **Fastify:** Framework web veloz y de bajo overhead para Node.js.
* **TypeScript:** Tipado estático para asegurar la consistencia del código.
* **Drizzle ORM & PostgreSQL:** Modelado de base de datos relacional eficiente y seguro con transacciones.
* **Fastify JWT & Cookies:** Manejo de sesiones seguras mediante cookies `httpOnly`.

### Frontend
* **React & TypeScript:** Construcción de interfaces basadas en componentes tipados.
* **React Hook Form:** Gestión eficiente, óptima y reactiva de formularios con validación.
* **Tailwind CSS & Flowbite:** Estilizado moderno, rápido y adaptativo.
* **React Router:** Gestión de rutas protegidas y flujos de navegación en el cliente.

---

## 🔑 Características del Sistema de Autenticación

El sistema implementa un ciclo de autenticación híbrido y robusto:

1. **Autenticación Local (Email/Password):**
   * Registro con validación de esquemas (Zod).
   * Hasheo seguro de contraseñas.
   * Flujo de verificación de cuenta mediante tokens por correo electrónico (expiración de 24 horas).
   * Capacidad de reenvío de enlaces de activación.

2. **Autenticación OAuth (Google):**
   * Inicio de sesión en un clic redirigiendo a la pantalla de consentimiento de Google.
   * Intercambio seguro de códigos por tokens de acceso en el servidor.
   * **Unificación de Identidades:** Si un usuario registrado de forma local inicia sesión con Google usando el mismo email, el sistema vincula automáticamente ambas cuentas en la base de datos sin duplicar perfiles.

3. **Seguridad y Sesiones:**
   * Middleware de autorización global para rutas protegidas (`/me`, `/dashboard`, etc.).
   * Sesiones gestionadas a través de cookies cifradas no accesibles desde JavaScript (`httpOnly`).

---

## ⚙️ Configuración del Entorno (Variables de Entorno)

Para correr el proyecto localmente, debes crear los archivos `.env` en cada sección correspondiente:

### En `/backend/.env`
```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@localhost:5432/tu_base_de_datos
JWT_SECRET=tu_clave_secreta_super_segura
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=tu_client_id_de_google_cloud
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google_cloud
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```
### En /frontend/.env
```env
VITE_API_URL=http://localhost:3000/api
```

