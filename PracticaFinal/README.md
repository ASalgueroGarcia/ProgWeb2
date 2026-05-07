# BildyApp API

API REST para la gestión de albaranes entre clientes y proveedores.

## Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (WebSockets)
- Swagger/OpenAPI 3.0
- JWT (autenticación)
- pdfkit (generación de PDFs)
- Cloudinary (almacenamiento en la nube)
- Sharp (optimización de imágenes)
- Docker + Docker Compose
- Jest + Supertest (testing)

## Instalación

```bash
npm install
```

## Configuración

Copia `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
```

Variables requeridas:
- `MONGO_URI` - URI de MongoDB
- `JWT_SECRET` - Clave secreta para JWT
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Credenciales de Cloudinary
- `SLACK_WEBHOOK_URL` - Webhook para notificaciones de errores (opcional)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` - Configuración de email (opcional)

## Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

## Docker

Construye y levanta todos los servicios (app Node.js + MongoDB):

```bash
docker compose up --build
```

Para ejecutar en segundo plano:

```bash
docker compose up --build -d
```

La aplicación estará disponible en `http://localhost:3000`

## Tests

```bash
npm test
```

Resultado actual: **72 tests, 72 passed** en 4 suites (user, client, project, deliverynote).

Cobertura de tests:

```bash
npm run test:coverage
```

## Documentación API

Accede a la documentación Swagger en: `http://localhost:3000/api-docs`

> Si la aplicación está desplegada, la documentación estará disponible en la URL del despliegue + `/api-docs`.

---

## Cómo usar la API como cliente

Todos los endpoints excepto registro, login y validación de email requieren autenticación mediante JWT. A continuación se describe el flujo completo para empezar a usar la API.

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

### 4. Usar el token en todas las peticiones

Incluye el token en la cabecera `Authorization` de cada petición:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Por ejemplo, para listar tus clientes:

```http
GET /api/client
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Autorizar en Swagger UI

Si usas la documentación interactiva en `/api-docs`:

1. Haz login desde `POST /api/user/login` dentro del propio Swagger.
2. Copia el valor del campo `token` de la respuesta.
3. Haz clic en el botón **Authorize** (candado) en la parte superior derecha.
4. Pega el token en el campo `Value` con el formato: `Bearer <tu_token>`
5. Haz clic en **Authorize** y cierra el diálogo.

A partir de ese momento todas las peticiones desde Swagger incluirán el token automáticamente.

> El token tiene una validez de **7 días**. Pasado ese tiempo deberás hacer login de nuevo para obtener uno nuevo.

---

## Endpoints principales

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/user/register` | Registro de usuario |
| POST | `/api/user/login` | Login |
| PUT | `/api/user/validation` | Validar email |

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/client` | Crear cliente |
| GET | `/api/client` | Listar clientes (paginación, filtros) |
| GET | `/api/client/:id` | Obtener cliente |
| PUT | `/api/client/:id` | Actualizar cliente |
| DELETE | `/api/client/:id` | Eliminar cliente |
| GET | `/api/client/archived` | Listar archivados |
| PATCH | `/api/client/:id/restore` | Restaurar |

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/project` | Crear proyecto |
| GET | `/api/project` | Listar proyectos |
| GET | `/api/project/:id` | Obtener proyecto |
| PUT | `/api/project/:id` | Actualizar proyecto |
| DELETE | `/api/project/:id` | Eliminar proyecto |
| GET | `/api/project/archived` | Listar archivados |
| PATCH | `/api/project/:id/restore` | Restaurar |

### Albaranes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/deliverynote` | Crear albarán |
| GET | `/api/deliverynote` | Listar albaranes |
| GET | `/api/deliverynote/:id` | Obtener albarán |
| GET | `/api/deliverynote/pdf/:id` | Descargar PDF |
| PATCH | `/api/deliverynote/:id/sign` | Firmar albarán |
| DELETE | `/api/deliverynote/:id` | Eliminar (solo sin firmar) |

## Health Check

```bash
GET /health
```

## Estructura del proyecto

```
src/
├── config/         # Configuración (DB, Swagger)
├── controllers/    # Controladores MVC
├── middleware/     # Auth, validación, upload, errores
├── models/         # Modelos Mongoose
├── routes/         # Rutas Express
├── services/       # Servicios (PDF, email, storage, logging)
├── utils/          # Utilidades (AppError)
├── validators/     # Schemas Zod
├── app.js          # Configuración Express + Socket.IO
└── index.js        # Punto de entrada
```

## Licencia

MIT