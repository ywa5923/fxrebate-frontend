export interface UserPermission {
  id: number;
  subject_type: string;
  subject_id: number;
  subject?: {
    id: number;
    name: string;
    email: string;
  };
  permission_type: string;
  resource_id: number | null;
  resource_value: string | null;
  action: string;
  metadata: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserPermissionPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface UserPermissionListResponse {
  success: boolean;
  data: UserPermission[];
  pagination: UserPermissionPagination;
}

export interface UserPermissionFilters {
  subject_type?: string;
  subject_id?: string;
  permission_type?: string;
  resource_id?: string;
  resource_value?: string;
  action?: string;
  subject?: string;
  is_active?: string; // '1' | '0'
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}


