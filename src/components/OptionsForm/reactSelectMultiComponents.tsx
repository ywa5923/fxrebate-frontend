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

const MAX_VISIBLE_VALUES = 3;

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

  const getOptionValue =
    selectProps.getOptionValue ??
    ((option: Option) => String((option as OptionLike).value ?? ""));

  const current = getValue() ?? [];
  const selectedValues = new Set(current.map((option) => getOptionValue(option)));
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
      const visibleValues = new Set(
        flatOptions.map((option) => getOptionValue(option as Option)),
      );
      const remaining = current.filter(
        (option) => !visibleValues.has(getOptionValue(option)),
      );
      setValue(remaining as OnChangeValue<Option, true>, "deselect-option");
      return;
    }

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
  const values = props.getValue();
  const excess = Math.max(0, values.length - MAX_VISIBLE_VALUES);
  const childrenArray = React.Children.toArray(props.children);
  const inputChild = childrenArray[childrenArray.length - 1];
  const valueChildren = childrenArray.slice(0, -1);
  const visibleValues = valueChildren.slice(0, MAX_VISIBLE_VALUES);

  return (
    <components.ValueContainer {...props}>
      {visibleValues}
      {excess > 0 && (
        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          +{excess} more
        </span>
      )}
      {inputChild}
    </components.ValueContainer>
  );
}

export const reactSelectMultiComponents = {
  MenuList,
  ValueContainer,
};
