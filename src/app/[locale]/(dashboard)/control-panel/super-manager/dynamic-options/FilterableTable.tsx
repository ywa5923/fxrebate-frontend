
// export type FTRowValue = string | boolean | number | null | undefined;


// export interface FTRowData{
//     [key: string]: FTRowValue;
// }

export type FTRowData<T = string | boolean | number | null | undefined> = Record<string, T>;

export interface FTPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  }
  export interface FTColumnConfig{
    label: string;
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
  value: string|number;
}
  export interface FTFilterType {
    type: "text" | "select";
    tooltip?: string;
    options?: FTSelectOption[];
  }

  export type FTFilters<T>={
    [K in keyof T]?: FTFilterType;
  }

  //export type FTFilters<T> = Partial<Record<keyof T, string | boolean>>;
  
export interface FTData<T> {
  data: T[];
  pagination: FTPagination;
  columnsConfig: FTColumnsConfig<T>[];
  filters: FTFilters<T>;
}

export default function FilterableTable<T>({ data, pagination, columnsConfig,filters}: FTData<T>) {
  return (
    <div></div>
  );
}