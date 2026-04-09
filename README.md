# Task Manager API

API REST lista para producción, construida con Node.js y Express. Implementa autenticación con JWT, refresh tokens, autorización por roles y CRUD completo de tareas.

## Demo en producción

URL base: `https://task-manager-api-n12m.onrender.com`

> Nota: alojada en el tier gratuito de Render. La primera solicitud puede tardar hasta 50 segundos si la instancia ha estado inactiva.

## Tecnologías

- **Node.js + Express** — servidor HTTP y enrutamiento
- **MongoDB Atlas + Mongoose** — base de datos en la nube y ODM
- **JWT + bcryptjs** — autenticación y hash de contraseñas
- **Zod** — validación de inputs y esquemas

## Funcionalidades

- Registro e inicio de sesión con contraseñas hasheadas
- Access token (15 min) + Refresh token (7 días)
- Blacklist de tokens al cerrar sesión para evitar reutilización
- Control de acceso por roles (user / admin)
- CRUD completo de tareas con protección por ownership
- Validación de inputs en todos los endpoints

## Estructura del proyecto
src/
├── config/         Conexión a la base de datos
├── controllers/    Manejadores de rutas
├── middlewares/    Verificación de autenticación y roles
├── models/         Esquemas de Mongoose
├── routes/         Routers de Express
├── schemas/        Esquemas de validación con Zod
└── services/       Lógica de negocio

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio
git clone https://github.com/JManu02/task-manager-api.git
cd task-manager-api

### 2. Instalar dependencias
npm install

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:
PORT=3000
MONGODB_URI=tu_uri_de_mongodb_atlas
JWT_SECRET=tu_secreto_jwt
JWT_REFRESH_SECRET=tu_secreto_refresh

### 4. Iniciar el servidor
npm run dev

## Endpoints

### Autenticación

| Método | Endpoint | Descripción | Requiere auth |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Registrar un nuevo usuario | No |
| POST | /api/auth/login | Iniciar sesión y obtener tokens | No |
| POST | /api/auth/refresh | Obtener nuevo access token | No |
| POST | /api/auth/logout | Invalidar refresh token | No |

### Tareas

| Método | Endpoint | Descripción | Requiere auth |
|--------|----------|-------------|---------------|
| GET | /api/tasks | Obtener tareas | Sí |
| GET | /api/tasks/:id | Obtener tarea por id | Sí |
| POST | /api/tasks | Crear una tarea | Sí |
| PUT | /api/tasks/:id | Actualizar una tarea | Sí |
| DELETE | /api/tasks/:id | Eliminar una tarea | Sí (solo admin) |

## Ejemplos de uso

### Registro
POST /api/auth/register
Content-Type: application/json
{
"name": "Jose",
"email": "jose@test.com",
"password": "123456"
}

### Inicio de sesión
POST /api/auth/login
Content-Type: application/json
{
"email": "jose@test.com",
"password": "123456"
}

### Crear una tarea
POST /api/tasks
Authorization: Bearer tu_access_token
Content-Type: application/json
{
"title": "Mi primera tarea",
"description": "Descripción de la tarea",
"status": "pending"
}

### Actualizar una tarea
PUT /api/tasks/:id
Authorization: Bearer tu_access_token
Content-Type: application/json
{
"status": "in-progress"
}

## Roles

| Rol | Permisos |
|-----|----------|
| user | Crear, leer y actualizar sus propias tareas |
| admin | Leer y eliminar todas las tareas |