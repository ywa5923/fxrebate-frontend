"use client"
import {useEffect, useState,useRef} from "react"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { MixerHorizontalIcon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import {ColumnDef} from "@tanstack/react-table";
import { Button } from "@/components/ui/button"
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTableViewOptionsProps } from "./TopTable"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"



export default function ColumnsSelector<TData>({
  table,
  columnNames,
  defaultLoadedColumns
}: {
  table: Table<TData>,
  columnNames:Record<string,string>,
  defaultLoadedColumns?:Array<string>
}) {

   //let staticColumns=['home_url','user_rating','account_type','trading_name','overall_rating','support_options','account_currencies','trading_instruments'];
   let staticColumns=Object.keys(defaultLoadedColumns)
  
   let brokerColumns=Object.keys( columnNames)
   const [checkedColumns,setCheckedColumns]=useState(staticColumns)
   const searchParams = useSearchParams();
   const pathname = usePathname();
   const { replace } = useRouter();
   
   const [firstRender, setFirstRender] = useState(true);
  

    useEffect(()=>{
     
      if (firstRender) {
        setFirstRender(false);
        return;
      }

      const params = new URLSearchParams(searchParams);
      let columns=params.get("columns");
     
      if( checkedColumns.length==0 ){
        params.delete("columns")

      }else{
        params.set("columns",checkedColumns.toString())
     
      }
      replace(`${pathname}?${params.toString()}`);
        
    
    },[checkedColumns])

    useEffect(()=>{
      const params = new URLSearchParams(searchParams);
     let columns=params.get("columns")
     if(columns){
      setCheckedColumns(columns.split(","))
     }
    },[])
    // let tableColumns:ColumnDef<TData>[]=table
    //   .getAllColumns()
    //   .filter(
    //     (column) =>
    //       typeof column.accessorFn !== "undefined" && column.getCanHide()
    //   );

   //console.log("table columns",tableColumns);
   
  return (
    <>
   
  
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto  h-8 lg:flex"
        >
          {/* removed class hidden from above */}
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
        </Button>
        
      </DropdownMenuTrigger>
     
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]  rounded-md border ">
        {brokerColumns.map((brokerColumn,index)=>{

           // let isChecked=tableColumns.find((column)=>column.id===brokerColumn)?true:false
           if(brokerColumn=='home_url' || brokerColumn=='logo' || brokerColumn=='trading_name') return;
            let col=checkedColumns.find((c)=>c===brokerColumn)
            let checkedValue=col?true:false
            
            return (
                <DropdownMenuCheckboxItem
                  key={index}
                  className="capitalize"
                  checked={checkedValue}
                  onSelect={(e) => {
                    e.preventDefault()
  
                
                }}
                  onCheckedChange={(value) => {
                  
                      setCheckedColumns((prev)=>{
                        
                        let found=prev.find((item,index)=>{
                          if(item===brokerColumn){
                            prev.splice(index,1)
                            return true
                          }
                        })

                       // if unchecked all columns, get default static colums and mark them as selected
                        if(prev.length==0){
                          prev=staticColumns;
                        }
                    
                        return (found)?[...prev]:[...prev,brokerColumn]
                
                      });
            
                  
                  }}
                >
                  {columnNames[brokerColumn]}
                </DropdownMenuCheckboxItem>
              )
        })}
</ScrollArea>

      </DropdownMenuContent>
      
    </DropdownMenu>

    </>
    
  )
}
