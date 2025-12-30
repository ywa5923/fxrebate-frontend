type Email = `${string}@${string}.${string}`;
type Subject = `${string} (${Email})`;

export interface UserPermission {
  id: number;
  subject_type: string;
  subject_id: number;
  subject?: Subject;
  permission_type: string;
  resource_id: number | null;
  resource_value: string | null;
  action: string;
  metadata: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}




