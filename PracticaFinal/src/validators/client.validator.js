const { z } = require("zod");

const createClientSchema = z.object({
  name:    z.string().min(1, "Name is required"),
  cif:     z.string().min(1, "CIF is required"),
  email:   z.string().email().optional(),
  phone:   z.string().optional(),
  address: z.object({
    street: z.string().optional(), number: z.string().optional(),
    postal: z.string().optional(), city: z.string().optional(), province: z.string().optional()
  }).optional()
});

const updateClientSchema = z.object({
  name:    z.string().min(1).optional(),
  cif:     z.string().min(1).optional(),
  email:   z.string().email().optional(),
  phone:   z.string().optional(),
  address: z.object({
    street: z.string().optional(), number: z.string().optional(),
    postal: z.string().optional(), city: z.string().optional(), province: z.string().optional()
  }).optional()
});

module.exports = { createClientSchema, updateClientSchema };
