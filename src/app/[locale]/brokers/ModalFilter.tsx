"use client";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogOverlay
} from "@/components/ui/dialog"
import { useRef } from "react";


import { FilterForm } from "./FilterForm";

import {TriangleDownIcon} from "@radix-ui/react-icons";

export function ModalFilter({filters}:{filters:any}) {

console.log(filters)
  return (
   
   
    <Dialog modal={true} >
      
      <DialogTrigger asChild>
        <Button variant="outline">Filter Brokers</Button>
      </DialogTrigger>
    
     
      <DialogContent  className="sm:max-w-[300px] h-[800px] overflow-x-hidden overflow-y-scroll">
     
        <DialogHeader>
          <DialogTitle> Broker filters</DialogTitle>
          <DialogDescription>
           
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-0 max-w-full">

        <FilterForm  filters={filters.simple_filters} />
        <div className="flex items-center text-base   p-2 mb-2  w-full ">

        <h2 className="text-lg  text-gray-500">Advanced Filters</h2>
         <TriangleDownIcon className="ml-auto"/>
        </div>

        <FilterForm  filters={filters.advanced_filters} />
        
       
         </div>
         
     
    
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      
       
      
      </DialogContent>
      
     
     
      
    </Dialog>
    
  )
}
