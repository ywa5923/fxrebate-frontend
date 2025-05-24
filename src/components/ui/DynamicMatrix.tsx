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
  value: string
  rowHeader: string
  colHeader: string
}

interface DynamicMatrixProps {
  rowHeaders: string[]
  columnHeaders: string[]
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
          value: '',
          rowHeader: rowHeaders[0] || '',
          colHeader: columnHeaders[0] || ''
        }
      ]])
      return
    }

    // Create new row with same number of columns as existing rows
    const newRow = matrix[0].map(cell => ({
      value: '',
      rowHeader: rowHeaders[matrix.length] || '',
      colHeader: cell.colHeader
    }))
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
          colHeader: columnHeaders[0] || ''
        }
      ]])
      return
    }

    // Add new column to all existing rows
    const newMatrix = matrix.map(row => [
      ...row,
      {
        value: '',
        rowHeader: row[0].rowHeader,
        colHeader: columnHeaders[row.length] || ''
      }
    ])
    setMatrix(newMatrix)
  }

  const removeColumn = (colIndex: number) => {
    const newMatrix = matrix.map(row => row.filter((_, index) => index !== colIndex))
    setMatrix(newMatrix)
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newMatrix = matrix.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) =>
            cIndex === colIndex ? { ...cell, value } : cell
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
                          <SelectItem key={header} value={header}>
                            {header}
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
                    <Input
                      value={cell.value}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      placeholder="Enter value"
                    />
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
