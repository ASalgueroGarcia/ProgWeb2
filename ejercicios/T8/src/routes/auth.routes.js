// src/routes/auth.routes.js

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrar nuevo usuario
 *     description: Crea una cuenta de usuario y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       409:
 *         description: El email ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validate(registerSchema), registerCtrl);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validate(loginSchema), loginCtrl);

/**
 * @openapi
 * /api/tracks/{id}:
 *   get:
 *     tags:
 *       - Tracks
 *     summary: Obtener track por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del track (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Track encontrado
 *       404:
 *         description: Track no encontrado
 */
router.get('/:id', getTrack);

/**
 * @openapi
 * /api/tracks/{id}:
 *   get:
 *     tags:
 *       - Tracks
 *     summary: Obtener track por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del track (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Track encontrado
 *       404:
 *         description: Track no encontrado
 */
router.get('/:id', getTrack);