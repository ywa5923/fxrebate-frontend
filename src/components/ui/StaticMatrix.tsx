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

interface StaticMatrixProps {
  categoryId: number | null;
  stepId: number | null;
  stepSlug: string | null;
  amountId: number | null;
  zoneId: string | null;
  language?: string;
  type: "challenge" | "placeholder";
  is_admin: boolean;
}

export default function StaticMatrix({ categoryId, stepId, stepSlug, amountId, language = "en", type = "challenge", zoneId=null, is_admin=false }: StaticMatrixProps) {
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeader[]>([]);
  const [rowHeaders, setRowHeaders] = useState<RowHeader[]>([]);
  const [matrixData, setMatrixData] = useState<MatrixData>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

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
        setColumnHeaders(columnHeaders);
        setRowHeaders(rowHeaders);

        // Fetch initial data
        const {initialData, is_placeholder} = await getChallengeData(
          type === "placeholder" ? "1" : "0", 
          categoryId.toString(), 
          stepId.toString(), 
          amountId ? amountId.toString() : null,
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
  }, [language, stepSlug, categoryId, stepId, amountId, type]);



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
      <div className="space-y-1">
        <Input
          value={asString(rawValue)}
          onChange={(e) => updateCellValue(rowIndex, colIndex, "text", e.target.value)}
          placeholder={placeholderText}
          className="w-full"
        />
        {is_admin && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Broker value: {isPlaceholder && type === "challenge" 
              ? "" // Show empty in admin placeholder mode
              : (cell.value && typeof cell.value === "object" && "text" in cell.value 
                ? String(cell.value.text || "") 
                : "")}
          </div>
        )}
      </div>
    );
  };

  const renderCell = (cell: MatrixCell, rowIndex: number, colIndex: number) => {
    return (
      <div className="space-y-2">
        <div key={`${rowIndex}-${colIndex}-${cell.colHeader}`}>
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

  if (loading) {
    return (
      <div className="text-center mb-6">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading matrix...</p>
      </div>
    );
  }



  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4 flex justify-end">
        <Button disabled={saving || !stepSlug} onClick={handleSave} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg shadow-lg">
          {saving ? "Saving..." : "Save Table"}
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${columnHeaders.length}, 1fr)` }}>
            <div className="font-semibold text-gray-700 dark:text-gray-300 p-2 border-b">Row / Column</div>
            {columnHeaders.map((header, index) => (
              <div key={index} className="font-semibold text-gray-700 dark:text-gray-300 p-2 border-b text-center">
                {header.name}
              </div>
            ))}
            {rowHeaders.map((rowHeader, rowIndex) => (
              <div key={`row-${rowIndex}`} className="contents">
                <div className="font-medium text-gray-600 dark:text-gray-400 p-2 border-r">{rowHeader.name}</div>
                {columnHeaders.map((colHeader, colIndex) => {
                  const cellData = matrixData[rowIndex] && matrixData[rowIndex][colIndex];
                  return (
                    <div key={`cell-${rowIndex}-${colIndex}`} className="p-2 border">
                      {cellData
                        ? renderCell(cellData, rowIndex, colIndex)
                        : <div className="text-gray-400 text-sm">No data</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
