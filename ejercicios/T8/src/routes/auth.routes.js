// src/routes/auth.routes.js
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Juan }
 *               email: { type: string, example: juan@ejemplo.com }
 *               password: { type: string, example: MiPassword123 }
 *     responses:
 *       201: { description: Usuario creado }
 *       400: { description: Email duplicado o datos inválidos }
 */
router.post('/register', registerCtrl);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: juan@ejemplo.com }
 *               password: { type: string, example: MiPassword123 }
 *     responses:
 *       201: { description: Login exitoso, devuelve token }
 *       401: { description: Credenciales inválidas }
 */
router.post('/login', loginCtrl);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil del usuario actual
 *     security:
 *       - BearerToken: []
 *     responses:
 *       200: { description: Datos del usuario }
 *       401: { description: No autenticado }
 */
router.get('/me', authMiddleware, getMeCtrl);