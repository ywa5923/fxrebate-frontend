"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, Minus, X } from "lucide-react"

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
  const [selectedRowHeaders, setSelectedRowHeaders] = React.useState<string[]>([])
  const [selectedColHeaders, setSelectedColHeaders] = React.useState<string[]>([])

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

    // Add new column to all existing rows
    const newMatrix = matrix.map(row => {
      const currentRowHeader = row[0]?.rowHeader || rowHeaders[0] || ''
      const columnHeader = columnHeaders[row.length]
      return [
        ...row,
        {
          value: columnHeader?.type === 'numberWithReferenceWithUnit'
            ? { value: 0, reference: columnHeader.references?.[0] || '', unit: columnHeader.units?.[0] || '' }
            : columnHeader?.type === 'numberWithUnit'
              ? { value: 0, unit: columnHeader.units?.[0] || '' }
              : '',
          rowHeader: currentRowHeader,
          colHeader: columnHeader?.value || '',
          type: columnHeader?.type
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
                        value: Number(value), 
                        reference: (cell.value as { value: number; reference: string; unit: string }).reference,
                        unit: (cell.value as { value: number; reference: string; unit: string }).unit
                      }
                    : cell.type === 'numberWithUnit'
                      ? { value: Number(value), unit: (cell.value as { value: number; unit: string }).unit }
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
    const newMatrix = matrix.map(row =>
      row.map((cell, index) =>
        index === colIndex ? { ...cell, colHeader: header } : cell
      )
    )
    setMatrix(newMatrix)
    onChange?.(newMatrix)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button onClick={addRow} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
        <Button onClick={addColumn} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border p-2 bg-muted">Row/Column</th>
              {matrix[0]?.map((_, colIndex) => (
                <th key={colIndex} className="border p-2 bg-muted">
                  <div className="flex items-center gap-2">
                    <Select
                      value={matrix[0][colIndex]?.colHeader}
                      onValueChange={(value) => updateColumnHeader(colIndex, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select header" />
                      </SelectTrigger>
                      <SelectContent>
                        {columnHeaders.map((header) => (
                          <SelectItem key={header.value} value={header.value}>
                            {header.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColumn(colIndex)}
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
                <td className="border p-2">
                  <div className="flex items-center gap-2">
                    <Select
                      value={row[0]?.rowHeader}
                      onValueChange={(value) => updateRowHeader(rowIndex, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select header" />
                      </SelectTrigger>
                      <SelectContent>
                        {rowHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(rowIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border p-2">
                    <div className="flex gap-2">
                      <Input
                        type={cell.type?.includes('number') ? 'number' : 'text'}
                        value={cell.type?.includes('number') 
                          ? (cell.value as { value: number; reference?: string; unit: string }).value 
                          : cell.value as string}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        placeholder="Enter value"
                      />
                      {cell.type === 'numberWithReferenceWithUnit' && (
                        <>
                          <Select
                            value={(cell.value as { value: number; reference: string; unit: string }).reference}
                            onValueChange={(reference) => updateCellReference(rowIndex, colIndex, reference)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Reference" />
                            </SelectTrigger>
                            <SelectContent>
                              {columnHeaders.find(h => h.value === cell.colHeader)?.references?.map((reference) => (
                                <SelectItem key={reference} value={reference}>
                                  {reference}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={(cell.value as { value: number; reference: string; unit: string }).unit}
                            onValueChange={(unit) => updateCellUnit(rowIndex, colIndex, unit)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {columnHeaders.find(h => h.value === cell.colHeader)?.units?.map((unit) => (
                                <SelectItem key={unit} value={unit}>
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
                          onValueChange={(unit) => updateCellUnit(rowIndex, colIndex, unit)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {columnHeaders.find(h => h.value === cell.colHeader)?.units?.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
