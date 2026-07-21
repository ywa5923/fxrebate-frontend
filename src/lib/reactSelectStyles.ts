import type { StylesConfig } from "react-select";

/** Shared react-select styles (OptionsForm + ReferalLinks), with dark mode. */
export function getReactSelectStyles(
  isDark = false,
): StylesConfig<any, true> {
  const border = isDark ? "#374151" : "#e5e7eb";
  const borderFocus = "#22c55e";
  const controlBg = isDark ? "#111827" : "#ffffff";
  const menuBg = isDark ? "#111827" : "#ffffff";
  const text = isDark ? "#f3f4f6" : "#111827";
  const optionFocus = isDark ? "#14532d" : "#f0fdf4";
  const multiValueBg = isDark ? "#14532d" : "#f0fdf4";
  const multiValueBorder = isDark ? "#166534" : "#bbf7d0";
  const multiValueText = isDark ? "#bbf7d0" : "#166534";
  const multiValueRemoveHover = isDark ? "#166534" : "#dcfce7";

  return {
    control: (base, state) => ({
      ...base,
      minHeight: 40,
      borderRadius: 8,
      backgroundColor: controlBg,
      borderColor: state.isFocused ? borderFocus : border,
      boxShadow: state.isFocused ? "0 0 0 2px rgba(34,197,94,0.2)" : "none",
      color: text,
      "&:hover": {
        borderColor: borderFocus,
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "4px 6px",
      gap: "4px",
    }),
    input: (base) => ({
      ...base,
      color: text,
    }),
    singleValue: (base) => ({
      ...base,
      color: text,
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: multiValueBg,
      border: `1px solid ${multiValueBorder}`,
      borderRadius: 6,
      padding: "2px 4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: multiValueText,
      fontSize: "12px",
      fontWeight: 500,
      padding: "0 4px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: multiValueText,
      borderRadius: 4,
      ":hover": {
        backgroundColor: multiValueRemoveHover,
        color: isDark ? "#ecfdf5" : "#14532d",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#22c55e"
        : state.isFocused
          ? optionFocus
          : menuBg,
      color: state.isSelected ? "white" : text,
      cursor: "pointer",
      ":active": {
        backgroundColor: "#16a34a",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: menuBg,
      border: isDark ? "1px solid #374151" : undefined,
    }),
    menuList: (base) => ({
      ...base,
      padding: 4,
      backgroundColor: menuBg,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };
}
