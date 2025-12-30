export interface DropdownList {
  id: number;
  name: string;
  slug: string;
  description: string;
  options: string;
  created_at: string | null;
  updated_at?: string | null;
}


// export interface DropdownListOption {
//   id: number;
//   label: string;
//   value: string;
//   order: number;
// }

// export interface DropdownList {
//   id: number;
//   name: string;
//   slug: string;
//   description: string | null;
//   options: DropdownListOption[];
//   created_at?: string | null;
//   updated_at?: string | null;
// }

// export interface DropdownListPagination {
//   current_page: number;
//   last_page: number;
//   per_page: number;
//   total: number;
//   from: number;
//   to: number;
// }

// export interface DropdownListListResponse {
//   success: boolean;
//   data: DropdownList[];
//   pagination: DropdownListPagination;
// }

// export interface DropdownListFilters {
//   name?: string;
//   slug?: string;
//   description?: string;
// }


