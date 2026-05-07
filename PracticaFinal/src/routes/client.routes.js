const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const { createClientSchema, updateClientSchema } = require("../validators/client.validator");
const ctrl = require("../controllers/client.controller");

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management
 */

/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Create a client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Client"
 *     responses:
 *       201:
 *         description: Client created
 *       409:
 *         description: CIF already exists
 */

/**
 * @swagger
 * /api/client:
 *   get:
 *     summary: List all clients (paginated)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of clients
 */

/**
 * @swagger
 * /api/client/archived:
 *   get:
 *     summary: List archived clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived clients
 */

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Get a client by ID
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client data
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated client
 *   delete:
 *     summary: Delete or archive a client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Deleted or archived
 */

/**
 * @swagger
 * /api/client/{id}/restore:
 *   patch:
 *     summary: Restore an archived client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restored client
 */

router.use(auth);
router.post("/", validate(createClientSchema), ctrl.create);
router.put("/:id", validate(updateClientSchema), ctrl.update);
router.get("/archived", ctrl.listArchived);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.delete("/:id", ctrl.remove);
router.patch("/:id/restore", ctrl.restore);

module.exports = router;
