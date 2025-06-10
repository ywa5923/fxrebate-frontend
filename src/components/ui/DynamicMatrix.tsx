"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, X } from "lucide-react"
import { CreateSelect } from "@/components/CreateSelect"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateMultiSelect } from "@/components/CreateMultiSelect"
import { useEffect } from "react"

interface MatrixCell {
  value: {
    number?: string
    select?: string
    select2?: string
    text?: string
    textarea?: string
  }
  rowHeader: string
  colHeader: string
  type?: 'numberWithUnit' | 'numberWithReferenceWithUnit' | 'numberWithSelect' | 'number' | 'numberWithSelectWithSelect' | 'text' | 'textarea' | 'textareaWithNumericWithSelect'
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
    name: string
    slug: string
    options: { value: string; label: string }[]
  }[]
  columnHeaders: { 
    name: string
    slug: string
    form_type: {
      name: 'numberWithUnit' | 'numberWithReferenceWithUnit' | 'numberWithSelect' | 'number' | 'numberWithSelectWithSelect' | 'text' | 'textarea' | 'textareaWithNumericWithSelect'
      items: {
        name: string
        type: 'number' | 'single-select' | 'multi-select' | 'text' | 'textarea'
        placeholder?: string
        options?: {
          value: string
          label: string
        }[]
      }[]
    }
  }[]
  onChange?: (matrix: MatrixCell[][]) => void
}

