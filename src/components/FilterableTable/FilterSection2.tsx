"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebouncedCallback } from "use-debounce";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InfoIcon, Filter, Eraser, Trash } from "lucide-react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useTransition} from "react";
import { shallowEqual } from "@/lib/utils";
import { FTFilters,FTFilterType,FTSelectOption } from "./types";

 interface FilterSection2Props<T> {
  filters: FTFilters<T>;
  LOCAL_STORAGE_KEY: string;
}
export default function FilterSection2<T>({
  filters,
  LOCAL_STORAGE_KEY,
}: FilterSection2Props<T>) {
  let searchParams = useSearchParams();
  let router = useRouter();
  let pathname = usePathname();

  let [isPending, startTransition] = useTransition();

  let [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
   
      if (saved) {
        const parsed = JSON.parse(saved);
        
        //construct search params in the url if they are not present
      let newSearchParams = new URLSearchParams(searchParams.toString());
      Object.keys(parsed ?? {}).forEach((key) => {
        if(!searchParams.has(key)) {
          newSearchParams.set(key, parsed[key] ?? "");
        }
      });
     // console.log("newSearchParams",newSearchParams.toString());

        //push the search params to the url (only if changed)
        const next = `${pathname}?${newSearchParams.toString()}`;
        const curr = `${pathname}?${searchParams.toString()}`;
        if (next !== curr) router.push(next);
      }
    } catch (e) {
      console.warn("Failed to load saved filters:", e);
    }
  }, []);
  

  useEffect(() => {
    const activeKeys:Record<string, string>={};

  //Override with search params if present
    Object.keys(filters ?? {}).forEach((key) => {
      if(searchParams.has(key)) {
        activeKeys[key] = searchParams.get(key) ?? "";
      }
     });

    //Set state only if changed
    setActiveFilters((prev) => {
        const same = shallowEqual(activeKeys, prev);
        return same ? prev : activeKeys;
      });
  
  }, [searchParams,filters]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeFilters));
    } catch (e) {
      console.warn("Failed to save filters:", e);
    }
  }, [activeFilters]);



  let handleFilterDelete = (key: string) => {
    let newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete(key);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }

  let handleFilterChange = (key: string, value: string) => {
    let newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) newSearchParams.set(key, value);

    else newSearchParams.delete(key);
    setActiveFilters((prev) => {
    return { ...prev, [key]: value };
    });

    startTransition(() => {
      router.push(`${pathname}?${newSearchParams.toString()}`);
    });
   
  };

  let handleFilterChangeDebounced = useDebouncedCallback((key: string, value: string) => {
    let newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) newSearchParams.set(key, value);
    else newSearchParams.delete(key);

    startTransition(() => {
      router.push(`${pathname}?${newSearchParams.toString()}`);
    });
  }, 500);
  return (
    <>
     <div
      className="bg-white dark:bg-white border-2 border-dashed border-blue-300 rounded-lg p-4 space-y-4 w-full"
      style={{ backgroundColor: "#ffffff" }}
    >
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {(Object.entries(filters) as [string, FTFilterType][]).map(([key, filterConfig]) => {
          if (filterConfig.type === "select") {
            return (
              <div key={key}>
                <Label
                  htmlFor={`${key}-trigger`}
                  id={`${key}-label`}
                  onClick={() =>
                    document.getElementById(`${key}-trigger`)?.click()
                  }
                  className="flex items-center gap-2 pb-2"
                >
                  {filterConfig.label}
                  {filterConfig.tooltip && (
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>{filterConfig.tooltip}</TooltipContent>
                    </Tooltip>
                  )}
                </Label>
                <div className="flex items-center gap-2">
                <Select
                  value={activeFilters[key] ?? ""}
                  onValueChange={(value) => handleFilterChange(key, value)}
                >
                  <SelectTrigger
                    id={`${key}-trigger`}
                    aria-labelledby={`${key}-label`}
                    className={cn(
                      "w-full",
                      searchParams.get(key) &&
                        "border-blue-600 ring-1 ring-blue-300"
                    )}
                  >
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterConfig.options &&
                      filterConfig.options?.map((opt) => (
                        <SelectItem
                          key={String(opt.value)}
                          value={String(opt.value)}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                  {activeFilters[key] && 
                  <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                   onClick={() => {handleFilterDelete(key)}}>
                   <XCircle className="h-4 w-4" aria-hidden="true" />
                   <span className="sr-only">Clear filter</span>
                  </Button>}
                </div>
              </div>
            );
          }

          return (
            <div key={key} >
              <Label htmlFor={key} className="flex items-center gap-2 pb-2">
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {filterConfig.tooltip && (
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>{filterConfig.tooltip}</TooltipContent>
                  </Tooltip>
                )}
              </Label>
              <div className="flex items-center gap-2">
              <Input
                id={key}
                type="text"
                value={activeFilters[key] ?? ""}
                placeholder={filterConfig.placeholder ?? ""}
                onChange={(e) => {
                    let value = e.target.value;

                    setActiveFilters((prev) => {
                        return { ...prev, [key]: value };
                    });
                    handleFilterChangeDebounced(key, value);

                }}
                className={cn(
                  "w-full",
                  searchParams.get(key) &&
                    "border-blue-600 ring-1 ring-blue-300"
                )}
              />
               {activeFilters[key]  && 
                  <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                   onClick={() => {handleFilterDelete(key)}}>
                   <XCircle className="h-4 w-4" aria-hidden="true" />
                   <span className="sr-only">Clear filter</span>
                  </Button>}
                  </div>
            </div>
          );
        })}
      </div>
     
    </div>
    </>
  );
}
