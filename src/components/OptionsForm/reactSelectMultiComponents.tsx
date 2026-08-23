"use client";

import React from "react";
import {
  components,
  type GroupBase,
  type MenuListProps,
  type OnChangeValue,
  type OptionsOrGroups,
} from "react-select";

type OptionLike = { value?: string; options?: OptionLike[] };

function flattenOptions(
  options: OptionsOrGroups<OptionLike, GroupBase<OptionLike>> = [],
): OptionLike[] {
  return options.flatMap((option) =>
    "options" in option && Array.isArray(option.options)
      ? flattenOptions(option.options)
      : [option as OptionLike],
  );
}

function MenuList<Option, Group extends GroupBase<Option>>(
  props: MenuListProps<Option, true, Group>,
) {
  const { options, getValue, setValue, selectProps } = props;
  const flatOptions = flattenOptions(
    options as OptionsOrGroups<OptionLike, GroupBase<OptionLike>>,
  );

  const handleSelectAll = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (flatOptions.length === 0) return;

    const getOptionValue =
      selectProps.getOptionValue ??
      ((option: Option) => String((option as OptionLike).value ?? ""));

    const current = getValue() ?? [];
    const byValue = new Map(
      current.map((option) => [getOptionValue(option), option]),
    );
    flatOptions.forEach((option) => {
      const data = option as Option;
      byValue.set(getOptionValue(data), data);
    });

    setValue(
      Array.from(byValue.values()) as OnChangeValue<Option, true>,
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
            onMouseDown={handleSelectAll}
          >
            Check all
          </button>
        </div>
      )}
      {props.children}
    </components.MenuList>
  );
}

export const reactSelectMultiComponents = {
  MenuList,
};
