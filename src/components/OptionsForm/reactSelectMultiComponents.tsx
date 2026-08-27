"use client";

import React from "react";
import {
  components,
  type GroupBase,
  type MenuListProps,
  type OnChangeValue,
  type OptionsOrGroups,
  type ValueContainerProps,
} from "react-select";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MAX_VISIBLE_VALUES = 3;

type OptionLike = { value?: string; label?: string; options?: OptionLike[] };

function flattenOptions(
  options: OptionsOrGroups<OptionLike, GroupBase<OptionLike>> = [],
): OptionLike[] {
  return options.flatMap((option) =>
    "options" in option && Array.isArray(option.options)
      ? flattenOptions(option.options)
      : (option as OptionLike),
  );
}

function MenuList<Option, Group extends GroupBase<Option>>(
  props: MenuListProps<Option, true, Group>,
) {
  const { options, getValue, setValue, selectProps } = props;

  //get the options that is in the multiselect dropdown
  const flatOptions = flattenOptions(
    options as OptionsOrGroups<OptionLike, GroupBase<OptionLike>>,
  );

  const getOptionValue =
    selectProps.getOptionValue ??
    ((option: Option) => String((option as OptionLike).value ?? ""));

  //get the current selected options i.e =>
  // current = [
  //   { value: "ro", label: "România" },
  //   { value: "de", label: "Germania" },
  // ];
  const selectedOptions = getValue() ?? [];
  const selectedValues = new Set(
    selectedOptions.map((option) => getOptionValue(option)),
  );
  const allVisibleSelected =
    flatOptions.length > 0 &&
    flatOptions.every((option) =>
      selectedValues.has(getOptionValue(option as Option)),
    );

  const handleToggleAll = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (flatOptions.length === 0) return;

    if (allVisibleSelected) {
      // Uncheck all = clear entire selection
      setValue([] as OnChangeValue<Option, true>, "deselect-option");
      // Previous behavior: uncheck only visible/filtered options, keep the rest selected
      // const visibleValues = new Set(
      //   flatOptions.map((option) => getOptionValue(option as Option)),
      // );
      // const remaining = selectedOptions.filter(
      //   (option) => !visibleValues.has(getOptionValue(option)),
      // );
      // setValue(remaining as OnChangeValue<Option, true>, "deselect-option");
      return;
    }

    // const byValue = new Map(
    //   selectedOptions.map((option) => [getOptionValue(option), option]),
    // );
    // flatOptions.forEach((option) => {
    //   const data = option as Option;
    //   byValue.set(getOptionValue(data), data);
    // });

    // setValue(
    //   Array.from(byValue.values()) as OnChangeValue<Option, true>,
    //   "select-option",
    // );
    setValue(
      flatOptions as unknown as OnChangeValue<Option, true>,
      "select-option",
    );
  };

  return (
    <components.MenuList {...props}>
      {flatOptions.length > 0 && (
        <div className="sticky top-0 z-10 border-b bg-inherit px-2 py-1">
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-foreground hover:bg-accent"
            onMouseDown={handleToggleAll}
          >
            {allVisibleSelected ? "Uncheck all" : "Check all"}
          </button>
        </div>
      )}
      {props.children}
    </components.MenuList>
  );
}

function ValueContainer<Option, Group extends GroupBase<Option>>(
  props: ValueContainerProps<Option, true, Group>,
) {
  const [selectedOpen, setSelectedOpen] = React.useState(false);
  const { getValue, setValue, selectProps } = props;
  const values = getValue();
  const excess = Math.max(0, values.length - MAX_VISIBLE_VALUES);
  const childrenArray = React.Children.toArray(props.children);
  const inputChild = childrenArray[childrenArray.length - 1];
  const valueChildren = childrenArray.slice(0, -1);
  const visibleValues = valueChildren.slice(0, MAX_VISIBLE_VALUES);

  const getOptionLabel =
    selectProps.getOptionLabel ??
    ((option: Option) => String((option as OptionLike).label ?? ""));
  const getOptionValue =
    selectProps.getOptionValue ??
    ((option: Option) => String((option as OptionLike).value ?? ""));

  const removeSelected = (optionToRemove: Option) => {
    const next = values.filter(
      (option) => getOptionValue(option) !== getOptionValue(optionToRemove),
    );
    setValue(next as OnChangeValue<Option, true>, "deselect-option", optionToRemove);
    if (next.length <= MAX_VISIBLE_VALUES) {
      setSelectedOpen(false);
    }
  };

  return (
    <components.ValueContainer {...props}>
      {visibleValues}
      {excess > 0 && (
        <Popover open={selectedOpen} onOpenChange={setSelectedOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/80"
              onMouseDown={(event) => {
                // Keep react-select from stealing the click / opening its menu
                event.preventDefault();
                event.stopPropagation();
                setSelectedOpen((open) => !open);
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              +{excess} more
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            className="z-[100] w-[min(20rem,calc(100vw-2rem))] p-2"
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-2 px-1 text-xs font-medium text-muted-foreground">
              Selected ({values.length})
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {values.map((option) => {
                const value = getOptionValue(option);
                const label = selectProps.formatOptionLabel
                  ? selectProps.formatOptionLabel(option, {
                      context: "value",
                      inputValue: "",
                      selectValue: values,
                    })
                  : getOptionLabel(option);

                return (
                  <div
                    key={value}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <span className="min-w-0 flex-1 break-words">{label}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${getOptionLabel(option)}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeSelected(option);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {inputChild}
    </components.ValueContainer>
  );
}

export const reactSelectMultiComponents = {
  MenuList,
  ValueContainer,
};
