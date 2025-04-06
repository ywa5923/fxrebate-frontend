import React from "react";
import SearchTable from "./SearchTable";
import ColumnsSelector from "./ColumnsSelector";
import { Table } from "@tanstack/react-table";

import { ModalFilter } from "./ModalFilter";

export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export default function TopTable<TData>({
  table,
  columnNames,
  filters,
  defaultLoadedColumns
}: {
  table:Table<TData>,
  columnNames:Record<string,string>,
  filters?:any,
  defaultLoadedColumns?:Array<string>
}) {
 
  return (
    <>
      <div className="w-full">
        <div className="flex  items-center py-2">
          <SearchTable />
          <ModalFilter filters={filters} />
          
          <ColumnsSelector table={table} columnNames={columnNames} defaultLoadedColumns={defaultLoadedColumns}/>
        </div>
      </div>
    </>
  );
}
