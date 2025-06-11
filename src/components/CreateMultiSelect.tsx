"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Check, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

export function CreateMultiSelect({
  placeholder = "Select instrument",
  options = [],
  onChange,
  initialSelected = [],
}: {
  placeholder: string;
  options?: Option[];
  onChange?: (selected: Option[]) => void;
  initialSelected?: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const toggleOption = (option: Option) => {
    const exists = initialSelected.find((item) => item.value === option.value);
    let newSelected: Option[];
    if (exists) {
      newSelected = initialSelected.filter((item) => item.value !== option.value);
    } else {
      newSelected = [...initialSelected, option];
    }
    onChange?.(newSelected);
  };

  const handleCreate = () => {
    const newOption: Option = {
      label: inputValue,
      value: inputValue.toLowerCase().replace(/\s+/g, "-"),
    };
    const newSelected = [...initialSelected, newOption];
    onChange?.(newSelected);
    setInputValue("");
    setOpen(false);
  };

  const removeOption = (value: string) => {
    const newSelected = initialSelected.filter((i) => i.value !== value);
    onChange?.(newSelected);
  };

  const isSelected = (option: Option) =>
    initialSelected.some((item) => item.value === option.value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-auto min-h-[36px] flex justify-start items-start gap-1 bg-inherit py-1 px-2"
            )}
            type="button"
          >
            {initialSelected.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <div className="flex items-start gap-1 flex-wrap w-full">
              {initialSelected.map((item) => (
                <span
                  key={item.value}
                  className="flex items-center gap-1 px-2 py-0.5 text-sm rounded bg-muted"
                >
                  {item.label}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(item.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        removeOption(item.value);
                      }
                    }}
                    className="cursor-pointer text-muted-foreground hover:text-destructive focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ))}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" sideOffset={5}>
          <Command>
            <CommandInput
              placeholder="Search or create..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            {filteredOptions.length === 0 && inputValue ? (
              <CommandEmpty className="flex justify-between items-center px-3 py-2">
                <span>No results.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreate}
                  className="ml-auto text-xs"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Create "{inputValue}"
                </Button>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option, index) => (
                  <CommandItem
                    key={option.value + index}
                    onSelect={() => toggleOption(option)}
                    className="cursor-pointer"
                  >
                    {option.label}
                    {isSelected(option) && (
                      <Check className="ml-auto w-4 h-4 text-green-500" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

