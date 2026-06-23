export interface DropdownList {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  options: DropdownListOption[];
  created_at: string | null;
  updated_at?: string | null;
}


export interface DropdownListOption {
  id?: number;
  label: string;
  value: string;
}

