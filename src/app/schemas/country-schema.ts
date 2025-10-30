import { z } from 'zod';

// Zod schema for country validation (works for both client and server)
export const countrySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters'),
  country_code: z.string()
    .min(1, 'Country code is required')
    .max(100, 'Country code must not exceed 100 characters'),
  zone_id: z.number().int().positive('Zone is required'),
});

export type CountryFormData = z.infer<typeof countrySchema>;

