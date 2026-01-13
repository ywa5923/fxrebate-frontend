import { XFormDefinition } from "@/types";

export type FTRowData<
  T = string | boolean | number | null | undefined
> = Record<string, T>;

export interface FTPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
export interface FTColumnConfig {
  label: string;
  type: string;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
}
export type FTColumnsConfig<T> = {
  [K in keyof T]: FTColumnConfig;
};

// type FTColumnsStates<T> = Partial<Record<keyof T, FTColumnState>>;
export type FTSelectOption = {
  label: string;
  value: string | number;
};
export interface FTFilterType {
  type: "text" | "select";
  label: string;
  tooltip?: string;
  options?: FTSelectOption[];
  placeholder?: string;
}

export type FTFilters<T> = {
  [K in keyof T]?: FTFilterType;
};

//export type FTFilters<T> = Partial<Record<keyof T, string | boolean>>;

export interface FTProps<T extends { id: number | string }> {
  data: T[];
  propertyNameToDisplay: string;
  pagination: FTPagination;
  columnsConfig: FTColumnsConfig<T>;
  filters: FTFilters<T>;
  LOCAL_STORAGE_KEY: string;
  formConfig?: XFormDefinition;
  getItemUrl?: string;
  deleteUrl?: string;
  updateItemUrl?: string;
  toggleActiveUrl?: string;
  dashboardUrl?: string;
}