# BildyApp API

API REST para la gestión de albaranes entre clientes y proveedores, desarrollada con Node.js y Express.

## Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (WebSockets en tiempo real)
- Swagger/OpenAPI 3.0 (documentación)
- JWT (autenticación)
- Zod (validación de datos)
- pdfkit (generación de PDFs)
- Cloudinary (almacenamiento en la nube)
- Sharp (optimización de imágenes)
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Jest + Supertest (testing)
- Nodemailer + Mailtrap (emails)
- Slack Webhooks (logging de errores 5XX)

---

## Instalación y ejecución

### Requisitos previos

- Node.js 18+
- MongoDB (local o Atlas)
- npm

### Instalación

```bash
npm install
```

### Configuración

Copia `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
```

Variables requeridas:

```dotenv
MONGO_URI=mongodb://localhost:27017/bildyapp
JWT_SECRET=tu_clave_secreta_larga
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
SLACK_WEBHOOK_URL=                    # opcional
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=tu_usuario_mailtrap
MAIL_PASS=tu_password_mailtrap
PORT=3000
```

### Ejecución en desarrollo

```bash
npm run dev
```

### Ejecución en producción

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## Docker

Construye y levanta todos los servicios (app Node.js + MongoDB) con un solo comando:

```bash
docker compose up --build
```

Para ejecutar en segundo plano:

```bash
docker compose up --build -d
```

Para detener los contenedores:

```bash
docker compose down
```

---

## Tests

Ejecuta todos los tests:

```bash
npm test
```

Resultado actual: **72 tests, 72 passed** en 4 suites (user, client, project, deliverynote).

Covertura de tests:

```bash
npm run test:coverage
```

Los tests usan `mongodb-memory-server` por lo que no requieren una instancia de MongoDB real.

---

## Documentación API (Swagger)

Accede a la documentación interactiva en: `http://localhost:3000/api-docs`

---

## Cómo usar la API como cliente

Todos los endpoints excepto registro, login y validación de email requieren autenticación mediante JWT.

### 1. Registrar una cuenta

```http
POST /api/user/register
Content-Type: application/json
{
  "name": "Tu Nombre",
  "email": "tu@email.com",
  "password": "tupassword123"
}
```

Recibirás un email con un código de verificación de 6 dígitos.

### 2. Validar el email

```http
PUT /api/user/validation
Content-Type: application/json
{
  "email": "tu@email.com",
  "code": "123456"
}
```

Sin este paso no podrás hacer login.

### 3. Hacer login y obtener el token

```http
POST /api/user/login
Content-Type: application/json
{
  "email": "tu@email.com",
  "password": "tupassword123"
}
```

La respuesta incluye el token JWT:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Tu Nombre",
    "email": "tu@email.com"
  }
}
```

### 4. Crear tu compañía

Antes de poder crear clientes, proyectos o albaranes debes asociar una compañía a tu cuenta:

```http
PATCH /api/user/company
Authorization: Bearer <tu_token>
Content-Type: application/json
{
  "name": "Mi Empresa",
  "cif": "B12345678"
}
```

### 5. Usar el token en todas las peticiones

Incluye el token en la cabecera `Authorization`:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Autorizar en Swagger UI

1. Haz login desde `POST /api/user/login` dentro del propio Swagger.
2. Copia el valor del campo `token` de la respuesta.
3. Haz clic en el botón **Authorize** (candado) en la parte superior derecha.
4. Pega el token con el formato: `Bearer <tu_token>`
5. Haz clic en **Authorize** y cierra el diálogo.

---

## Endpoints principales

### Usuarios

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/user/register` | NO | Registro de usuario |
| PUT | `/api/user/validation` | NO | Validar email con código |
| POST | `/api/user/login` | NO | Login, devuelve JWT |
| GET | `/api/user` | SI | Obtener perfil propio |
| PUT | `/api/user` | SI | Actualizar datos personales |
| PATCH | `/api/user/company` | SI | Crear o actualizar compañía |
| PATCH | `/api/user/logo` | SI | Subir logo de compañía |
| DELETE | `/api/user` | SI | Eliminar cuenta (hard/soft) |

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/client` | Crear cliente |
| GET | `/api/client` | Listar clientes (paginación + filtros) |
| GET | `/api/client/:id` | Obtener cliente |
| PUT | `/api/client/:id` | Actualizar cliente |
| DELETE | `/api/client/:id` | Eliminar cliente (`?soft=true` para archivar) |
| GET | `/api/client/archived` | Listar archivados |
| PATCH | `/api/client/:id/restore` | Restaurar cliente archivado |

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/project` | Crear proyecto |
| GET | `/api/project` | Listar proyectos (paginación + filtros) |
| GET | `/api/project/:id` | Obtener proyecto |
| PUT | `/api/project/:id` | Actualizar proyecto |
| DELETE | `/api/project/:id` | Eliminar proyecto (`?soft=true` para archivar) |
| GET | `/api/project/archived` | Listar archivados |
| PATCH | `/api/project/:id/restore` | Restaurar proyecto archivado |

### Albaranes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/deliverynote` | Crear albarán (`format: "hours"` o `"material"`) |
| GET | `/api/deliverynote` | Listar albaranes (paginación + filtros) |
| GET | `/api/deliverynote/:id` | Obtener albarán (con datos poblados) |
| GET | `/api/deliverynote/pdf/:id` | Descargar albarán como PDF |
| PATCH | `/api/deliverynote/:id/sign` | Firmar albarán con imagen de firma |
| DELETE | `/api/deliverynote/:id` | Eliminar albarán (solo si no está firmado) |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor, DB y uptime |

---

## Health Check

```http
GET /health
```

Respuesta:

```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 123.45,
  "timestamp": "2026-05-07T01:00:00.000Z"
}
```

---

## Estructura del proyecto

```
bildyapp-api/
├── src/
│   ├── config/         # Configuración (DB, Swagger)
│   ├── controllers/    # Controladores MVC
│   ├── middleware/     # Auth, validación, upload, errores
│   ├── models/         # Modelos Mongoose
│   ├── routes/         # Rutas Express
│   ├── services/       # PDF, email, storage, logging Slack
│   ├── utils/          # AppError
│   ├── validators/     # Schemas Zod
│   ├── app.js          # Express + Socket.IO
│   └── index.js        # Punto de entrada
├── tests/
│   ├── setup.js
│   ├── user.test.js
│   ├── client.test.js
│   ├── project.test.js
│   └── deliverynote.test.js
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/test.yml
├── .env.example
├── jest.config.js
└── package.json
```

---

## Licencia

MIT