export function DynamicMatrix({ rowHeaders, columnHeaders, onChange }: DynamicMatrixProps) {
  const [matrix, setMatrix] = React.useState<MatrixCell[][]>(() => {
    if (rowHeaders.length === 0 || columnHeaders.length === 0) {
      return [[]]
    }
    return rowHeaders.map(rowHeader => 
      columnHeaders.map(colHeader => ({
        value: {
          number: '',
          select: '',
          select2: '',
          text: '',
          textarea: ''
        },
        rowHeader: rowHeader.slug,
        colHeader: colHeader.slug,
        type: colHeader.form_type.name
      }))
    )
  })
  const [existingColumnHeaders, setExistingColumnHeaders] = React.useState<string[]>(columnHeaders.map(h => h.name))

  const addRow = () => {
    if (matrix.length === 0 || matrix[0].length === 0) {
      const initialCell: MatrixCell = {
        value: {
          number: '',
          select: '',
          select2: '',
          text: '',
          textarea: ''
        },
        rowHeader: rowHeaders[0]?.slug || '',
        colHeader: columnHeaders[0]?.slug || '',
        type: columnHeaders[0]?.form_type.name
      }
      setMatrix([[initialCell]])
      return
    }

    const newRow = matrix[0].map(cell => {
      const columnHeader = columnHeaders.find(h => h.slug === cell.colHeader)
      const newCell: MatrixCell = {
        value: {
          number: '',
          select: '',
          select2: '',
          text: '',
          textarea: ''
        },
        rowHeader: rowHeaders[matrix.length]?.slug || '',
        colHeader: cell.colHeader,
        type: columnHeader?.form_type.name
      }
      return newCell
    })
    setMatrix([...matrix, newRow])
  }

  const removeRow = (rowIndex: number) => {
    const newMatrix = matrix.filter((_, index) => index !== rowIndex)
    setMatrix(newMatrix)
    onChange?.(newMatrix)
  }

  const addColumn = () => {
    if (matrix.length === 0) {
      const initialCell: MatrixCell = {
        value: {
          number: '',
          select: '',
          select2: '',
          text: '',
          textarea: ''
        },
        rowHeader: rowHeaders[0]?.slug || '',
        colHeader: '',
        type: undefined
      }
      setMatrix([[initialCell]])
      return
    }

    const newMatrix = matrix.map(row => {
      const currentRowHeader = row[0]?.rowHeader || rowHeaders[0]?.slug || ''
      const newCell: MatrixCell = {
        value: {
          number: '',
          select: '',
          select2: '',
          text: '',
          textarea: ''
        },
        rowHeader: currentRowHeader,
        colHeader: '',
        type: undefined
      }
      return [...row, newCell]
    })
    setMatrix(newMatrix)
  }

  const removeColumn = (colIndex: number) => {
    const newMatrix = matrix.map(row => row.filter((_, index) => index !== colIndex))
    setMatrix(newMatrix)
    onChange?.(newMatrix)
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string, fieldName: string) => {
    const newMatrix = matrix.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) =>
            cIndex === colIndex
              ? {
                  ...cell,
                  value: {
                    ...cell.value,
                    [fieldName]: value
                  }
                }
              : cell
          )
        : row
    )
    setMatrix(newMatrix)
    onChange?.(newMatrix)
  }

  const updateRowHeader = (rowIndex: number, header: string) => {
    const newMatrix = matrix.map((row, index) =>
      index === rowIndex
        ? row.map(cell => ({ ...cell, rowHeader: header }))
        : row
    )
    setMatrix(newMatrix)
    onChange?.(newMatrix)
  }

  const updateColumnHeader = (colIndex: number, header: string) => {
    const columnHeader = columnHeaders.find(h => h.slug === header)
    const newMatrix = matrix.map(row =>
      row.map((cell, index) =>
        index === colIndex 
          ? { 
              ...cell, 
              colHeader: header,
              type: columnHeader?.form_type.name,
              value: {
                number: '',
                select: '',
                select2: '',
                text: '',
                textarea: ''
              }
            }
          : cell
      )
    )
    setMatrix(newMatrix)
    onChange?.(newMatrix)
  }

  useEffect(() => {
    addRow()
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={addRow} variant="outline" size="sm" className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Add Row
        </Button>
        <Button onClick={addColumn} variant="outline" size="sm" className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Add Column
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
                            updateColumnHeader(colIndex, value)
                          }}
                        >
                          <SelectTrigger className="h-9 text-sm w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="z-[100]">
                            {columnHeaders.map((header) => (
                              <SelectItem key={header.slug} value={header.slug} className="text-sm">
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
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                  <td className={`border p-1 md:sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[200px] overflow-x-auto md:overflow-visible ${rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"}`}>
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Select
                          value={row[0]?.rowHeader}
                          onValueChange={(value: string) => {
                            updateRowHeader(rowIndex, value)
                          }}
                        >
                          <SelectTrigger className="h-9 text-sm w-full">
                            <SelectValue placeholder="Select class of instruments">
                              {rowHeaders.find(h => h.slug === row[0]?.rowHeader)?.name || "Select class of instruments"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {rowHeaders.map((header) => (
                              <SelectItem key={header.slug} value={header.slug} className="text-sm">
                                {header.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(rowIndex)}
                          className="h-9 w-9 p-0 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className={`w-full min-h-[36px] ${rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"}`}>
                        <CreateMultiSelect 
                          placeholder="Select multiple instruments"
                          options={rowHeaders.find(h => h.slug === row[0]?.rowHeader)?.options || []}
                        />
                      </div>
                    </div>
                  </td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border p-1 w-[250px]">
                      {cell.colHeader ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          {columnHeaders.find(h => h.slug === cell.colHeader)?.form_type.items.map((item, itemIndex) => (
                            <React.Fragment key={item.name}>
                              {item.type === 'number' && (
                                <Input
                                  type="text"
                                  value={cell.value?.number || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    updateCell(rowIndex, colIndex, value, 'number')
                                  }}
                                  placeholder={item.placeholder || "Value"}
                                  className="h-9 text-sm w-full"
                                />
                              )}
                              {item.type === 'single-select' && (
                                <Select
                                  value={cell.value?.select || ''}
                                  onValueChange={(value: string) => updateCell(rowIndex, colIndex, value, 'select')}
                                >
                                  <SelectTrigger className="h-9 text-sm w-full">
                                    <SelectValue placeholder={item.placeholder || "Select"} />
                                  </SelectTrigger>
                                  <SelectContent className="z-[100]">
                                    {item.options?.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-sm">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {item.type === 'text' && (
                                <Input
                                  type="text"
                                  value={cell.value?.text || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    updateCell(rowIndex, colIndex, value, 'text')
                                  }}
                                  placeholder={item.placeholder || "Enter text"}
                                  className="h-9 text-sm w-full"
                                />
                              )}
                              {item.type === 'textarea' && (
                                <textarea
                                  value={cell.value?.textarea || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    updateCell(rowIndex, colIndex, value, 'textarea')
                                  }}
                                  placeholder={item.placeholder || "Enter text"}
                                  className="h-9 text-sm w-full min-h-[80px] p-2 rounded-md border border-input bg-background"
                                />
                              )}
                            </React.Fragment>
                          ))}
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
  )
}
