const { z } = require("zod");

const createProjectSchema = z.object({
  name:        z.string().min(1, "Name is required"),
  projectCode: z.string().min(1, "Project code is required"),
  client:      z.string().min(1, "Client is required"),
  email:       z.string().email().optional(),
  notes:       z.string().optional(),
  active:      z.boolean().optional(),
  address: z.object({
    street: z.string().optional(), number: z.string().optional(),
    postal: z.string().optional(), city: z.string().optional(), province: z.string().optional()
  }).optional()
});

const updateProjectSchema = z.object({
  name:        z.string().min(1).optional(),
  projectCode: z.string().min(1).optional(),
  client:      z.string().min(1).optional(),
  email:       z.string().email().optional(),
  notes:       z.string().optional(),
  active:      z.boolean().optional(),
  address: z.object({
    street: z.string().optional(), number: z.string().optional(),
    postal: z.string().optional(), city: z.string().optional(), province: z.string().optional()
  }).optional()
});

module.exports = { createProjectSchema, updateProjectSchema };
