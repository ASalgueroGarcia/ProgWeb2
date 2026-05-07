const router = require("express").Router();
const auth   = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const { createDeliveryNoteSchema } = require("../validators/deliverynote.validator");
const ctrl = require("../controllers/deliverynote.controller");

/**
 * @swagger
 * tags:
 *   name: DeliveryNotes
 *   description: Delivery note management
 */

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Create a delivery note
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DeliveryNote"
 *     responses:
 *       201:
 *         description: Delivery note created
 *   get:
 *     summary: List delivery notes (paginated)
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery notes
 */

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Download delivery note as PDF
 *     tags: [DeliveryNotes]
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
 *         description: PDF file
 */

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Get a delivery note by ID
 *     tags: [DeliveryNotes]
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
 *         description: Delivery note data
 *   delete:
 *     summary: Delete a delivery note (only if unsigned)
 *     tags: [DeliveryNotes]
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
 *         description: Deleted
 *       403:
 *         description: Cannot delete a signed delivery note
 */

/**
 * @swagger
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     summary: Sign a delivery note with an image
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Signed delivery note
 */

router.use(auth);
router.post("/", validate(createDeliveryNoteSchema), ctrl.create);
router.get("/pdf/:id", ctrl.getPdf);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.patch("/:id/sign", upload.single("file"), ctrl.sign);
router.delete("/:id", ctrl.remove);

module.exports = router;