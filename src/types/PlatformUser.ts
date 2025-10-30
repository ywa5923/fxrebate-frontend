export interface PlatformUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlatformUserPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PlatformUserListResponse {
  success: boolean;
  data: PlatformUser[];
  pagination: PlatformUserPagination;
}


