"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getChallengeHeaders } from "@/lib/challenge-requests";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FiCopy } from "react-icons/fi";
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

interface MatrixExtraData {
  affiliateLink: AffiliateLink;
  evaluationCostDiscount: EvaluationCostDiscount;
  masterAffiliateLink: AffiliateLink;
}

interface AffiliateLink {
  id?: number;
  url: string;
  public_url: string | null;
  old_url: string | null;
  is_updated_entry: number; // 1 or 0
  name: string;
  slug: string;
  zone_id?: number | null;
  placeholder?: string | null;
}

interface EvaluationCostDiscount {
  id?: number;
  public_value: string;
  broker_value: string;
  old_value: string;
  is_updated_entry: number; // 1 or 0
  zone_id?: number | null;
  placeholder?: string | null;
}

export default function StaticMatrix({ brokerId, categoryId, stepId, stepSlug, amountId, language = "en", type = "challenge", zoneId=null, is_admin=false }: StaticMatrixProps) {
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeader[]>([]);
  const [rowHeaders, setRowHeaders] = useState<RowHeader[]>([]);
  const [matrixData, setMatrixData] = useState<MatrixData>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [matrixExtraData, setMatrixExtraData] = useState<MatrixExtraData|null>(null);


  const formatText = (value: any): string => {
    if (value == null) return "";
    if (typeof value === "object") {
      if ("text" in value) return String(value.text ?? "");

     // try { return JSON.stringify(value); } catch { return String(value); }
    }
    return String(value);
  };

  // Validation helpers (applies only when is_admin is false)
  const isValueEmpty = (value: any): boolean => {
    if (value == null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (typeof value === "number") return false;
    if (typeof value === "boolean") return false;
    if (Array.isArray(value)) return value.length === 0 || value.every(isValueEmpty);
    if (typeof value === "object") {
      // Common API shape: { text: string }
      if ("text" in value) return isValueEmpty((value as any).text);
      const vals = Object.values(value as Record<string, unknown>);
      return vals.length === 0 || vals.every(isValueEmpty);
    }
    return false;
  };

  const isCellEmpty = (cell: MatrixCell): boolean => {
    // Validate broker value only (public_value is for admin)
    return isValueEmpty(cell?.value);
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
       let {initialData,
        affiliate_master_link, 
        affiliate_link, 
        evaluation_cost_discount,
        matrix_placeholders_array,
        affiliate_master_link_placeholder,
        affiliate_link_placeholder,
        evaluation_cost_discount_placeholder} = await getChallengeData(
          brokerId.toString(),
          type === "placeholder" ? "1" : "0", 
          categoryId.toString(), 
          stepId.toString(), 
          amountIdParam,
          language, 
          zoneId ? zoneId.toString() : null);
        
        // Set the placeholder state
        setIsPlaceholder(type === "placeholder" || false);

       
        if(is_admin && type === "challenge"){

          //if is admin and type is challenge and not placeholder, then:
          //if public data is empty, then  user data is transferred to public data
          //the admin see only public data, user see only user data

       let publicAffiliateLink = affiliate_link?.public_url ?? affiliate_link?.url;
       let publicEvaluationCostDiscount = evaluation_cost_discount?.public_value ?? evaluation_cost_discount?.broker_value;
       let publicMasterAffiliateLink = affiliate_master_link?.public_url ?? affiliate_master_link?.url;
      
        setMatrixExtraData({
          affiliateLink: {...affiliate_link,public_url: publicAffiliateLink,placeholder: affiliate_link_placeholder},
          evaluationCostDiscount: {...evaluation_cost_discount,public_value: publicEvaluationCostDiscount,placeholder: evaluation_cost_discount_placeholder},
          masterAffiliateLink: {...affiliate_master_link,public_url: publicMasterAffiliateLink,placeholder: affiliate_master_link_placeholder},
        });

        

        
      }else{
         //for user and in placeholder mode, the data is the same as received from the API
        setMatrixExtraData({
          affiliateLink: {...affiliate_link,placeholder: affiliate_link_placeholder},
          evaluationCostDiscount: {...evaluation_cost_discount,placeholder: evaluation_cost_discount_placeholder},
          masterAffiliateLink: {...affiliate_master_link,placeholder: affiliate_master_link_placeholder},
        });
      }

      
        if (initialData && Object.keys(initialData).length > 0) {
          
           if ( type === "challenge") {
            // If admin mode, ensure public_value is populated from value if empty
            const processedData = { ...initialData };
            Object.keys(processedData).forEach(rowKey => {
              if (processedData[rowKey]) {
                processedData[rowKey] = processedData[rowKey].map((cell: any) => {
                  // Check if public_value is empty or has null values
                  const isNewEntry = cell.is_updated_entry;
                  const hasPublicValue = cell.public_value && 
                    Object.keys(cell.public_value).length > 0 && 
                    Object.values(cell.public_value).some(val => val !== null && val !== undefined && val !== "");
                  
                    let publicValue = is_admin ? (hasPublicValue ? cell.public_value : cell.value) : cell.public_value;

                   // console.log("------------plaxeholder:", matrix_placeholders_array[cell.rowHeader+'-'+cell.colHeader]);
                  return {
                    ...cell,
                    public_value: publicValue,
                    placeholder: matrix_placeholders_array[cell.rowHeader+'-'+cell.colHeader]??null
                    //public_value: hasPublicValue ? (isNewEntry ? cell.value : cell.public_value) : cell.value
                    //public_value: isNewEntry ? cell.value : (hasPublicValue ? cell.public_value : cell.value),
                    //...(isNewEntry ? { old_public_value: cell.public_value } : {})
                  };
                });
              }
            });
            console.log("------------Processed data for admin:", processedData);
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
                placeholder: matrix_placeholders_array[r.slug+'-'+c.slug]??null,
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
      
      if (is_admin && type === "challenge" && !isPlaceholder) {
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

  const CopyValueToPublicValue = (rowIndex: number, colIndex: number, fieldName: string) => {
    setMatrixData((prev)=>{
      const next: MatrixData = { ...prev };
      const row = [...(next[rowIndex] || [])];
      const cell = { ...(row[colIndex] || {}) } as MatrixCell;
      cell.public_value = { ...(cell.public_value || {}), [fieldName]: cell.value[fieldName] };
      row[colIndex] = cell;
      next[rowIndex] = row;
      return next;
    });
  
  }

  const renderFormField = (cell: MatrixCell, rowIndex: number, colIndex: number, isPlaceholder: boolean, showError: boolean) => {
    // In admin mode, use public_value for input, otherwise use value
    //const sourceValue = is_admin ? (cell.is_updated_entry ? cell.value : cell.public_value) : cell.value;
    const sourceValue = is_admin ? cell.public_value : cell.value;
    // Handle different value types from API
    let rawValue = "";
    let placeholderText = (type === "placeholder")?"Enter placeholder value": cell?.placeholder?? "Enter text";
  
    
    if (sourceValue && typeof sourceValue === "object") {
      if ("text" in sourceValue) {
        rawValue = String(sourceValue.text || "");
      } else if (Array.isArray(sourceValue) && sourceValue.length > 0) {
        // Handle case where value is an array with text
        rawValue = String(sourceValue[0] || "");
      }
    }
    
    // If is_placeholder=true and type="challenge", use originalValue as placeholder
    // if (isPlaceholder && type === "challenge" && (cell as any).originalValue && typeof (cell as any).originalValue === "object" && "text" in (cell as any).originalValue) {
    //   placeholderText = String((cell as any).originalValue.text || "Enter text");
    //   // Don't clear rawValue here - let the user type normally
    //   // rawValue = ""; // This was causing the issue!
    // }
    
    const asString = (v: unknown) => (v === undefined || v === null ? "" : String(v));

    return (
      <div className="space-y-1 w-full h-full flex flex-col">
        <div className="flex items-center gap-2">
          <Input
            value={asString(rawValue)}
            onChange={(e) => updateCellValue(rowIndex, colIndex, "text", e.target.value)}
            placeholder={placeholderText}
            className={cn("flex-1 h-full min-h-[2.5rem]", !is_admin && showError && "border-red-500")}
          />
          {is_admin && !isPlaceholder && (
            <Button variant="outline" size="sm" onClick={() => CopyValueToPublicValue(rowIndex, colIndex, "text")} className="p-2">
              <FiCopy className="w-4 h-4" />
            </Button>
          )}
        </div>
        {!is_admin && showError && (
          <div className="text-xs text-red-600 dark:text-red-400 min-h-[1rem]">This field is required</div>
        )}
        {is_admin && !isPlaceholder && (
          <div className="flex flex-row gap-1 items-center">
            <div className={cn("text-xs min-h-[1rem] flex-shrink-0 flex items-center gap-2", {
              "text-red-500 dark:text-red-400": cell.is_updated_entry,
              "text-gray-500 dark:text-gray-400": !cell.is_updated_entry,
            })}>
              
             
              <span>Broker Value: {formatText(cell.value)}</span>&nbsp;

              {formatText(cell.previous_value)?.trim() ? (
                <span>Previous Value: {formatText(cell.previous_value)}</span>
              ) : <span>&nbsp;</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCell = (cell: MatrixCell, rowIndex: number, colIndex: number) => {
    const showError = !is_admin && showValidation && isCellEmpty(cell);
    return (
      <div className="w-full h-full">
        <div key={`${rowIndex}-${colIndex}-${cell.colHeader}`} className="w-full h-full">
          {renderFormField(cell, rowIndex, colIndex, isPlaceholder, showError)}
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check for empty cells if not admin
      if (!is_admin) {
        let  hasEmptyCells = Object.values(matrixData).some(row => 
          row.some((cell: MatrixCell) => isCellEmpty(cell))
        );

        hasEmptyCells=false;
        
        if (hasEmptyCells) {
         // setShowValidation(true);
          toast.error("Please fill in all required fields before saving");
          return;
        }
      }
      
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
        ...(type === "challenge" && !isPlaceholder) && {
          'affiliate_link': (is_admin)?matrixExtraData?.affiliateLink?.public_url:matrixExtraData?.affiliateLink?.url,
          'evaluation_cost_discount': (is_admin)?matrixExtraData?.evaluationCostDiscount?.public_value:matrixExtraData?.evaluationCostDiscount?.broker_value,
          'affiliate_master_link': (is_admin)?matrixExtraData?.masterAffiliateLink?.public_url:matrixExtraData?.masterAffiliateLink?.url,
        },
        ...(type === "placeholder") && {
          'affiliate_link': matrixExtraData?.affiliateLink?.url,
          'evaluation_cost_discount': matrixExtraData?.evaluationCostDiscount?.broker_value,
          'affiliate_master_link': matrixExtraData?.masterAffiliateLink?.url,
        }
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
      setShowValidation(true);
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
            {/* Affiliate link row (separate from matrix data) */}
           {(type === "challenge" || type === "placeholder" )&& <div className="contents">
              <div className="font-medium text-gray-600 dark:text-gray-400 p-2 border-r min-h-[4rem] flex items-center">Evaluation Cost Discount</div>
              <div
                className="p-2 border min-h-[4rem] flex flex-col"
                style={{ gridColumn: `span ${Math.max(columnHeaders.length, 1)} / span ${Math.max(columnHeaders.length, 1)}` }}
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={ is_admin ? matrixExtraData?.evaluationCostDiscount?.public_value ?? "" : matrixExtraData?.evaluationCostDiscount?.broker_value ?? ""}
                    placeholder={matrixExtraData?.evaluationCostDiscount?.placeholder ?? "Enter evaluation cost discount"}      
                    onChange={(e) =>
                      setMatrixExtraData((prev:any) => ({
                        ...prev,
                        evaluationCostDiscount: {
                          ...prev.evaluationCostDiscount,
                          [(is_admin && type === "challenge") ? "public_value" : "broker_value"]: e.target.value

                        },
                      }))
                    }
                  
                    className="flex-1"
                  />
                  {is_admin && type === "challenge" && !isPlaceholder && <Button variant="outline" size="sm" onClick={() => {
                   setMatrixExtraData((prev:any) => ({
                     ...prev,
                     evaluationCostDiscount: {
                       ...prev.evaluationCostDiscount,
                       public_value: prev.evaluationCostDiscount.broker_value
                     },
                   }))
                 }} className="p-2">
                   <FiCopy className="w-4 h-4" />
                 </Button>}
                </div>
               {is_admin && (
                 <div className={cn("text-xs", {
                  "text-red-500 dark:text-red-400": matrixExtraData?.evaluationCostDiscount?.is_updated_entry,
                  "text-gray-500 dark:text-gray-400": !matrixExtraData?.evaluationCostDiscount?.is_updated_entry,
                })}>
                   
                    &nbsp;Broker Value: {matrixExtraData?.evaluationCostDiscount?.broker_value ?? ""}
                    &nbsp;Previous Value: {matrixExtraData?.evaluationCostDiscount?.old_value ?? ""}
                 </div>
               )}
              </div>
              
              <div className="font-medium text-gray-600 dark:text-gray-400 p-2 border-r min-h-[4rem] flex items-center">Affiliate Link</div>
              <div
                className="p-2 border min-h-[4rem] flex flex-col"
                style={{ gridColumn: `span ${Math.max(columnHeaders.length, 1)} / span ${Math.max(columnHeaders.length, 1)}` }}
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={ is_admin ? matrixExtraData?.affiliateLink?.public_url ?? "" : matrixExtraData?.affiliateLink?.url ?? ""}
                    placeholder={matrixExtraData?.affiliateLink?.placeholder ?? "Enter affiliate link"}
                    onChange={(e) =>
                      setMatrixExtraData((prev:any) => ({
                        ...prev,
                        affiliateLink: {
                          ...prev.affiliateLink,
                          [(is_admin && type === "challenge") ? "public_url" : "url"]: e.target.value
                        },
                      }))
                    }
                          
                  
                    className="flex-1"
                  />
                  {is_admin && type === "challenge" && !isPlaceholder && <Button variant="outline" size="sm" onClick={() => {
                   setMatrixExtraData((prev:any) => ({
                     ...prev,
                     affiliateLink: {
                       ...prev.affiliateLink,
                       public_url: prev.affiliateLink.url
                     },
                   }))
                 }} className="p-2">
                   <FiCopy className="w-4 h-4" />
                 </Button>}
                </div>
                {is_admin && (
                  <div className={cn("text-xs mt-1", {
                    "text-red-500 dark:text-red-400": matrixExtraData?.affiliateLink?.is_updated_entry,
                    "text-gray-500 dark:text-gray-400": !matrixExtraData?.affiliateLink?.is_updated_entry,
                  })}>
                   
                    &nbsp;Broker Value: {matrixExtraData?.affiliateLink?.url ?? ""}
                     &nbsp;Previous Value: {matrixExtraData?.affiliateLink?.old_url ?? ""}
                  </div>
                )}
              </div>
              <div className="font-medium text-gray-600 dark:text-gray-400 p-2 border-r min-h-[4rem] flex items-center gap-2">
                <span>Master Affiliate Link</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs cursor-help text-green-800 dark:text-gray-400">(info)</span>
                  </TooltipTrigger>
                  <TooltipContent>Available for all challenges</TooltipContent>
                </Tooltip>
              </div>
              <div
                className="p-2 border min-h-[4rem] flex flex-col"
                style={{ gridColumn: `span ${Math.max(columnHeaders.length, 1)} / span ${Math.max(columnHeaders.length, 1)}` }}
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={ is_admin ? matrixExtraData?.masterAffiliateLink?.public_url ?? "" : matrixExtraData?.masterAffiliateLink?.url ?? ""}
                    placeholder={matrixExtraData?.masterAffiliateLink?.placeholder ?? "Enter affiliate link"}
                    onChange={(e) =>
                      setMatrixExtraData((prev:any) => ({
                        ...prev,
                        masterAffiliateLink: {
                          ...prev.masterAffiliateLink,
                          [(is_admin && type === "challenge") ? "public_url" : "url"]: e.target.value
                        },
                      }))
                    }
                    
                 
                    className="flex-1"
                  />
                  {is_admin && type === "challenge" && !isPlaceholder && <Button variant="outline" size="sm" onClick={() => {
                   setMatrixExtraData((prev:any) => ({
                     ...prev,
                     masterAffiliateLink: {
                       ...prev.masterAffiliateLink,
                       public_url: prev.masterAffiliateLink.url
                     },
                   }))
                 }} className="p-2">
                   <FiCopy className="w-4 h-4" />
                 </Button>}
                </div>
                
                {is_admin && (
                  <div className={cn("text-xs mt-1", {
                    "text-red-500 dark:text-red-400": matrixExtraData?.masterAffiliateLink?.is_updated_entry,
                    "text-gray-500 dark:text-gray-400": !matrixExtraData?.masterAffiliateLink?.is_updated_entry,
                  })}>
                     
                     &nbsp;Broker Value: {matrixExtraData?.masterAffiliateLink?.url ?? ""}
                     &nbsp;Previous Value: {matrixExtraData?.masterAffiliateLink?.old_url ?? ""}
                  </div>
                )}
              </div>
            </div>}
            </div>
          </div>
        </CardContent>
        {renderLoadingOverlay()}
      </Card>
    </div>
  );
}