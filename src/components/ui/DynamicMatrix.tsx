"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, X, Save, Copy } from "lucide-react";
import { CreateSelect } from "@/components/CreateSelect";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateMultiSelect } from "@/components/CreateMultiSelect";
import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";
import { ColumnHeader, MatrixData, MatrixCell, RowHeader } from "@/types";
import { saveMatrixData } from "@/lib/matrix-requests";

// interface DynamicMatrixProps {
//   rowHeaders: string[]
//   columnHeaders: {
//     value: string
//     type?: 'numberWithUnit' | 'numberWithReferenceWithUnit'
//     units?: string[]
//     references?: string[]
//   }[]
//   onChange?: (matrix: MatrixCell[][]) => void
// }

interface DynamicMatrixProps {
  // rowHeaders: {
  //   name: string;
  //   slug: string;
  //   options: { value: string; label: string }[];
  // }[];
  // columnHeaders: {
  //   name: string;
  //   slug: string;
  //   form_type: {
  //     name: string;
  //     items: {
  //       name: string;
  //       type: "number" | "single-select" | "multi-select" | "text" | "textarea";
  //       placeholder?: string;
  //       required?: boolean;
  //       options?: {
  //         value: string;
  //         label: string;
  //       }[];
  //     }[];
  //   };
  // }[];
  rowHeaders: RowHeader[];
  columnHeaders: ColumnHeader[];
  onChange?: (matrix: MatrixCell[][]) => void;
  initialMatrix?: MatrixCell[][];
  //initialMatrix: MatrixData
  is_admin: boolean;
  brokerId: number;
}

