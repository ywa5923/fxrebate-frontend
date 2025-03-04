"use client";

import { CustomSelectBox } from "./CustomSelectBox";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import  { FilterOption } from '@/types/index'; 
import {FilterField} from '@/types/index';
import { useMemo } from "react";


type FilterParams=Partial<Record<FilterField["field"], string | string[] | null>>

export function FilterForm({ filters }: { filters: FilterField[] }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const params = new URLSearchParams(searchParams);
    const { replace } = useRouter();

   
    const [filterParams, setFilterParams] = useState<FilterParams>({});


  useEffect(() => {

   /* let urlRadioFilters:FiltersBag={};
    let urlCheckedFilters:FiltersBag={};
    if (filters){
        filters.forEach((filter:FilterField) => {
            const paramValue = params.get(filter.field);

            if (paramValue) {
              if (filter.type == "radio") {
                //handleRadio(filter.field,params.get(filter.field),"radio")
                urlRadioFilters[filter.field] = paramValue;
              } else if (filter.type == "checkbox") {
                //setCheckboxfilters({...checkboxFilters,[filter.field]:params.get(filter.field)?.split(",")})
                urlCheckedFilters[filter.field] = paramValue.split(",");
                  
              }
            }
          });
    }*/
     
    const params: FilterParams = {};
    searchParams.forEach((value:string, key:string) => {
       //key:filter_headquarters, value: Bahamas,British Virgin Islands
        if (key.startsWith("filter_")) {
            params[key] = value.includes(",") ? value.split(",") : [value]
        }
      });

      //setFilterParams(params);
      setFilterParams((prev) => {
        const newParams = { ...params }; // Ensure a new object reference
        return newParams;
      });
  },[searchParams]);


    return (
        <>
            {filters && filters?.map((filter: FilterField, index: number) => {

                //let selected=(filter.field in filterParams)?filterParams[filter.field]:null;
              //  const selected=filterParams[filter.field]??null;
               // const selected = useMemo(() => [...(filterParams[filter.field] ?? [])], [filterParams[filter.field]]);
               const selected = filterParams[filter.field] ? [...filterParams[filter.field]] : [];
               

               // console.log(`Rendering CustomSelectBox for ${filter.field}:`, selected);
                return (
                    <CustomSelectBox filter={filter} selected={selected} key={filter.field}  />
                )
            })}
        </>

    )

}