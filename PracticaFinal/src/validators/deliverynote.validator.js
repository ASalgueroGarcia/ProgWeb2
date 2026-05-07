const { z } = require("zod");

const createDeliveryNoteSchema = z.object({
  client:      z.string().min(1, "Client is required"),
  project:     z.string().min(1, "Project is required"),
  format:      z.enum(["material", "hours"]),
  description: z.string().optional(),
  workDate:    z.string().min(1, "Work date is required"),
  material:    z.string().optional(),
  quantity:    z.number().optional(),
  unit:        z.string().optional(),
  hours:       z.number().optional(),
  workers:     z.array(z.object({ name: z.string(), hours: z.number() })).optional()
});

module.exports = { createDeliveryNoteSchema };
