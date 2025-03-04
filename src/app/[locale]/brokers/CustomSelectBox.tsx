import { useState, useEffect, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RatingComponent } from "./RatingComponent";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import { FilterField } from "@/types";

export function CustomSelectBox({
  filter: { options, name, field, type, expanded, headless = false },
  selected,
}: {
  filter: FilterField;
  selected: string[];
}) {
  const [open, setOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState(selected);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = new URLSearchParams(searchParams);

  // ✅ Debounce URL updates to prevent excessive requests
  const updateURL = useCallback(() => {
    if (params.has("page")) params.delete("page");

    if (checkedItems.length === 0) {
      params.delete(field);
    } else {
      params.set(field, checkedItems.join(","));
    }

    replace(`${pathname}?${params}`);
  }, [checkedItems, replace, pathname, params]);

  useEffect(() => {
    updateURL();
  }, [checkedItems, updateURL]);

  // ✅ Prevent unnecessary state updates
  useEffect(() => {
    if (JSON.stringify(selected) !== JSON.stringify(checkedItems)) {
      setCheckedItems(selected);
    }
  }, [selected]);

  const handleCheckedChange = (checked: boolean | string, value: string) => {
    setCheckedItems((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  return (
    <div className="px-2 m-0 w-full">
      {!headless && (
        <div
          className={`flex items-center text-base cursor-pointer p-2 mb-2 rounded-md w-full ${
            expanded ? "border-b pointer-events-none border-gray-200" : "border-1"
          }`}
          {...(!expanded && { onClick: () => setOpen(!open) })}
        >
          {name} {type === "checkbox" && checkedItems.length ? `(${checkedItems.length})` : ""}
          {["radio", "rating"].includes(type) && checkedItems.length
            ? `: ${options?.find((option) => option.value === checkedItems[0])?.name}`
            : ""}
          <TriangleDownIcon className={`ml-auto ${open || expanded ? "rotate-180" : ""}`} />
        </div>
      )}

      {(open || expanded) && (
        <div className="flex-col px-1">
          {["radio", "rating"].includes(type) ? (
            <RadioGroup onValueChange={(value) => setCheckedItems([value])} value={checkedItems[0] || ""}>
              {options?.map((option) => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem id={`${field}-${option.value}`} value={option.value} />
                  <label htmlFor={`${field}-${option.value}`} className="text-sm w-[50px] font-medium">
                    {option.name}
                  </label>
                  {type === "rating" && <RatingComponent value={Number(option.value)} />}
                </div>
              ))}
              {checkedItems.length > 0 && (
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setCheckedItems([]);
                      setOpen(false);
                    }}
                  >
                    Remove selection
                  </Button>
                </div>
              )}
            </RadioGroup>
          ) : (
            options?.map((option) => (
              <div className="flex items-center space-x-2 p-2" key={option.value}>
                <Checkbox
                  id={`${field}-${option.value}`}
                  checked={checkedItems.includes(option.value)}
                  onCheckedChange={(checked) => handleCheckedChange(checked, option.value)}
                />
                <label htmlFor={`${field}-${option.value}`} className="text-sm font-medium">
                  {option.name}
                </label>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex flex-wrap flex-col gap-1 m-2">
        {!expanded &&
          type === "checkbox" &&
          checkedItems.map((item) => (
            <div key={item} className="flex items-center justify-between rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-800">
              {options?.find((option) => option.value === item)?.name}
              <span
                onClick={() => {
                  handleCheckedChange(false, item);
                  setCheckedItems((prev) => prev.filter((i) => i !== item));
                  setOpen(false);
                }}
                className="font-bold cursor-pointer ml-2"
              >
                ×
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
