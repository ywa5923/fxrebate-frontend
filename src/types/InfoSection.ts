export interface InfoSection {
  id: number;
  title: string;
  subtitle: string|null;
  description: string|null;
  order: number;
  items: InfoSectionItem[];
  published: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InfoSectionItem {
  id: number;
  title: string;
  subtitle: string|null;
  description: string|null;
  order: number;
  published: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}