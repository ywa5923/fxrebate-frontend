"use client";

import {
  useMemo,
  useState,
  useDeferredValue,
  useCallback,
  type UIEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CommandList,
} from "@/components/ui/command";
import { Check, PlusCircle, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

const LARGE_LIST_THRESHOLD = 50;
const VIRTUALIZATION_THRESHOLD = 80;
const OPTION_ROW_HEIGHT = 32;
const LIST_MAX_HEIGHT = 300;
const LIST_OVERSCAN = 8;

function OptionRow({
  option,
  selected,
  onToggle,
}: {
  option: Option;
  selected: boolean;
  onToggle: (option: Option) => void;
}) {
  return (
    <CommandItem
      key={option.value}
      value={option.value}
      keywords={[option.label]}
      onSelect={() => onToggle(option)}
      className="cursor-pointer"
      style={{ minHeight: OPTION_ROW_HEIGHT }}
    >
      {option.label}
      {selected && <Check className="ml-auto w-4 h-4 text-green-500" />}
    </CommandItem>
  );
}

function VirtualizedOptionList({
  options,
  isSelected,
  onToggle,
}: {
  options: Option[];
  isSelected: (option: Option) => boolean;
  onToggle: (option: Option) => void;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const { startIndex, visibleOptions, offsetY, totalHeight } = useMemo(() => {
    const visibleCount =
      Math.ceil(LIST_MAX_HEIGHT / OPTION_ROW_HEIGHT) + LIST_OVERSCAN * 2;
    const start = Math.max(
      0,
      Math.floor(scrollTop / OPTION_ROW_HEIGHT) - LIST_OVERSCAN,
    );
    const end = Math.min(options.length, start + visibleCount);

    return {
      startIndex: start,
      visibleOptions: options.slice(start, end),
      offsetY: start * OPTION_ROW_HEIGHT,
      totalHeight: options.length * OPTION_ROW_HEIGHT,
    };
  }, [options, scrollTop]);

  if (options.length === 0) {
    return null;
  }

  return (
    <div
      className="overflow-y-auto border-t"
      style={{ maxHeight: LIST_MAX_HEIGHT }}
      onScroll={handleScroll}
    >
      <div className="relative w-full" style={{ height: totalHeight }}>
        <CommandGroup
          className="absolute inset-x-0 overflow-visible p-1"
          style={{ transform: `translateY(${offsetY}px)` }}
          aria-label={`Showing items ${startIndex + 1} to ${startIndex + visibleOptions.length} of ${options.length}`}
        >
          {visibleOptions.map((option) => (
            <OptionRow
              key={option.value}
              option={option}
              selected={isSelected(option)}
              onToggle={onToggle}
            />
          ))}
        </CommandGroup>
      </div>
    </div>
  );
}

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
  const [isCreating, setIsCreating] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState("");
  const deferredSearch = useDeferredValue(inputValue);

  const selectedValues = useMemo(
    () => new Set(initialSelected.map((item) => item.value)),
    [initialSelected],
  );

  const filteredOptions = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query),
    );
  }, [options, deferredSearch]);

  const isLargeList = options.length > LARGE_LIST_THRESHOLD;
  const useVirtualization = filteredOptions.length > VIRTUALIZATION_THRESHOLD;

  const toggleOption = (option: Option) => {
    const exists = initialSelected.find((item) => item.value === option.value);
    const newSelected = exists
      ? initialSelected.filter((item) => item.value !== option.value)
      : [...initialSelected, option];
    onChange?.(newSelected);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setNewOptionInput("");
  };

  const handleSaveNewOption = () => {
    if (newOptionInput.trim()) {
      const newOption: Option = {
        label: newOptionInput.trim(),
        value: newOptionInput.trim().toLowerCase().replace(/\s+/g, "-"),
      };
      onChange?.([...initialSelected, newOption]);
      setIsCreating(false);
      setNewOptionInput("");
      setOpen(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewOptionInput("");
  };

  const removeOption = (value: string) => {
    onChange?.(initialSelected.filter((item) => item.value !== value));
  };

  const isSelected = (option: Option) => selectedValues.has(option.value);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setInputValue("");
      setIsCreating(false);
      setNewOptionInput("");
    }
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-auto min-h-[36px] flex justify-start items-start gap-1 bg-inherit py-1 px-2",
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
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0"
          align="start"
          sideOffset={5}
        >
          <Command shouldFilter={false}>
            {!isCreating && (
              <CommandInput
                placeholder={
                  isLargeList
                    ? `Search ${options.length} instruments...`
                    : "Search or create..."
                }
                value={inputValue}
                onValueChange={setInputValue}
              />
            )}
            <CommandList className="max-h-none overflow-visible">
              {isLargeList && !isCreating && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                  Scroll or search to browse {options.length} instruments.
                </div>
              )}

              {filteredOptions.length === 0 && inputValue && !isCreating && (
                <CommandEmpty className="flex flex-col justify-between items-center px-3 py-2">
                  <span className="text-sm text-muted-foreground w-full">
                    No results.
                  </span>
                  <Button
                    onClick={() => {
                      const newOption: Option = {
                        label: inputValue,
                        value: inputValue
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      };
                      onChange?.([...initialSelected, newOption]);
                      setInputValue("");
                      setOpen(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Add &quot;{inputValue}&quot;
                  </Button>
                </CommandEmpty>
              )}

              <CommandGroup>
                {isCreating ? (
                  <div className="p-2 space-y-2">
                    <Input
                      placeholder="Enter new option name..."
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
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
                  <CommandItem value="__create__" onSelect={handleCreateClick}>
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Create new instrument
                  </CommandItem>
                )}
              </CommandGroup>

              {!isCreating &&
                (useVirtualization ? (
                  <VirtualizedOptionList
                    options={filteredOptions}
                    isSelected={isSelected}
                    onToggle={toggleOption}
                  />
                ) : (
                  <div
                    className="overflow-y-auto border-t"
                    style={{ maxHeight: LIST_MAX_HEIGHT }}
                  >
                    <CommandGroup>
                      {filteredOptions.map((option) => (
                        <OptionRow
                          key={option.value}
                          option={option}
                          selected={isSelected(option)}
                          onToggle={toggleOption}
                        />
                      ))}
                    </CommandGroup>
                  </div>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
