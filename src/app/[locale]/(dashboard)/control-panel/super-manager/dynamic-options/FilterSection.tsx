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
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useTransition} from "react";

type SelectOption = { label: string; value: string | number };
type FilterConfig =
  | { type: "text"; label: string; value?: string }
  | { type: "select"; label: string; value?: string; options?: SelectOption[] };

export default function FilterSection({
  filters,
}: {
  filters: Record<string, FilterConfig>;
}) {
  let searchParams = useSearchParams();
  let router = useRouter();
  let pathname = usePathname();

  let [filtersCount, setFiltersCount] = useState(0);
  let [showFilters, setShowFilters] = useState(false);
  let [isPending, startTransition] = useTransition();

  useEffect(() => {
    let count = 0;
   
    Object.keys(filters ?? {}).forEach((key) => {
      if(searchParams.has(key)) {
        count++;
      }
     });

    setFiltersCount(count);
  }, [searchParams]);


  let handleClearFilters = () => {
    let newSearchParams = new URLSearchParams(searchParams.toString());
    Object.keys(filters ?? {}).forEach((key) => {
     newSearchParams.delete(key);
    });
    startTransition(() => {
      router.push(`${pathname}?${newSearchParams.toString()}`);
    });
   
  };

  let handleFilterDelete = (key: string) => {
    let newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete(key);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }

  let handleFilterChange = useDebouncedCallback((key: string, value: string) => {

    let newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) newSearchParams.set(key, value);
    else newSearchParams.delete(key);
   
    startTransition(() => {
      router.push(`${pathname}?${newSearchParams.toString()}`);
    });
  }, 500); // 500ms debounce time

  return (
    <>
    <div className="flex items-center gap-2">
      <Button
            variant="default"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 border border-dashed border-blue-300"
            title={showFilters ? 'Hide Filters' : 'Advanced Filters'}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
            {filtersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-orange-500 rounded-full">
                {filtersCount}
              </span>
            )}
          </Button>
         {filtersCount > 0 && <Button 
          onClick={handleClearFilters} 
          variant="outline" 
          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
             <Eraser className="h-4 w-4" />
             <span>Clear Filters</span>
             </Button>}
      </div>

    {showFilters && <div
      className="bg-white dark:bg-white border-2 border-dashed border-blue-300 rounded-lg p-4 space-y-4 w-full"
      style={{ backgroundColor: "#ffffff" }}
    >
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {Object.entries(filters).map(([key, filterConfig]) => {
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
                  defaultValue={filterConfig.value ?? ""}
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
                  {searchParams.get(key) && <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => handleFilterDelete(key)}>
                   X
                  </Button>}
                </div>
              </div>
            );
          }

          return (
            <div key={key}>
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

              <Input
                id={key}
                defaultValue={filterConfig.value ?? ""}
                placeholder={filterConfig.placeholder ?? ""}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className={cn(
                  "w-full",
                  searchParams.get(key) &&
                    "border-blue-600 ring-1 ring-blue-300"
                )}
              />
            </div>
          );
        })}
      </div>
     
    </div>}
    </>
  );
}
