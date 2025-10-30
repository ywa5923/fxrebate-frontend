import { z } from 'zod';

export const registerBrokerSchema = z.object({
  broker_type_id: z.number().int().positive('Broker type is required'),
  email: z.string().email('Valid email is required').max(255, 'Email too long'),
  trading_name: z.string().min(1, 'Trading name is required').max(255, 'Trading name too long'),
  country_id: z.number().int().positive('Country is required'),
});

export type RegisterBrokerFormData = z.infer<typeof registerBrokerSchema>;


