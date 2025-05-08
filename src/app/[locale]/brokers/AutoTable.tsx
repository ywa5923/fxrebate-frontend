"use client"
import * as React from "react"
import {useEffect} from "react"
import TopTable from "./TopTable"
import { ArrowUpDown} from "lucide-react"
import {Button} from "@/components/ui/button"
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Link from "next/link"
import { CheckCircledIcon,CrossCircledIcon } from "@radix-ui/react-icons"
import { RatingComponent } from "./RatingComponent"
import { RatingDisplay } from "./RatingDisplay"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"




interface DataTableProps<TData, TValue> {
  data: TData[],
  columnNames:Record<string,string>,
  filters?:any,
  defaultLoadedColumns?:Record<string,string>,
  allowSortingOptions:Record<string,string>,
  booleanOptions:Array<string>,
  ratingOptions:Array<string>
}
//  columns: ColumnDef<TData, TValue>[]
export function AutoTable<TData, TValue>({
  data,
  columnNames,
  filters,
  defaultLoadedColumns,
  allowSortingOptions,
  booleanOptions,
  ratingOptions
}: DataTableProps<TData, TValue>) {

  
 // let sortableKeys:Array<string>=Object.keys(columnNames);
  let sortableKeys:Array<string>=Object.keys( allowSortingOptions);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(()=>{
   
    
  },[])

 
  const params = new URLSearchParams(searchParams);
   let columnsURL=params.get("columns")
   //let tableColumns=(columnsURL)?columnsURL.split(","):Object.keys(data[0] as {})
   let tableColumns=(data.length>0)?Object.keys(data[0] as {}):[]
   let columns:ColumnDef<TData>[]= tableColumns.map((key:string):ColumnDef<TData>=>{
        return {
          accessorKey: key,
          header: ({ column }) => {
            if(sortableKeys.includes(key)){
              return (
                <Button
                  variant="ghost"
                  onClick={() => {
                    column.toggleSorting(column.getIsSorted() === "asc")
                    const params = new URLSearchParams(searchParams);

                    params.set('sortBy', key);
                    params.set('sortOrder', (column.getIsSorted() === "asc")?"desc":"asc");
                    params.delete("page");
                    replace(`${pathname}?${params.toString()}`);
                  }}
                >
                  {columnNames[key]?columnNames[key]:key}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )
            }else{
              return (
                <>{columnNames[key]?columnNames[key]:key}</>
              )
            }
            
        }
      }
    })
  
  const [sorting, setSorting] = React.useState<SortingState>([])

  useEffect(()=>{
   // console.log("sorting",sorting)
  },[sorting])

  

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    }
  })

  return (
    <>
    <TopTable table={table} columnNames={columnNames} filters={filters} defaultLoadedColumns={defaultLoadedColumns}/>
    <div className="rounded-md border">
     
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {

                  let cellValue=cell.getValue()
                  const regex = /<a href="([^"]+)">([^<]+)<\/a>/;
                  const match=cellValue.match(regex)

                  //if cell value contains a link in the form <a href="url">text</a>
                  //grab the url and text and create a link with Link component
                  if(match){
                   let href = match[1];
                  //   href=(href)?href:"#"
                     const content = match[2];
                  return (<TableCell key={cell.id} className="text-center">
                     <Link href={href as string} target="_blank">
                            {content}
                          </Link>
                  </TableCell>)
                        
                      
                  }else if (/(https?:\/\/)/.test(cell.getValue())) {
                  //if the cell value contain one or more urls in the form: UrlText http://example.com;UrlText2 http://example.com2
                  //split the string by ; and create a Link for each url 
                
                
                  let urlsText = cell.getValue().split(";");


              
                 let links= urlsText.map((urlText,index) => {

                    let httpIndex=urlText.indexOf("http");
                    if (httpIndex !== -1) {
                      let name = urlText.substring(0, httpIndex);
                      let url = urlText.substring(httpIndex);
                      return (
                        <React.Fragment key={index + 10023}>
                          <Link  href={url as string} target="_blank">
                            {name}
                          </Link><br/>
                          </React.Fragment>
                      );
                    }else{
                      return urlText
                        
                    }
                   
              
                    
                  });

                 return (<TableCell key={cell.id} className="text-center">{links}</TableCell>)
                }else if(booleanOptions.includes(cell.column.columnDef.accessorKey)){
                  //booleanOptionsSlugs.includes(cell.column.columnDef.accessorKey)
                  let cellValue=cell.getValue()?(<CheckCircledIcon style={{ width: '24px', height: '24px',color:"green",  margin:'0 auto'}}  />):(<CrossCircledIcon style={{ width: '24px', height: '24px',color:"red", margin:'0 auto' }}  />);
                  return(<TableCell key={cell.id} className="text-center" > 
                    {cellValue}
                  </TableCell>)
                 }else if(ratingOptions.includes(cell.column.columnDef.accessorKey)){
                 
                  let cellValue=parseFloat(cell.getValue() as string);
               
                  return(<TableCell key={cell.id} className="text-center" > 
                        <RatingComponent
                        value={cellValue} 
                         />
                  </TableCell>)
                 }
                
                
                  return (<TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                   </TableCell>)
                 
                  
})}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </>
  )
}
