export interface AuthUser {
    id: number;
    name: string;
    email: string;
    user_type: string;
    permissions?: Array<{
        type: string;
        resource_id: number;
        resource_value: string | null;
        action: string;
      }>;
  }

  export interface MagicLinkAuthResponse {
    success: boolean;
    message: string;
    data?: {
      user: AuthUser;
      access_token: string;
      token_type: string;
      expires_at: string;
    };
  }