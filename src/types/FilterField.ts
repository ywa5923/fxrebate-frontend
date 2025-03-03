import { FilterOption } from "./FilterOption";
export type FilterField = {
    field: string;
    name: string;
    type: 'checkbox' | 'radio' | 'rating';
    expanded: boolean;
    headless?: boolean;
    options: FilterOption[]; // Only for fields with predefined options
  };