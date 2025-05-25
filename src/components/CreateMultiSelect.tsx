"use client";

import { useState } from "react";
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

const initialOptions: Option[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
];

export function CreateMultiSelect() {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [selected, setSelected] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const toggleOption = (option: Option) => {
    const exists = selected.find((item) => item.value === option.value);
    if (exists) {
      setSelected((prev) => prev.filter((item) => item.value !== option.value));
    } else {
      setSelected((prev) => [...prev, option]);
    }
  };

  const handleCreate = () => {
    const newOption: Option = {
      label: inputValue,
      value: inputValue.toLowerCase().replace(/\s+/g, "-"),
    };
    setOptions((prev) => [...prev, newOption]);
    setSelected((prev) => [...prev, newOption]);
    setInputValue("");
    setOpen(false);
  };

  const isSelected = (option: Option) =>
    selected.some((item) => item.value === option.value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start flex-wrap min-h-[2.5rem]">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">Select or create...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selected.map((item) => (
                  <span
                    key={item.value}
                    className="flex items-center gap-1 px-2 py-0.5 text-sm rounded bg-muted"
                  >
                    {item.label}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(item);
                      }}
                    />
                  </span>
                ))}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search or create..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            {filteredOptions.length === 0 && inputValue ? (
              <CommandEmpty className="flex justify-between px-2 py-2">
                <span>No results.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreate}
                  className="ml-auto"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Create "{inputValue}"
                </Button>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
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
