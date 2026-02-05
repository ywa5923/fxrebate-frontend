import { z } from 'zod';

export const BrokerInfoSchema = z.object({
    broker_id: z.number(),
    broker_type: z.string(),
    broker_trading_name: z.string().nullable(),
    country_id: z.number(),
    country_code: z.string(),
    zone_id: z.number(),
    zone_code: z.string(),
  });
export type BrokerInfo = z.infer<typeof BrokerInfoSchema>;

export const PermissionSchema = z.object({
    type: z.string(),
    action: z.string(),
    resource_id: z.number(),
    resource_value: z.string().nullable(),
  });

export type Permission = z.infer<typeof PermissionSchema>;

export const BrokerContextSchema = z.object({
    broker_id: z.number(),
    broker_name: z.string(),
    broker_type: z.string(),
    broker_country: z.string(),
    team_id: z.number(),
    team_name: z.string(),
  });
export type BrokerContext = z.infer<typeof BrokerContextSchema>;

export const AuthUserSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    user_type: z.string(),
    role: z.string().nullable().optional(),
    permissions: z.array(PermissionSchema),
    broker_context: BrokerContextSchema.optional(),
  });
export type AuthUser = z.infer<typeof AuthUserSchema>;

