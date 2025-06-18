"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Check, PlusCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

interface CreateSelectProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CreateSelect({ options, value, onValueChange, placeholder = "Select class of instruments", className }: CreateSelectProps) {
  const [selected, setSelected] = useState<Option | null>(value ? options.find(opt => opt.value === value) || null : null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState("");

  const handleSelect = (option: Option) => {
    setSelected(option);
    onValueChange?.(option.value);
    setOpen(false);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setNewOptionInput("");
  };

  const handleSaveNewOption = () => {
    if (newOptionInput.trim()) {
      const newOption = {
        label: newOptionInput.trim(),
        value: newOptionInput.trim().toLowerCase().replace(/\s+/g, "-"),
      };
      onValueChange?.(newOption.value);
      setSelected(newOption);
      setIsCreating(false);
      setNewOptionInput("");
      setOpen(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewOptionInput("");
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-between", className)}>
          {selected ? selected.label : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
        {!isCreating && <CommandInput
            placeholder="Search or create..."
            value={inputValue}
            onValueChange={setInputValue}
          />}
        
            <CommandGroup>
              {isCreating ? (
                <div className="p-2 space-y-2">
                  <Input
                    placeholder="Enter new class name..."
                    value={newOptionInput}
                    onChange={(e) => setNewOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveNewOption();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSaveNewOption}
                      disabled={!newOptionInput.trim()}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCancelCreate}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <CommandItem onSelect={handleCreateClick}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Create new class of instruments
                  </Button>
                </CommandItem>
              )}
         
              {!isCreating && filteredOptions.map((option) => (
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
          
        </Command>
      </PopoverContent>
    </Popover>
  );
}
