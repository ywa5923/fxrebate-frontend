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
  value: string | { value: number; unit: string } | { value: number; reference: string; unit: string }
  rowHeader: string
  colHeader: string
  type?: 'numberWithUnit' | 'numberWithReferenceWithUnit'
}

interface DynamicMatrixProps {
  rowHeaders: string[]
  columnHeaders: { 
    value: string
    type?: 'numberWithUnit' | 'numberWithReferenceWithUnit'
    units?: string[]
    references?: string[]
  }[]
  onChange?: (matrix: MatrixCell[][]) => void
}

export function DynamicMatrix({ rowHeaders, columnHeaders, onChange }: DynamicMatrixProps) {
  const [matrix, setMatrix] = React.useState<MatrixCell[][]>([[]])
  const [existingColumnHeaders, setExistingColumnHeaders] = React.useState<string[]>(columnHeaders.map(h => h.value))

 
  const addRow = () => {
    if (matrix.length === 0 || matrix[0].length === 0) {
      // If matrix is empty, create first row with one empty cell
      setMatrix([[
        {
          value: columnHeaders[0]?.type === 'numberWithReferenceWithUnit'
            ? { value: 0, reference: columnHeaders[0].references?.[0] || '', unit: columnHeaders[0].units?.[0] || '' }
            : columnHeaders[0]?.type === 'numberWithUnit'
              ? { value: 0, unit: columnHeaders[0].units?.[0] || '' }
              : '',
          rowHeader: rowHeaders[0] || '',
          colHeader: columnHeaders[0]?.value || '',
          type: columnHeaders[0]?.type
        }
      ]])
      return
    }
   

    // Create new row with same number of columns as existing rows
    const newRow = matrix[0].map(cell => {
      const columnHeader = columnHeaders.find(h => h.value === cell.colHeader)
      return {
        value: cell.type === 'numberWithReferenceWithUnit'
          ? { value: 0, reference: columnHeader?.references?.[0] || '', unit: columnHeader?.units?.[0] || '' }
          : cell.type === 'numberWithUnit'
            ? { value: 0, unit: columnHeader?.units?.[0] || '' }
            : '',
        rowHeader: rowHeaders[matrix.length] || '',
        colHeader: cell.colHeader,
        type: cell.type
      }
    })
    setMatrix([...matrix, newRow])
  }

  const removeRow = (rowIndex: number) => {
    const newMatrix = matrix.filter((_, index) => index !== rowIndex)
    setMatrix(newMatrix)
  }

  const addColumn = () => {
    if (matrix.length === 0) {
      // If matrix is empty, create first row with one empty cell
      setMatrix([[
        {
          value: '',
          rowHeader: rowHeaders[0] || '',
          colHeader: '',
          type: undefined
        }
      ]])
      return
    }

    // Add new column to all existing rows
    const newMatrix = matrix.map(row => {
      const currentRowHeader = row[0]?.rowHeader || rowHeaders[0] || ''
      return [
        ...row,
        {
          value: '',
          rowHeader: currentRowHeader,
          colHeader: '',
          type: undefined
        }
      ]
    })
    setMatrix(newMatrix)
  }

  const removeColumn = (colIndex: number) => {
    const newMatrix = matrix.map(row => row.filter((_, index) => index !== colIndex))
    setMatrix(newMatrix)
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string | number) => {
    const newMatrix = matrix.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) =>
            cIndex === colIndex
              ? {
                  ...cell,
                  value: cell.type === 'numberWithReferenceWithUnit'
                    ? { 
                        value: value === '' ? 0 : parseFloat(value as string) || 0, 
                        reference: (cell.value as { value: number; reference: string; unit: string }).reference,
                        unit: (cell.value as { value: number; reference: string; unit: string }).unit
                      }
                    : cell.type === 'numberWithUnit'
                      ? { value: value === '' ? 0 : parseFloat(value as string) || 0, unit: (cell.value as { value: number; unit: string }).unit }
                      : String(value)
                }
              : cell
          )
        : row
    )
    setMatrix(newMatrix)
    onChange?.(newMatrix)
  }

  const updateCellReference = (rowIndex: number, colIndex: number, reference: string) => {
    const newMatrix = matrix.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) =>
            cIndex === colIndex
              ? {
                  ...cell,
                  value: { 
                    ...(cell.value as { value: number; reference: string; unit: string }),
                    reference
                  }
                }
              : cell
          )
        : row
    )
    setMatrix(newMatrix)
    onChange?.(newMatrix)
  }

  const updateCellUnit = (rowIndex: number, colIndex: number, unit: string) => {
    const newMatrix = matrix.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) =>
            cIndex === colIndex
              ? {
                  ...cell,
                  value: cell.type === 'numberWithReferenceWithUnit'
                    ? { 
                        ...(cell.value as { value: number; reference: string; unit: string }),
                        unit
                      }
                    : { value: (cell.value as { value: number; unit: string }).value, unit }
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
    const columnHeader = columnHeaders.find(h => h.value === header)
    const newMatrix = matrix.map(row =>
      row.map((cell, index) =>
        index === colIndex 
          ? { 
              ...cell, 
              colHeader: header,
              type: columnHeader?.type,
              value: columnHeader?.type === 'numberWithReferenceWithUnit'
                ? { value: 0, reference: columnHeader.references?.[0] || '', unit: columnHeader.units?.[0] || '' }
                : columnHeader?.type === 'numberWithUnit'
                  ? { value: 0, unit: columnHeader.units?.[0] || '' }
                  : ''
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
                <th className="border p-1 bg-muted sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[200px]">Row/Column</th>
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
                          <SelectContent>
                            {existingColumnHeaders.map((header) => (
                              <SelectItem key={header} value={header} className="text-sm">
                                {header}
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
                <tr key={rowIndex}>
                  <td className="border p-1 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[200px]">
                    <div className="flex items-center gap-1">
                      <div className="w-full">
                        <CreateSelect
                          value={row[0]?.rowHeader}
                          options={rowHeaders.map(header => ({
                            label: header,
                            value: header
                          }))}
                          onValueChange={(value: string) => {
                            updateRowHeader(rowIndex, value)
                          }}
                          placeholder="Select class of instruments"
                          className="h-9 text-sm w-full"
                        />
                         <CreateMultiSelect placeholder="Select instruments" /> 
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(rowIndex)}
                        className="h-9 w-9 p-0 ml-1 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border p-1 bg-background w-[250px]">
                      {cell.colHeader ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <Input
                            type="text"
                            value={cell.type?.includes('number') 
                              ? String((cell.value as { value: number; reference?: string; unit: string }).value || '')
                              : cell.value as string}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateCell(rowIndex, colIndex, value)
                            }}
                            placeholder="Value"
                            className="h-9 text-sm w-full"
                          />
                          {cell.type === 'numberWithReferenceWithUnit' && (
                            <>
                              <Select
                                value={(cell.value as { value: number; reference: string; unit: string }).reference}
                                onValueChange={(reference: string) => updateCellReference(rowIndex, colIndex, reference)}
                              >
                                <SelectTrigger className="h-9 text-sm w-full">
                                  <SelectValue placeholder="Ref" />
                                </SelectTrigger>
                                <SelectContent>
                                  {columnHeaders.find(h => h.value === cell.colHeader)?.references?.map((ref) => (
                                    <SelectItem key={ref} value={ref} className="text-sm">
                                      {ref}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={(cell.value as { value: number; reference: string; unit: string }).unit}
                                onValueChange={(unit: string) => updateCellUnit(rowIndex, colIndex, unit)}
                              >
                                <SelectTrigger className="h-9 text-sm w-full">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {columnHeaders.find(h => h.value === cell.colHeader)?.units?.map((unit) => (
                                    <SelectItem key={unit} value={unit} className="text-sm">
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </>
                          )}
                          {cell.type === 'numberWithUnit' && (
                            <Select
                              value={(cell.value as { value: number; unit: string }).unit}
                              onValueChange={(unit: string) => updateCellUnit(rowIndex, colIndex, unit)}
                            >
                              <SelectTrigger className="h-9 text-sm w-full">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {columnHeaders.find(h => h.value === cell.colHeader)?.units?.map((unit) => (
                                  <SelectItem key={unit} value={unit} className="text-sm">
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
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
