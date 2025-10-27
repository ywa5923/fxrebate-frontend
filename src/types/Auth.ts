export interface AuthUser {
    id: number;
    name: string;
    email: string;
    user_type: string;
    broker_context?: BrokerContext;
    permissions?: Array<Permission>
  }

  export interface BrokerContext {
    broker_id: number;
    broker_name?: string | null;
    team_id: number;
    team_name: string;
  }

  export interface BrokerInfoResponse {
    success: boolean;
    message: string;
    data: BrokerInfo;
  }

  export interface BrokerInfo {
    broker_id: number;
    broker_trading_name?: string|null;
    country_id:number;
    country_code:string;
    zone_id:number;
    zone_code:string;
  }


  export interface Permission {
    type: string;
    resource_id: number;
    resource_value: string | null;
    action: string;
  }

  export interface AuthUserResponse {
    success: boolean;
    message: string;
    user: AuthUser;
  }

  export interface MagicLinkAuthResponse {
    success: boolean;
    message: string;
    data?: {
      user: AuthUser;
      broker_context?: BrokerContext;
      access_token: string;
      token_type: string;
      expires_at: string;
    };
  }