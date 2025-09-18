"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getChallengeHeaders } from "@/lib/challenge-requests";
import { ColumnHeader, RowHeader, MatrixCellValue, MatrixCell, MatrixData } from "@/types/Matrix";
import { BASE_URL } from "@/constants";
import { toast } from "sonner";
import { getChallengeData } from "@/lib/challenge-requests";
import { cn } from "@/lib/utils";

interface StaticMatrixProps {
  brokerId: number ;
  categoryId: number ;
  stepId: number ;
  stepSlug: string;
  amountId: number ;
  zoneId: string | null;
  language: string;
  type: "challenge" | "placeholder";
  is_admin: boolean;
}

export default function StaticMatrix({ brokerId, categoryId, stepId, stepSlug, amountId, language = "en", type = "challenge", zoneId=null, is_admin=false }: StaticMatrixProps) {
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeader[]>([]);
  const [rowHeaders, setRowHeaders] = useState<RowHeader[]>([]);
  const [matrixData, setMatrixData] = useState<MatrixData>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  const formatText = (value: any): string => {
    if (value == null) return "";
    if (typeof value === "object") {
      if ("text" in value) return String(value.text ?? "");
      try { return JSON.stringify(value); } catch { return String(value); }
    }
    return String(value);
  };

  // Fetch headers and initial data when step changes
  useEffect(() => {
    const loadHeadersAndData = async () => {
      if (!stepSlug || !categoryId || !stepId) {
        setColumnHeaders([]);
        setRowHeaders([]);
        setMatrixData({});
        return;
      }
      setLoading(true);
      try {
        // Fetch headers
        const { columnHeaders, rowHeaders } = await getChallengeHeaders(language, stepSlug, "challenge");
        console.log("Headers:", columnHeaders, rowHeaders);
        
        // Set headers immediately to prevent layout shift
        setColumnHeaders(columnHeaders);
        setRowHeaders(rowHeaders);

        // Fetch initial data
        //if the matrix is use to save placeholders data,the amountId will be null because placeholders differs only by step
        const amountIdParam: string | null = type === "challenge" ? amountId.toString()  : null;
        const {initialData, is_placeholder} = await getChallengeData(
          brokerId.toString(),
          type === "placeholder" ? "1" : "0", 
          categoryId.toString(), 
          stepId.toString(), 
          amountIdParam,
          language, 
          zoneId ? zoneId.toString() : null);
        console.log("Initial data:", initialData);
        console.log("Type:", type, "is_admin:", is_admin, "is_placeholder:", is_placeholder);
        
        // Set the placeholder state
        setIsPlaceholder(is_placeholder || false);
        
        if (initialData && Object.keys(initialData).length > 0) {
          // If placeholder mode, preserve original values but clear display values
          if (is_placeholder && type === "challenge") {
            const placeholderData = { ...initialData };
            Object.keys(placeholderData).forEach(rowKey => {
              if (placeholderData[rowKey]) {
                placeholderData[rowKey] = placeholderData[rowKey].map((cell: any) => ({
                  ...cell,
                  // Keep original value for placeholder display, but clear the display value
                  value: { text: "" }, // Clear so it shows as placeholder
                  public_value: { text: "" }, // Clear public_value too
                  // Store original value in a separate field for placeholder
                  originalValue: cell.value
                }));
              }
            });
            console.log("Processed data for placeholder mode:", placeholderData);
            setMatrixData(placeholderData);
          } else if (is_admin) {
            // If admin mode, ensure public_value is populated from value if empty
            const processedData = { ...initialData };
            Object.keys(processedData).forEach(rowKey => {
              if (processedData[rowKey]) {
                processedData[rowKey] = processedData[rowKey].map((cell: any) => {
                  // Check if public_value is empty or has null values
                  const hasPublicValue = cell.public_value && 
                    Object.keys(cell.public_value).length > 0 && 
                    Object.values(cell.public_value).some(val => val !== null && val !== undefined && val !== "");
                  
                  return {
                    ...cell,
                    public_value: hasPublicValue ? cell.public_value : cell.value
                  };
                });
              }
            });
            console.log("Processed data for admin:", processedData);
            setMatrixData(processedData);
          } else {
            setMatrixData(initialData);
          }
        } else {
          // Create empty matrix structure
          console.log("No initial data, creating empty matrix structure");
          const newMatrix: MatrixData = {};
          rowHeaders.forEach((r, rIdx) => {
            newMatrix[rIdx] = [];
            columnHeaders.forEach((c) => {
              newMatrix[rIdx].push({
                value: {"text": ""},
                public_value: {"text": ""},
                rowHeader: r.slug,
                colHeader: c.slug,
                type: c.form_type?.name || "text"
              });
            });
          });
          console.log("Created matrix in first useEffect:", newMatrix);
          setMatrixData(newMatrix);
        }
        
      } catch (e) {
        console.error("Failed to load headers or data", e);
        setColumnHeaders([]);
        setRowHeaders([]);
      } finally {
        setLoading(false);
      }
    };
    loadHeadersAndData();
  }, [language,  categoryId, stepId, amountId, zoneId]);



  const updateCellValue = (rowIndex: number, colIndex: number, fieldName: string, value: any) => {
    setMatrixData(prev => {
      const next: MatrixData = { ...prev };
      const row = [...(next[rowIndex] || [])];
      const cell = { ...(row[colIndex] || {}) } as MatrixCell;
      
      if (is_admin) {
        // In admin mode, update public_value
        cell.public_value = { ...(cell.public_value || {}), [fieldName]: value };
      } else {
        // In normal mode, update value
        cell.value = { ...(cell.value || {}), [fieldName]: value };
      }
    
      row[colIndex] = cell;
      next[rowIndex] = row;
      return next;
    });
  };

  const renderFormField = (cell: MatrixCell, rowIndex: number, colIndex: number, isPlaceholder: boolean) => {
    // In admin mode, use public_value for input, otherwise use value
    const sourceValue = is_admin ? cell.public_value : cell.value;
    

    
    // Handle different value types from API
    let rawValue = "";
    let placeholderText = "Enter text";
    
    if (sourceValue && typeof sourceValue === "object") {
      if ("text" in sourceValue) {
        rawValue = String(sourceValue.text || "");
      } else if (Array.isArray(sourceValue) && sourceValue.length > 0) {
        // Handle case where value is an array with text
        rawValue = String(sourceValue[0] || "");
      }
    }
    
    // If is_placeholder=true and type="challenge", use originalValue as placeholder
    if (isPlaceholder && type === "challenge" && (cell as any).originalValue && typeof (cell as any).originalValue === "object" && "text" in (cell as any).originalValue) {
      placeholderText = String((cell as any).originalValue.text || "Enter text");
      // Don't clear rawValue here - let the user type normally
      // rawValue = ""; // This was causing the issue!
    }
    
    const asString = (v: unknown) => (v === undefined || v === null ? "" : String(v));

    return (
      <div className="space-y-1 w-full h-full flex flex-col">
        <Input
          value={asString(rawValue)}
          onChange={(e) => updateCellValue(rowIndex, colIndex, "text", e.target.value)}
          placeholder={placeholderText}
          className="w-full h-full min-h-[2.5rem] flex-1"
        />
        {is_admin && (
          
          <div className={cn("flex flex-row gap-1 items-center",{
            "text-red-500 dark:text-red-400": cell.is_updated_entry,
            "text-gray-500 dark:text-gray-400": !cell.is_updated_entry,
          })}>
            
          <div className="text-xs min-h-[1rem] flex-shrink-0" key={`${rowIndex}-${colIndex}-broker-value`}>
            Broker value: {isPlaceholder && type === "challenge" 
              ? "" 
              : formatText(cell.value)}
          </div>
          {!!cell.is_updated_entry && (
          <div className="text-xs min-h-[1rem] flex-shrink-0" key={`${rowIndex}-${colIndex}-previous-value`}>
           Previous value: {isPlaceholder && type === "challenge" 
            ? "" 
            : formatText(cell.previous_value)}
         </div>
         )}
         
        </div>
          

        )}
      </div>
    );
  };

  const renderCell = (cell: MatrixCell, rowIndex: number, colIndex: number) => {
    return (
      <div className="w-full h-full">
        <div key={`${rowIndex}-${colIndex}-${cell.colHeader}`} className="w-full h-full">
          {renderFormField(cell, rowIndex, colIndex, isPlaceholder)}
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        category_id: categoryId,
        step_id: stepId,
        step_slug: stepSlug,
        broker_id: brokerId,
        is_placeholder: type === "placeholder",
        ...(type === "challenge") ? {
          amount_id: amountId,
        } : {},
        matrix: matrixData,
      };
      console.log("Saving payload:", payload);
      const res = await fetch(BASE_URL+"/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      toast.success("Matrix data saved successfully");
      console.log("Saved successfully:", data);
    } catch (e) {
      console.error("Failed to save", e);
      toast.error("Error saving matrix data");
    } finally {
      setSaving(false);
    }
  };

  // Show loading overlay instead of replacing entire layout
  const renderLoadingOverlay = () => {
    if (!loading) return null;
    return (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading matrix...</span>
        </div>
      </div>
    );
  };



  // Show empty state if no headers
  if (columnHeaders.length === 0 || rowHeaders.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-4 flex justify-end">
          <Button disabled={saving || !stepSlug} onClick={handleSave} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg shadow-lg">
            {saving ? "Saving..." : "Save Table"}
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No matrix data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <Button disabled={saving || !stepSlug} onClick={handleSave} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg shadow-lg">
          {saving ? "Saving..." : "Save Table"}
        </Button>
      </div>
      <Card className="relative">
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <div 
              className="grid gap-4 min-w-max" 
              style={{ 
                gridTemplateColumns: columnHeaders.length > 0 
                  ? `200px repeat(${columnHeaders.length}, minmax(150px, 1fr))` 
                  : `200px repeat(3, minmax(150px, 1fr))` 
              }}
            >
            <div className="font-semibold text-gray-700 dark:text-gray-300 p-2 border-b min-h-[2.5rem] flex items-center">Row / Column</div>
            {columnHeaders.length > 0 ? (
              columnHeaders.map((header, index) => (
                <div key={index} className="font-semibold text-gray-700 dark:text-gray-300 p-2 border-b text-center min-h-[2.5rem] flex items-center justify-center">
                  {header.name}
                </div>
              ))
            ) : (
              // Show skeleton headers when loading
              [1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))
            )}
            {rowHeaders.length > 0 ? (
              rowHeaders.map((rowHeader, rowIndex) => (
                <div key={`row-${rowIndex}`} className="contents">
                  <div className="font-medium text-gray-600 dark:text-gray-400 p-2 border-r min-h-[4rem] flex items-center">{rowHeader.name}</div>
                  {columnHeaders.map((colHeader, colIndex) => {
                    const cellData = matrixData[rowIndex] && matrixData[rowIndex][colIndex];
                    return (
                      <div key={`cell-${rowIndex}-${colIndex}`} className="p-2 border min-h-[4rem] flex items-center">
                        {cellData
                          ? renderCell(cellData, rowIndex, colIndex)
                          : <div className="text-gray-400 text-sm w-full">No data</div>}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              // Show skeleton rows when loading
              [1, 2, 3, 4].map((row) => (
                <div key={`skeleton-row-${row}`} className="contents">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  {[1, 2, 3].map((col) => (
                    <div key={`skeleton-cell-${row}-${col}`} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ))
            )}
            </div>
          </div>
        </CardContent>
        {renderLoadingOverlay()}
      </Card>
    </div>
  );
}