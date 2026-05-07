const router = require("express").Router();
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth.middleware");
const { registerSchema, loginSchema, updatePersonalSchema, updateCompanySchema } = require("../validators/user.validator");
const ctrl = require("../controllers/user.controller");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
 *     responses:
 *       201:
 *         description: User registered
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /api/user/validation:
 *   put:
 *     summary: Validate email with code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               code: { type: string }
 *     responses:
 *       200:
 *         description: Email validated
 */

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

router.post("/register", validate(registerSchema), ctrl.register);
router.put("/validation", ctrl.validateEmail);
router.post("/login", validate(loginSchema), ctrl.login);

router.use(auth);

router.get("/", ctrl.getMe);
router.put("/", validate(updatePersonalSchema), ctrl.updatePersonal);
router.patch("/company", validate(updateCompanySchema), ctrl.updateCompany);
router.patch("/logo", upload.single("logo"), ctrl.uploadLogo);
router.delete("/", ctrl.deleteAccount);

module.exports = router;