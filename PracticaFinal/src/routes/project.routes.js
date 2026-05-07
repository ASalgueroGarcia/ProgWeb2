const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const { createProjectSchema, updateProjectSchema } = require("../validators/project.validator");
const ctrl = require("../controllers/project.controller");

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management
 */

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Project"
 *     responses:
 *       201:
 *         description: Project created
 *       409:
 *         description: Project code already exists
 *   get:
 *     summary: List all projects (paginated)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */

/**
 * @swagger
 * /api/project/archived:
 *   get:
 *     summary: List archived projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived projects
 */

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
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
 *         description: Project data
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
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
 *         description: Updated project
 *   delete:
 *     summary: Delete or archive a project
 *     tags: [Projects]
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
 * /api/project/{id}/restore:
 *   patch:
 *     summary: Restore an archived project
 *     tags: [Projects]
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
 *         description: Restored project
 */

router.use(auth);
router.post("/", validate(createProjectSchema), ctrl.create);
router.put("/:id", validate(updateProjectSchema), ctrl.update);
router.get("/archived", ctrl.listArchived);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.delete("/:id", ctrl.remove);
router.patch("/:id/restore", ctrl.restore);

module.exports = router;
