"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, X, Save } from "lucide-react";
import { CreateSelect } from "@/components/CreateSelect";
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
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface MatrixCell {
  value: {
    [key: string]: string | number | undefined;
  };
  public_value?: {
    [key: string]: string | number | undefined;
  };
  rowHeader: string;
  colHeader: string;
  type?: string;
  selectedRowHeaderSubOptions?: { value: string; label: string }[];
}

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
  rowHeaders: {
    name: string;
    slug: string;
    options: { value: string; label: string }[];
  }[];
  columnHeaders: {
    name: string;
    slug: string;
    form_type: {
      name: string;
      items: {
        name: string;
        type: "number" | "single-select" | "multi-select" | "text" | "textarea";
        placeholder?: string;
        options?: {
          value: string;
          label: string;
        }[];
      }[];
    };
  }[];
  onChange?: (matrix: MatrixCell[][]) => void;
  initialMatrix?: MatrixCell[][];
  is_admin?: boolean;
}

export function DynamicMatrix({
  rowHeaders,
  columnHeaders,
  onChange,
  initialMatrix,
  is_admin,
}: DynamicMatrixProps) {
  const [status, setStatus] = React.useState<string>("");
  const [matrix, saveMatrix] = React.useState<MatrixCell[][]>(
    initialMatrix || [[]]
  );

  const [existingColumnHeaders, setExistingColumnHeaders] = React.useState<
    string[]
  >(columnHeaders.map((h) => h.name));

  const setMatrix = (matrix: MatrixCell[][]) => {
    saveMatrix(matrix);
    setStatus("");
  };

  const addRow = () => {
    if (matrix.length === 0 || matrix[0].length === 0) {
      const initialCell: MatrixCell = {
        value: {},
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
        rowHeader: rowHeaders[0]?.slug || "",
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
    setStatus("loading");

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/matrix/store",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            matrix,
            broker_id: 1,
            matrix_id: "Matrix-1",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save matrix data");
      }

      const data = await response.json();
      setStatus("success");
      console.log("Matrix data saved successfully:", data);
    } catch (error) {
      console.error("Error saving matrix data:", error);
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (!initialMatrix) {
      addRow();
    } else {
      setMatrix(initialMatrix);
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
          disabled={status === "loading" || status === "success"}
          className="h-9 ml-auto bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
        >
          <Save className="h-4 w-4 mr-2" />
          {status === "loading"
            ? "Saving..."
            : status === "success"
            ? "Saved"
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
                    rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"
                  }
                >
                  <td
                    className={`border p-1 md:sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[200px] overflow-x-auto md:overflow-visible ${
                      rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"
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
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border p-1 w-[250px]">
                      {cell.colHeader ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          {columnHeaders
                            .find((h) => h.slug === cell.colHeader)
                            ?.form_type.items.map((item, itemIndex) => {
                              let public_value =
                                cell.public_value?.[item.name] || "";
                              let broker_value = cell.value?.[item.name] || "";
                              //if public_value is empty, set it to broker_value
                              if (
                                !cell.public_value ||
                                Object.keys(cell.public_value).length === 0
                              ) {
                                public_value = broker_value;
                              }
                              let value = is_admin
                                ? public_value
                                : broker_value;
                              return (
                                <React.Fragment key={item.name}>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground">Broker Value</span>
                                        <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{broker_value}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {item.type === "number" && (
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
                                          is_admin
                                        );
                                      }}
                                      placeholder={item.placeholder || "Value"}
                                      className="h-9 text-sm w-full"
                                    />
                                  )}
                                  {item.type === "single-select" && (
                                    <Select
                                      value={String(value)}
                                      onValueChange={(value: string) =>
                                        updateCell(
                                          rowIndex,
                                          colIndex,
                                          value,
                                          item.name,
                                          is_admin
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-9 text-sm w-full">
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
                                  )}
                                  {item.type === "text" && (
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
                                          is_admin
                                        );
                                      }}
                                      placeholder={
                                        item.placeholder || "Enter text"
                                      }
                                      className="h-9 text-sm w-full"
                                    />
                                  )}
                                  {item.type === "textarea" && (
                                    <textarea
                                      value={value}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        updateCell(
                                          rowIndex,
                                          colIndex,
                                          value,
                                          item.name,
                                          is_admin
                                        );
                                      }}
                                      placeholder={
                                        item.placeholder || "Enter text"
                                      }
                                      className="h-9 text-sm w-full min-h-[80px] p-2 rounded-md border border-input bg-background"
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="h-9 w-full text-sm text-muted-foreground flex items-center">
                          Select column type
                        </div>
                      )}
                    </td>
                  ))}
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
