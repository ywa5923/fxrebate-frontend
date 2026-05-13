import { useCallback, useState } from "react";
import type { Path, UseFormSetValue } from "react-hook-form";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Copy broker → public draft in the form, with row-only `public_*` keys for UI hints.
 *
 * **Copy target:** `editableRow[field]` is written to the form at the **plain** key `field`
 * (no `public_` in form data) — same pattern as `AccountLinks3`.
 *
 * **`public_${field}` on the row:** only for comparing broker vs mirror (e.g. red copy button
 * when `row[field] != row[\`public_${field}\`]` while `isUpdatedEntry(row)`). Not the default
 * form path unless you pass `toFormPath` / `defaultPublicFormPath`.
 */
export type RowWithPublicPair<K extends string> = Record<K, unknown> &
  Record<`public_${K}`, unknown> & {
    is_updated_entry?: number | boolean;
  };

/** Row-only mirror key — mismatch styling; not the default form field name. */
export type PublicRowKey<K extends string> = `public_${K}`;

/** Use when the form stores public values under `public_*` keys (same names as on the row). */
export function defaultPublicFormPath<K extends string>(field: K): PublicRowKey<K> {
  return `public_${field}`;
}

/** Default when the form uses the same keys as the broker side (`name`, `url`, …). */
export function defaultPlainFormPath<K extends string, TForm extends Record<string, unknown>>(
  field: K,
): Path<TForm> {
  return field as unknown as Path<TForm>;
}

export type UseBrokerPublicCopyArgs<
  K extends string,
  TRow extends RowWithPublicPair<K>,
  TForm extends Record<string, unknown>,
> = {
  /** Current row in edit mode, or null (add / idle). */
  editableRow: TRow | null;
  isAdmin: boolean;
  setValue: UseFormSetValue<TForm>;
  /** Broker-side keys — must exist on `TRow` along with `public_${key}` (row only). */
  copyableFields: readonly K[];
  /**
   * Where to write the copied broker value in the form.
   * Defaults to the same key as `field` (e.g. form `name` / `url` while the row still has `public_name` / `public_url` for hints).
   * Use `defaultPublicFormPath` if your form fields are literally `public_*`.
   */
  toFormPath?: (field: K) => Path<TForm>;
  /** Red “needs copy” hint (default: `is_updated_entry === 1`). */
  isUpdatedEntry?: (row: TRow) => boolean;
};

/**
 * Copy broker `editableRow[field]` → form `field` (plain key). Button colors use row
 * `field` vs `public_${field}` (same logic as `AccountLinks3` `renderCopyBtn`).
 */
export function useBrokerPublicCopy<
  const K extends string,
  TRow extends RowWithPublicPair<K>,
  TForm extends Record<string, unknown>,
>({
  editableRow,
  isAdmin,
  setValue,
  copyableFields: _copyableFields,
  toFormPath: toFormPathProp,
  isUpdatedEntry = (row) => row.is_updated_entry === 1,
}: UseBrokerPublicCopyArgs<K, TRow, TForm>) {
  const [clickedCopyBtns, setClickedCopyBtns] = useState<Set<K>>(() => new Set());

  const resolveToFormPath = useCallback(
    (field: K) =>
      (toFormPathProp ?? ((f: K) => defaultPlainFormPath<K, TForm>(f)))(field),
    [toFormPathProp],
  );

  const resetCopyHints = useCallback(() => {
    setClickedCopyBtns(new Set());
  }, []);

  const copyBrokerValueToPublicValue = useCallback(
    (field: K) => {
      const brokerValue = editableRow?.[field];
      if (brokerValue == null || brokerValue === "") return;
      setValue(resolveToFormPath(field), String(brokerValue) as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [editableRow, setValue, resolveToFormPath],
  );

  const renderCopyBtn = useCallback(
    (field: K) => {
      if (!isAdmin || !editableRow) return null;

      // Row only: compare broker vs public mirror for button color (not form keys).
      const publicKey = `public_${field}` as keyof TRow;
      const showRedCopyHint =
        isUpdatedEntry(editableRow) &&
        editableRow[field] != editableRow[publicKey];
      const clicked = clickedCopyBtns.has(field);

      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            copyBrokerValueToPublicValue(field);
            setClickedCopyBtns((prev) => new Set(prev).add(field));
          }}
          className={cn(
            "p-1 h-6 w-6 flex-shrink-0",
            clicked
              ? "bg-green-100 border-green-500 text-green-700"
              : showRedCopyHint
                ? "bg-red-100 border-red-500 text-red-700 hover:bg-red-200"
                : "text-muted-foreground border-border hover:bg-muted/50",
          )}
          title="Copy broker value to public value"
        >
          <Copy className="h-3 w-3" />
        </Button>
      );
    },
    [
      isAdmin,
      editableRow,
      clickedCopyBtns,
      isUpdatedEntry,
      copyBrokerValueToPublicValue,
    ],
  );

  return {
    clickedCopyBtns,
    setClickedCopyBtns,
    resetCopyHints,
    copyBrokerValueToPublicValue,
    renderCopyBtn,
  };
}
