import { z } from 'zod';

export const platformUserRoles = [
  'global_admin',
  'country_admin',
  'broker_admin',
  'seo',
  'translator',
] as const;

export const platformUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters'),
  email: z.string().email('Valid email is required').max(255, 'Email must not exceed 255 characters'),
  role: z.enum(platformUserRoles, {
    errorMap: () => ({ message: 'Invalid role selected' })
  }),
  is_active: z.boolean().optional(),
});

export type PlatformUserFormData = z.infer<typeof platformUserSchema>;


