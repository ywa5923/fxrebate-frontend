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
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, PlusCircle } from "lucide-react";
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

export function CreateSelect() {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [selected, setSelected] = useState<Option | null>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSelect = (option: Option) => {
    setSelected(option);
    setOpen(false);
  };

  const handleCreate = () => {
    const newOption = {
      label: inputValue,
      value: inputValue.toLowerCase().replace(/\s+/g, "-"),
    };
    setOptions((prev) => [...prev, newOption]);
    setSelected(newOption);
    setOpen(false);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selected ? selected.label : "Select or create..."}
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
              <Button variant="ghost" size="sm" onClick={handleCreate}>
                <PlusCircle className="w-4 h-4 mr-1" />
                Create "{inputValue}"
              </Button>
            </CommandEmpty>
          ) : (
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option)}
                >
                  {option.label}
                  {selected?.value === option.value && (
                    <Check className="ml-auto w-4 h-4 text-green-500" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
