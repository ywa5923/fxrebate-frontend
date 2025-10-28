import { z } from 'zod';

// Zod schema for zone validation (works for both client and server)
export const zoneSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  zone_code: z.string()
    .min(2, 'Zone code must be at least 2 characters')
    .max(10, 'Zone code must not exceed 10 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional().or(z.literal('')),
});

export type ZoneFormData = z.infer<typeof zoneSchema>;

export const ZoneDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  zone_code: z.string(),
  description: z.string().nullable(),
  countries: z.string().nullable(),
  countries_count: z.number(),
  brokers_count: z.number(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type Zone = z.infer<typeof ZoneDataSchema>;

