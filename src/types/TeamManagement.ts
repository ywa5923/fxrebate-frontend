export interface ResourcePermission {
  id: number;
  subject_type: string;
  subject_id: number;
  permission_type: string;
  resource_id: number;
  resource_value: string | null;
  action: string;
  metadata: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamUser {
  id: number;
  broker_team_id: number;
  name: string;
  email: string;
  is_active: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  resource_permissions: ResourcePermission[];
}

export interface BrokerTeam {
  id: number;
  broker_id: number;
  name: string;
  description: string;
  is_active: boolean;
  permissions: any[];
  created_at: string;
  updated_at: string;
  users: TeamUser[];
}

export interface BrokerDefaultTeamResponse {
  success: boolean;
  message: string;
  data: BrokerTeam;
}