export function DynamicMatrix({
  rowHeaders,
  columnHeaders,
  onChange,
  initialMatrix,
  is_admin,
  brokerId,
}: DynamicMatrixProps) {
  const [status, setStatus] = React.useState<string>("");
  // Track copied cells so the copy button persists and stays green
  // Key format: `${rowIndex}-${colIndex}`
  const [copiedCells, setCopiedCells] = React.useState<Set<string>>(new Set());
  const [matrix, saveMatrix] = React.useState<MatrixCell[][]>(
    initialMatrix || ([[]] as MatrixCell[][])
  );
  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string[];
  }>({});

  const [existingColumnHeaders, setExistingColumnHeaders] = React.useState<
    string[]
  >(columnHeaders.map((h) => h.name));

  const setMatrix = (matrix: MatrixCell[][]) => {
    saveMatrix(matrix);
    setStatus("");
    setValidationErrors({});
  };

  const validateMatrix = () => {
    const errors: { [key: string]: string[] } = {};

    matrix.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.colHeader) {
          const columnHeader = columnHeaders.find(
            (h) => h.slug === cell.colHeader
          );
          const cellErrors: string[] = [];

          // Check if row header is selected
          if (!cell.rowHeader) {
            cellErrors.push("Row header is required");
          }

          // Check if required fields are filled
          columnHeader?.form_type.items.forEach((item) => {
            const value = is_admin
              ? cell.public_value?.[item.name] || ""
              : cell.value?.[item.name] || "";

            if (!value && item.required !== false) {
              cellErrors.push(`${item.name} is required`);
            }
          });

          if (cellErrors.length > 0) {
            errors[`${rowIndex}-${colIndex}`] = cellErrors;
          }
        }
      });
    });

    return errors;
  };

  const addRow = () => {
    if (matrix.length === 0 || matrix[0].length === 0) {
      const initialCell: MatrixCell = {
        value: {},
        public_value: {},
        rowHeader: rowHeaders[0]?.slug,
        colHeader: columnHeaders[0]?.slug,
        type: columnHeaders[0]?.form_type.name,
      };
      setMatrix([[initialCell]]);
      return;
    }

    const newRow = matrix[0].map((cell) => {
      const columnHeader = columnHeaders.find((h) => h.slug === cell.colHeader);
      const newCell: MatrixCell = {
        value: {},
        public_value: {},
        rowHeader: rowHeaders[0]?.slug || "",
        colHeader: cell.colHeader,
        type: columnHeader?.form_type.name,
      };
      return newCell;
    });
    setMatrix([...matrix, newRow]);
  };

  const removeRow = (rowIndex: number) => {
    const newMatrix = matrix.filter((_, index) => index !== rowIndex);
    setMatrix(newMatrix);
    onChange?.(newMatrix);
  };

  const addColumn = () => {
    if (matrix.length === 0) {
      const initialCell: MatrixCell = {
        value: {},
        public_value: {},
        rowHeader: rowHeaders[0]?.slug,
        colHeader: "",
        type: undefined,
      };
      setMatrix([[initialCell]]);
      return;
    }

    const newMatrix = matrix.map((row) => {
      const currentRowHeader = row[0]?.rowHeader || rowHeaders[0]?.slug || "";
      const newCell: MatrixCell = {
        value: {},
        public_value: {},
        rowHeader: currentRowHeader,
        colHeader: "",
        type: undefined,
      };
      return [...row, newCell];
    });
    setMatrix(newMatrix);
  };

  const removeColumn = (colIndex: number) => {
    const newMatrix = matrix.map((row) =>
      row.filter((_, index) => index !== colIndex)
    );
    setMatrix(newMatrix);
    onChange?.(newMatrix);
  };

  const loadDefaultPublicValues = (initialMatrix: MatrixCell[][]) => {
    const newMatrix = initialMatrix.map((row) =>
      row.map((cell) => {
        if (
          is_admin &&
          (!cell.public_value || Object.keys(cell.public_value).length === 0)
        ) {
          return {
            ...cell,
            public_value: cell.value,
          };
        }
        return cell;
      })
    );
    setMatrix(newMatrix);
  };

  const updateCell = (
    rowIndex: number,
    colIndex: number,
    value: string,
    fieldName: string,
    is_admin: boolean
  ) => {
    const newMatrix = matrix.map((row, rIndex) =>
      //if admin is true, update public_value, else update value
      rIndex === rowIndex
        ? row.map((cell, cIndex) =>
            cIndex === colIndex && is_admin
              ? {
                  ...cell,
                  public_value: {
                    ...cell.public_value,
                    [fieldName]: value,
                  },
                  //reset the is_updated_entry to false
                  //if admin updates the value, then the is_updated_entry is false in case it was true 
                  is_updated_entry: false,
                }
              : cIndex === colIndex && !is_admin
              ? {
                  ...cell,
                  value: {
                    ...cell.value,
                    [fieldName]: value,
                  },
                }
              : cell
          )
        : row
    );
    setMatrix(newMatrix);
    onChange?.(newMatrix);
  };

  const copyBrokerToPublic = (rowIndex: number, colIndex: number) => {
    const newMatrix = matrix.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) =>
            cIndex === colIndex
              ? {
                  ...cell,
                  public_value: {
                    ...cell.public_value,
                    ...cell.value,
                  },
                  //reset the is_updated_entry to false
                  is_updated_entry: false,
                }
              : cell
          )
        : row
    );
    setMatrix(newMatrix);
    onChange?.(newMatrix);
  };

  const updateRowHeader = (rowIndex: number, header: string) => {
    const newMatrix = matrix.map((row, index) =>
      index === rowIndex
        ? row.map((cell, colIndex) => {
            if (colIndex === 0) {
              return {
                ...cell,
                rowHeader: header,
                selectedRowHeaderSubOptions: [],
              };
            }
            return { ...cell, rowHeader: header };
          })
        : row
    );
    setMatrix(newMatrix);
    onChange?.(newMatrix);
  };

  const updateColumnHeader = (colIndex: number, header: string) => {
    const columnHeader = columnHeaders.find((h) => h.slug === header);
    const newMatrix = matrix.map((row) =>
      row.map((cell, index) =>
        index === colIndex
          ? {
              ...cell,
              colHeader: header,
              type: columnHeader?.form_type.name,
              value: {},
            }
          : cell
      )
    );
    setMatrix(newMatrix);
    onChange?.(newMatrix);
  };

  const updateSelectedOptions = (
    rowIndex: number,
    selected: { value: string; label: string }[]
  ) => {
    const newMatrix = matrix.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) =>
            cIndex === 0 // Only update the first cell in the row
              ? {
                  ...cell,
                  selectedRowHeaderSubOptions: selected,
                }
              : cell
          )
        : row
    );
    setMatrix(newMatrix);
    onChange?.(newMatrix);
  };

  const handleSave = async () => {
    const errors = validateMatrix();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setStatus("error");
      toast.error("Validation errors");
      return;
    }

    setStatus("loading");
    setValidationErrors({});

    try {
      // const response = await fetch(
      //   "http://localhost:8080/api/v1/matrix/store",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Accept: "application/json",
      //     },
      //     body: JSON.stringify({
      //       matrix,
      //       broker_id: brokerId,
      //       matrix_name: "Matrix-1",
      //     }),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error("Failed to save matrix data");
      // }

      // const data = await response.json();
      const data = await saveMatrixData(
        is_admin,
        brokerId,
        "Matrix-1",
        matrix as MatrixCell[][]
      );
      setStatus("success");
      toast.success("Matrix data saved successfully");
      console.log("Matrix data saved successfully:", data);
    } catch (error) {
      console.error("Error saving matrix data:", error);
      setStatus("error");
      toast.error("Error saving matrix data");
    }
  };

  useEffect(() => {
    if (!initialMatrix) {
      addRow();
    } else {
      loadDefaultPublicValues(initialMatrix);
      //setMatrix(initialMatrix);
    }
  }, [initialMatrix]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={addRow}
          variant="outline"
          size="sm"
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Row
        </Button>
        <Button
          onClick={addColumn}
          variant="outline"
          size="sm"
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Column
        </Button>
        <Button
          onClick={handleSave}
          variant="outline"
          size="default"
          disabled={status === "loading"}
          className={`h-9 ml-auto ${
            status === "error"
              ? "bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
              : "bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
          }`}
        >
          <Save className="h-4 w-4 mr-2" />
          {status === "loading"
            ? "Saving..."
            : status === "success"
            ? "Saved"
            : status === "error"
            ? "Validation Errors"
            : "Save Matrix"}
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <div className="min-w-[300px] inline-block w-full">
          <table className="w-full">
            <thead>
              <tr>
                <th className="border p-1 bg-muted md:sticky left-0 z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[200px] overflow-visible md:overflow-visible">
                  <div className="min-w-[200px]">Row/Column</div>
                </th>
                {matrix[0]?.map((_, colIndex) => (
                  <th key={colIndex} className="border p-1 bg-muted w-[250px]">
                    <div className="flex items-center gap-1">
                      <div className="w-full">
                        <Select
                          value={matrix[0][colIndex]?.colHeader}
                          onValueChange={(value: string) => {
                            updateColumnHeader(colIndex, value);
                          }}
                        >
                          <SelectTrigger className="h-9 text-sm w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="z-[100]">
                            {columnHeaders.map((header) => (
                              <SelectItem
                                key={header.slug}
                                value={header.slug}
                                className="text-sm"
                              >
                                {header.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeColumn(colIndex)}
                        className="h-9 w-9 p-0 ml-1 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    rowIndex % 2 === 0 ? "bg-background" : "bg-green-50"
                  }
                >
                  <td
                    className={`border p-1 md:sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[200px] overflow-x-auto md:overflow-visible ${
                      rowIndex % 2 === 0 ? "bg-background" : "bg-green-50"
                    }`}
                  >
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className="w-full">
                          <CreateSelect
                            value={row[0]?.rowHeader}
                            onValueChange={(value: string) => {
                              updateRowHeader(rowIndex, value);
                            }}
                            options={rowHeaders.map((header) => ({
                              value: header.slug,
                              label: header.name,
                            }))}
                            placeholder="Select class of instruments"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(rowIndex)}
                          className="h-9 w-9 p-0 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div
                        className={`w-full min-h-[36px] ${
                          rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"
                        }`}
                      >
                        <CreateMultiSelect
                          placeholder="Select instruments"
                          options={
                            rowHeaders.find((h) => h.slug === row[0]?.rowHeader)
                              ?.options || []
                          }
                          initialSelected={
                            row[0]?.selectedRowHeaderSubOptions || []
                          }
                          onChange={(selected) => {
                            updateSelectedOptions(rowIndex, selected);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  {row.map((cell, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`;
                    const cellErrors = validationErrors[cellKey] || [];
                    const hasError = cellErrors.length > 0;
                    const isUpdatedCell = cell.is_updated_entry;

                    return (
                      <td key={colIndex} className="border p-1 w-[250px]">
                        {cell.colHeader ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-2 items-center">
                              {columnHeaders
                                .find((h) => h.slug === cell.colHeader)
                                ?.form_type.items.map((item, itemIndex) => {
                                  let public_value =
                                    cell.public_value?.[item.name] || "";
                                  let broker_value =
                                    cell.value?.[item.name] || "";
                                  let previous_value = cell.previous_value?.[item.name] || "";
                                  let value = is_admin
                                    ? public_value
                                    : broker_value;

                                  return (
                                    <React.Fragment key={item.name}>
                                      {item.type === "number" && (
                                        <div className="w-full">
                                          <Input
                                            type="text"
                                            value={value}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              updateCell(
                                                rowIndex,
                                                colIndex,
                                                value,
                                                item.name,
                                                is_admin || false
                                              );
                                            }}
                                            placeholder={
                                              item.placeholder || "Value"
                                            }
                                            className={`h-9 text-sm w-full ${
                                              hasError ? "border-red-500" : ""
                                            }`}
                                          />
                                        </div>
                                      )}
                                      {item.type === "single-select" && (
                                        <div className="w-full">
                                          <Select
                                            value={String(value)}
                                            onValueChange={(value: string) =>
                                              updateCell(
                                                rowIndex,
                                                colIndex,
                                                value,
                                                item.name,
                                                is_admin || false
                                              )
                                            }
                                          >
                                            <SelectTrigger
                                              className={`h-9 text-sm w-full ${
                                                hasError ? "border-red-500" : ""
                                              }`}
                                            >
                                              <SelectValue
                                                placeholder={
                                                  item.placeholder || "Select"
                                                }
                                              />
                                            </SelectTrigger>
                                            <SelectContent className="z-[100]">
                                              {item.options?.map((option) => (
                                                <SelectItem
                                                  key={option.value}
                                                  value={option.value}
                                                  className="text-sm"
                                                >
                                                  {option.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                      {item.type === "text" && (
                                        <div className="w-full">
                                          <Input
                                            type="text"
                                            value={value}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              updateCell(
                                                rowIndex,
                                                colIndex,
                                                value,
                                                item.name,
                                                is_admin || false
                                              );
                                            }}
                                            placeholder={
                                              item.placeholder || "Enter text"
                                            }
                                            className={`h-9 text-sm w-full ${
                                              hasError ? "border-red-500" : ""
                                            }`}
                                          />
                                        </div>
                                      )}
                                      {item.type === "textarea" && (
                                        <div className="w-full">
                                          <textarea
                                            value={value}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              updateCell(
                                                rowIndex,
                                                colIndex,
                                                value,
                                                item.name,
                                                is_admin || false
                                              );
                                            }}
                                            placeholder={
                                              item.placeholder || "Enter text"
                                            }
                                            className={`h-9 text-sm w-full min-h-[80px] p-2 rounded-md border border-input bg-background ${
                                              hasError ? "border-red-500" : ""
                                            }`}
                                          />
                                        </div>
                                      )}
                                      {is_admin && (
                                        <div
                                          className={cn(
                                            "text-xs min-h-[1rem] flex-shrink-0 w-full",
                                            {
                                              "text-red-500 dark:text-red-400": isUpdatedCell && broker_value != previous_value,
                                              "text-gray-500 dark:text-gray-400": !isUpdatedCell,
                                            }
                                          )}
                                        >
                                          <div>Broker Value: {broker_value}</div>
                                          {broker_value != previous_value && <div>Previous Value: {previous_value}</div>}

                                        </div>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                            </div>
                            {(() => {
                              const cellKey = `${rowIndex}-${colIndex}`;
                              const shouldShowCopy = is_admin && (!!isUpdatedCell || copiedCells.has(cellKey));
                              if (!shouldShowCopy) return null;
                              const isAlreadyGreen = copiedCells.has(cellKey);
                              return (
                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      copyBrokerToPublic(rowIndex, colIndex);
                                      setCopiedCells((prev) => {
                                        const next = new Set(prev);
                                        next.add(cellKey);
                                        return next;
                                      });
                                      e.currentTarget.classList.add("bg-green-100", "border-green-500", "text-green-700");
                                    }}
                                    className={cn(
                                      "p-1 h-6 w-6 flex-shrink-0",
                                      isAlreadyGreen && "bg-green-100 border-green-500 text-green-700"
                                    )}
                                    title="Copy broker values to public values"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="h-9 w-full text-sm text-muted-foreground flex items-center">
                            Select column type
                          </div>
                        )}
                        {hasError && (
                          <div className="text-red-500 text-xs mt-1">
                            {cellErrors.join(", ")}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// {
//   matrix: [
//     [
//       {
//         value: { /* cell values */ },
//         rowHeader: "header_slug",
//         colHeader: "column_slug",
//         type: "type",
//         selectedOptions: [
//           { value: "option1", label: "Option 1" },
//           { value: "option2", label: "Option 2" }
//         ]
//       },
//       // ... other cells
//     ],
//     // ... other rows
//   ],
//   broker_id: 1,
//   matrix_id: "Matrix-1"
// }
