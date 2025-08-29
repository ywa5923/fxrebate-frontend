"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FormTypeItem {
  name: string;
  type: string;
  placeholder: string;
  required: boolean;
  options: {
    value: string;
    label: string;
  }[];
}

interface FormType {
  name: string;
  items: FormTypeItem[];
}

interface ColumnHeader {
  slug: string;
  name: string;
  form_type: FormType;
}

interface RowHeader {
  slug: string;
  name: string;
}

interface MatrixCellValue {
  [key: string]: string | number | boolean;
}

interface MatrixCell {
  value: MatrixCellValue;
  public_value?: MatrixCellValue;
  rowHeader: string;
  colHeader: string;
  type: string;
}

interface MatrixData {
  [rowIndex: number]: MatrixCell[];
}

interface StaticMatrixProps {
  rowHeaders: RowHeader[];
  columnHeaders: ColumnHeader[];
  initialMatrix?: MatrixData;
  is_admin?: boolean;
}

export default function StaticMatrix({ 
  rowHeaders, 
  columnHeaders, 
  initialMatrix = {}, 
  is_admin = false 
}: StaticMatrixProps) {
  const [matrixData, setMatrixData] = useState<MatrixData>(initialMatrix);

  // Initialize matrix data when headers change
  useEffect(() => {
    const newMatrixData: MatrixData = {};
    
    rowHeaders.forEach((rowHeader, rowIndex) => {
      newMatrixData[rowIndex] = [];
      
      columnHeaders.forEach((colHeader) => {
        const existingCell = initialMatrix[rowIndex]?.find(
          cell => cell.colHeader === colHeader.slug
        );
        
        if (existingCell) {
          newMatrixData[rowIndex].push(existingCell);
        } else {
          // Initialize empty cell
          newMatrixData[rowIndex].push({
            value: {},
            public_value: {},
            rowHeader: rowHeader.slug,
            colHeader: colHeader.slug,
            type: colHeader.form_type.name
          });
        }
      });
    });
    
    setMatrixData(newMatrixData);
  }, [rowHeaders, columnHeaders, initialMatrix]);

  const updateCellValue = (rowIndex: number, colIndex: number, fieldName: string, value: any) => {
    setMatrixData(prev => {
      const newData = { ...prev };
      if (!newData[rowIndex]) {
        newData[rowIndex] = [];
      }
      
      const cell = { ...newData[rowIndex][colIndex] };
      const newValue = { ...cell.value };
      newValue[fieldName] = value;
      
      cell.value = newValue;
      newData[rowIndex][colIndex] = cell;
      
      return newData;
    });
  };

  const renderFormField = (item: FormTypeItem, cell: MatrixCell, rowIndex: number, colIndex: number) => {
    const currentValue = cell.value[item.name] || '';

    switch (item.type) {
      case 'text':
        return (
          <Input
            value={currentValue}
            onChange={(e) => updateCellValue(rowIndex, colIndex, item.name, e.target.value)}
            placeholder={item.placeholder}
            className="w-full"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => updateCellValue(rowIndex, colIndex, item.name, e.target.value)}
            placeholder={item.placeholder}
            className="w-full"
            rows={2}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => updateCellValue(rowIndex, colIndex, item.name, e.target.value)}
            placeholder={item.placeholder}
            className="w-full"
          />
        );

      case 'single-select':
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => updateCellValue(rowIndex, colIndex, item.name, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={item.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {item.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];
        return (
          <div className="space-y-2">
            {item.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${rowIndex}-${colIndex}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    updateCellValue(rowIndex, colIndex, item.name, newValues);
                  }}
                />
                <Label htmlFor={`${rowIndex}-${colIndex}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={currentValue}
            onValueChange={(value) => updateCellValue(rowIndex, colIndex, item.name, value)}
          >
            {item.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${rowIndex}-${colIndex}-${option.value}`} />
                <Label htmlFor={`${rowIndex}-${colIndex}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => updateCellValue(rowIndex, colIndex, item.name, e.target.value)}
            placeholder={item.placeholder}
            className="w-full"
          />
        );
    }
  };

  const renderCell = (cell: MatrixCell, rowIndex: number, colIndex: number) => {
    const columnHeader = columnHeaders[colIndex];
    
    return (
      <div className="space-y-2">
        {columnHeader.form_type.items.map((item, itemIndex) => (
          <div key={itemIndex}>
            {renderFormField(item, cell, rowIndex, colIndex)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4" style={{
            gridTemplateColumns: `200px repeat(${columnHeaders.length}, 1fr)`
          }}>
            {/* Header row */}
            <div className="font-semibold text-gray-700 dark:text-gray-300 p-2 border-b">
              Row / Column
            </div>
            {columnHeaders.map((header, index) => (
              <div key={index} className="font-semibold text-gray-700 dark:text-gray-300 p-2 border-b text-center">
                {header.name}
              </div>
            ))}

            {/* Data rows */}
            {rowHeaders.map((rowHeader, rowIndex) => (
              <div key={`row-${rowIndex}`} className="contents">
                <div className="font-medium text-gray-600 dark:text-gray-400 p-2 border-r">
                  {rowHeader.name}
                </div>
                {columnHeaders.map((colHeader, colIndex) => (
                  <div key={`cell-${rowIndex}-${colIndex}`} className="p-2 border">
                    {matrixData[rowIndex] && matrixData[rowIndex][colIndex] ? (
                      renderCell(matrixData[rowIndex][colIndex], rowIndex, colIndex)
                    ) : (
                      <div className="text-gray-400 text-sm">No data</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
