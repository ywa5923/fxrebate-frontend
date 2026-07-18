import {
  ColumnHeader,
  RowHeader,
  StaticMatrixData,
} from "@/types/Matrix";

interface CreateEmptyMatrixParams {
  rowHeaders: RowHeader[];
  columnHeaders: ColumnHeader[];
  type: "challenge" | "placeholder";
  matrixPlaceholdersArray?: Record<string, string | null> | null;
}

/**
 * Builds an empty matrix structure (one cell per row/column combination) used
 * when the API returns no existing data. Placeholders are attached per cell,
 * except in "placeholder" mode where they don't apply.
 */
export function createEmptyMatrix({
  rowHeaders,
  columnHeaders,
  type,
  matrixPlaceholdersArray,
}: CreateEmptyMatrixParams): StaticMatrixData {
  const newMatrix: StaticMatrixData = {};

  rowHeaders.forEach((r, rIdx) => {
    newMatrix[rIdx] = [];
    columnHeaders.forEach((c) => {
      newMatrix[rIdx].push({
        id: null,
        value: "",
        public_value: "",
        ...(type !== "placeholder"
          ? {
              placeholder:
                matrixPlaceholdersArray?.[r.slug + "-" + c.slug] ?? null,
            }
          : {}),
        row_slug: r.slug,
        col_slug: c.slug,
        type: c.form_type?.name || "text",
      });
    });
  });

  return newMatrix;
}
