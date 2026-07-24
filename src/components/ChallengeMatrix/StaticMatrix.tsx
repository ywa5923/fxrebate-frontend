"use client";

import { type CSSProperties, useEffect,  useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleHelp, CopyIcon, Save } from "lucide-react";
import PublishToggle from "@/components/ChallengeMatrix/PublishToggle";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CopyBtn from "@/components/ChallengeMatrix/CopyBtn";
import { PreviousValues } from "@/components/ChallengeMatrix/PreviousValues";
import {
  MatrixLoadingOverlay,
  MatrixSkeleton,
} from "@/components/ChallengeMatrix/MatrixLoading";
import { loadMatrixData } from "@/components/ChallengeMatrix/loadMatrixData";
import {
  ColumnHeader,
  RowHeader,
  StaticMatrixCell,
  StaticMatrixData,
} from "@/types/Matrix";

import { toast } from "sonner";
import { ChallengeMatrixExtraData, ChalengeData } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import logger from "@/lib/logger";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { isValidUrl } from "@/lib/isValidUrl";
import { formatAmount } from "./formatAmount";

interface StaticMatrixProps {
  brokerId?: number | undefined;
  categoryId: number;
  stepId: number;
  stepSlug: string;
  amountId: number | null;
  amountNumber: number;
  amountCurrency: string;
  zoneId: string | null;
  language: string;
  type: "challenge" | "placeholder";
  is_admin: boolean;
  can_edit?: boolean;
  locale: string;
}

export default function StaticMatrix({
  brokerId,
  categoryId,
  stepId,
  stepSlug,
  amountId,
  amountNumber,
  amountCurrency,
  language = "en",
  type = "challenge",
  zoneId = null,
  is_admin = false,
  can_edit = true,
  locale = "en",
}: StaticMatrixProps) {
  const log = logger.child("components/ui/StaticMatrix");

  const [columnHeaders, setColumnHeaders] = useState<ColumnHeader[]>([]);
  const [rowHeaders, setRowHeaders] = useState<RowHeader[]>([]);
  const [matrixData, setMatrixData] = useState<StaticMatrixData>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [
    matrixExtraData,
    setMatrixExtraData,
  ] = useState<ChallengeMatrixExtraData | null>(null);
  const [isPublished, setIsPublished] = useState<boolean | null>(true);
  const [publishing, setPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEmptyMatrix, setIsEmptyMatrix] = useState(false);

  // URL validation for the affiliate link inputs (checked on save)
  const [linkErrors, setLinkErrors] = useState({
    affiliate_link: false,
    affiliate_master_link: false,
  });
  const [showLinkErrorDialog, setShowLinkErrorDialog] = useState(false);

  const togglePublish = async (published: boolean) => {
    if (isEmptyMatrix) {
      toast.error(
        "Please save the table data first before changing the visibility.",
      );
      return;
    }

    try {
      setPublishing(true);
      const response = await apiClient<any>(
        `/challenges/${brokerId}/publish`,
        UseTokenAuth.Yes,
        {
          method: "POST",
          body: JSON.stringify({
            category_id: categoryId,
            step_id: stepId,
            amount_id: amountId,
            is_published: published,
          }),
        },
        ErrorMode.Return,
      );

      if (!response.success) {
        toast.error(
          published
            ? "Failed to publish table"
            : "Failed to set table as draft",
        );
        log.error("togglePublish", {
          error: response.message,
          brokerId,
          categoryId,
          stepId,
          amountId,
          published,
        });
        return;
      }

      setIsPublished(published);
      toast.success(
        published ? "Table is now live" : "Table reverted to draft",
      );
      router.refresh();
    } catch (error) {
      toast.error("Network error while updating");
      log.error("togglePublish", {
        error,
        brokerId,
        categoryId,
        stepId,
        amountId,
        published,
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleCloneMatrixForAllAmounts = async () => {
    let cloneApiUrl = `/challenges/${brokerId}/clone`;
    let cloneApiResponse = await apiClient<any>(
      cloneApiUrl,
      UseTokenAuth.Yes,
      {
        method: "POST",
        body: JSON.stringify({
          category_id: categoryId,
          step_id: stepId,
          amount_id: amountId,
        }),
      },
      ErrorMode.Return,
    );
    if (!cloneApiResponse.success) {
      // Show the detailed API error only outside production
      toast.error(
        process.env.NODE_ENV !== "production"
          ? cloneApiResponse.message
          : "Failed to clone matrix",
      );
      return;
    }
    toast.success("Matrix cloned successfully");
    router.refresh();
  };

  // Track which cells were copied so the copy button remains visible and green
  // Key format: `${rowIndex}-${colIndex}`
  const [copiedCells, setCopiedCells] = useState<Set<string>>(new Set());
  const router = useRouter();

  const formatText = (value: string | null | undefined): string => {
    if (value == null) return "";
    return String(value);
  };

  // Validation helpers (applies only when is_admin is false)
  const isValueEmpty = (value: string | null | undefined): boolean => {
    if (value == null) return true;
    return String(value).trim() === "";
  };

  const isCellEmpty = (cell: StaticMatrixCell): boolean => {
    // Validate broker value only (public_value is for admin)
    return isValueEmpty(cell?.value);
  };

  // Fetch headers and initial data when step changes
  const loadHeadersAndData = async () => {
    if (!stepSlug || !categoryId || !stepId) {
      setColumnHeaders([]);
      setRowHeaders([]);
      setMatrixData({});
      return;
    }
    setLoading(true);

    try {
      const result = await loadMatrixData({
        brokerId,
        categoryId,
        stepId,
        stepSlug,
        amountId,
        zoneId,
        language,
        type,
        is_admin,
      });

      if (!result.success) return;

      setColumnHeaders(result.columnHeaders);
      setRowHeaders(result.rowHeaders);
      setIsPlaceholder(result.isPlaceholder);
      setIsPublished(result.isPublished);
      setHasChanges(false);
      setMatrixExtraData(result.matrixExtraData);
      setMatrixData(result.matrixData);
      setIsEmptyMatrix(result.isEmptyMatrix);
    } catch (e) {
      log.error("Failed to load headers or data", { error: e });
      setColumnHeaders([]);
      setRowHeaders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeadersAndData();
  }, [language, categoryId, stepId, amountId, zoneId, stepSlug]);

  const updateCellValue = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ) => {
    setMatrixData((prev) => {
      const next: StaticMatrixData = { ...prev };

      const row = [...(next[rowIndex] || [])];
      const cell = { ...(row[colIndex] || {}) } as StaticMatrixCell;

      if ((is_admin && type === "challenge" && !isPlaceholder)) {
        // In admin mode, update public_value
        cell.public_value = value;
        cell.is_updated_entry = false;
      } else {
        // In normal mode, update value
        cell.value = value;
      }

      row[colIndex] = cell;
      next[rowIndex] = row;
      return next;
    });
    setHasChanges(true);
  };

  const CopyValueToPublicValue = (rowIndex: number, colIndex: number) => {
    setMatrixData((prev) => {
      const next: StaticMatrixData = { ...prev };
      const row = [...(next[rowIndex] || [])];
      const cell = { ...(row[colIndex] || {}) } as StaticMatrixCell;
      cell.public_value = cell.value;
      cell.is_updated_entry = false;
      row[colIndex] = cell;
      next[rowIndex] = row;
      return next;
    });
  };

  const renderFormField = (
    cell: StaticMatrixCell,
    rowIndex: number,
    colIndex: number,
    isPlaceholder: boolean,
    isPercentage: boolean,
    showError: boolean,
  ) => {
    // In admin mode or placeholder mode, use public_value for input, otherwise use value
    const sourceValue = is_admin && type === "challenge" ? cell.public_value : cell.value;
    // Values are plain text from the API
    const rawValue = sourceValue ?? "";
    let placeholderText =
      type === "placeholder"
        ? "Enter placeholder value"
        : String(cell?.placeholder ?? "Enter text");

    const asString = (v: unknown) =>
      v === undefined || v === null ? "" : String(v);

    //only for isPercentage cells, calculate the amount
    let calculatedAmount: number | null = null;

    if (isPercentage) {
      const numericValue = Number(rawValue);
      if (Number.isFinite(numericValue)) {
        calculatedAmount = (numericValue * amountNumber) / 100;
      }
    }

    return (
      <div className="space-y-1 w-full h-full flex flex-col">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Input
              value={asString(rawValue)}
              onChange={(e) =>
                updateCellValue(rowIndex, colIndex, e.target.value)
              }
              placeholder={placeholderText}
              className={cn(
                "flex-1 h-full min-h-[2.5rem] min-w-0",
                isPercentage && "pr-14",
                !is_admin && showError && "border-red-500",
              )}
            />
            {isPercentage && type === "challenge" && (
              <span className="pointer-events-none absolute right-2 top-1/2 inline-flex h-7 min-w-7 -translate-y-1/2 items-center justify-center rounded-md bg-white px-2 text-xs font-semibold leading-none text-emerald-700 shadow-sm dark:bg-white dark:text-emerald-800">
                %
              </span>
            )}
          </div>
          {isPercentage && type === "challenge" && calculatedAmount !== null && (
            <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-semibold tabular-nums text-emerald-800 whitespace-nowrap shadow-sm dark:bg-white dark:text-emerald-800">
              {formatAmount(String(calculatedAmount), amountCurrency, locale)}
            </span>
          )}
          {/* Admin-only: show copy button when cell is updated OR already copied.
              After click, keep it visible and green for subsequent clicks. */}
          {(() => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const shouldShowCopy =
              (is_admin &&
                !isPlaceholder &&
                (!!cell.is_updated_entry || copiedCells.has(cellKey))) ||
              cell.has_copied_public_value;
            if (!shouldShowCopy) return null;
            const isGreen = copiedCells.has(cellKey) || cell.has_copied_public_value;
              
            return (
              <CopyBtn
                isGreen={!!isGreen}
                onClick={() => {
                  if (!cell?.value) return;
                  CopyValueToPublicValue(rowIndex, colIndex);
                  setCopiedCells((prev) => {
                    const next = new Set(prev);
                    next.add(cellKey);
                    return next;
                  });
                }}
              />
            );
          })()}
        </div>
        {!is_admin && showError && (
          <div className="text-xs text-red-600 dark:text-red-400 min-h-[1rem]">
            This field is required
          </div>
        )}
        {is_admin && !isPlaceholder && (
          <div className="space-y-1 flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
            <div
              className={cn("text-xs min-h-[1rem]", {
                "text-red-500 dark:text-red-400": cell.is_updated_entry,
              
              })}
            >Broker Value: {formatText(cell.value)}</div>
             
              {!isValueEmpty(cell.previous_value) && (
                <PreviousValues
                  label="Previous Value"
                  previousValue={formatText(cell.previous_value)}
                />
              )}
              {!isValueEmpty(cell.previous_public_value) && (
                <PreviousValues
                  label="Previous Public Value"
                  previousValue={formatText(cell.previous_public_value)}
                />
              )}
            
          </div>
        )}
      </div>
    );
  };

  const renderCell = (
    cell: StaticMatrixCell,
    rowIndex: number,
    colIndex: number,
    isPercentage: boolean,
  ) => {
    //const showError = !is_admin && showValidation && isCellEmpty(cell);
    const showError = false;
    return (
      <div className="w-full h-full">
        <div
          key={cell.id ?? `${rowIndex}-${colIndex}-${cell.col_slug}`}
          className="w-full h-full"
        >
          {renderFormField(
            cell,
            rowIndex,
            colIndex,
            isPlaceholder,
            isPercentage,
            showError,
          )}
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    if (!can_edit) {
      return;
    }
    try {
      setSaving(true);

      // Check for empty cells if not admin
      if (!is_admin) {
        let hasEmptyCells = Object.values(matrixData).some((row) =>
          row.some((cell: StaticMatrixCell) => isCellEmpty(cell)),
        );

        hasEmptyCells = false;

        if (hasEmptyCells) {
          // setShowValidation(true);
          toast.error("Please fill in all required fields before saving");
          return;
        }
      }

      // Validate affiliate links: when not empty they must be valid URLs
      if (type === "challenge") {
        const affiliateLink =
          (is_admin
            ? matrixExtraData?.affiliate_link?.public_url
            : matrixExtraData?.affiliate_link?.url) ?? "";
        const masterLink =
          (is_admin
            ? matrixExtraData?.affiliate_master_link?.public_url
            : matrixExtraData?.affiliate_master_link?.url) ?? "";

        const errors = {
          affiliate_link:
            affiliateLink.trim() !== "" && !isValidUrl(affiliateLink),
          affiliate_master_link:
            masterLink.trim() !== "" && !isValidUrl(masterLink),
        };
        setLinkErrors(errors);

        if (errors.affiliate_link || errors.affiliate_master_link) {
          setShowLinkErrorDialog(true);
          return;
        }
      }

      const payload = {
        category_id: categoryId,
        step_id: stepId,
        step_slug: stepSlug,
        broker_id: brokerId ?? null,
        is_placeholder: type === "placeholder",
        ...(type === "challenge"
          ? {
              amount_id: amountId,
            }
          : {}),
        matrix: matrixData,
        ...(type === "challenge" &&
          !isPlaceholder && {
            affiliate_link: is_admin
              ? matrixExtraData?.affiliate_link?.public_url
              : matrixExtraData?.affiliate_link?.url,
            evaluation_cost_discount: is_admin
              ? matrixExtraData?.evaluation_cost_discount?.public_value
              : matrixExtraData?.evaluation_cost_discount?.value,
            affiliate_master_link: is_admin
              ? matrixExtraData?.affiliate_master_link?.public_url
              : matrixExtraData?.affiliate_master_link?.url,
          }),
        ...(type === "placeholder" && {
          affiliate_link: matrixExtraData?.affiliate_link?.url,
          evaluation_cost_discount:
            matrixExtraData?.evaluation_cost_discount?.value,
          affiliate_master_link: matrixExtraData?.affiliate_master_link?.url,
        }),
      };
     

      let saveUrl =
        type === "placeholder"
          ? "/challenges/matrix/placeholders"
          : `/challenges/${brokerId}`;
      const response = await apiClient<ChalengeData>(
        saveUrl,
        UseTokenAuth.Yes,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        ErrorMode.Return,
      );

      if (!response.success) {
        // Show the detailed API error only outside production
        toast.error(
          process.env.NODE_ENV === "production"
            ? "Failed to save matrix data"
            : response.message,
        );
        return;
      }

      setHasChanges(false);
      setIsEmptyMatrix(false);
      setCopiedCells(new Set());
      loadHeadersAndData();
      toast.success("Matrix data saved successfully");
   
      //router.refresh();
    } catch (e) {
      
      toast.error("Error saving matrix data");
    } finally {
      setSaving(false);
      setShowValidation(true);
    }
  };

  // Show empty state if no headers
  const matrixContainerClassName =
    "relative w-full max-w-full min-w-0 px-2 sm:px-4";

  if (columnHeaders.length === 0 || rowHeaders.length === 0) {
    return (
      <div className={matrixContainerClassName}>
        <div className="mx-auto w-full max-w-[1800px]">
        <Card className="relative">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            {loading ? (
              <MatrixSkeleton />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No matrix data available
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  const matrixColumnCount = Math.max(columnHeaders.length, 1);
  const matrixGridTemplateColumns = `minmax(160px, 220px) repeat(${matrixColumnCount}, minmax(140px, 1fr))`;
  const matrixMobileGridTemplateColumns = `200px repeat(${matrixColumnCount}, minmax(220px, 1fr))`;
  const matrixMobileMinWidth = `${200 + matrixColumnCount * 220 + matrixColumnCount * 8}px`;

  return (
    <div className={matrixContainerClassName}>
      <div className="mx-auto w-full max-w-[1800px]">
      <div className={cn("mb-4 flex flex-wrap items-center gap-3",is_admin && "justify-between",!is_admin && "justify-end")}>
        {/* Public / Draft toggle (hidden in placeholder mode) */}
        {isPublished !== null && type !== "placeholder" && is_admin && (
          <PublishToggle
            isPublished={isPublished}
            onToggle={togglePublish}
            disabled={publishing}
          />
        )}

        <div className="flex items-center gap-2 justify-end">
          {type === "challenge" && (
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-29 text-gray-600 dark:text-gray-300"
                    aria-label="Clone table for all amounts"
                  >
                    <CopyIcon className="h-4 w-4" />Clone table
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                Copy this table to every amount in the selected step and
                category.
              </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Clone table for all amounts?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will overwrite the existing table data for all amounts in
                  the current step and category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCloneMatrixForAllAmounts}
                  className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-200"
                >
                  Clone
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          )}
          {/* Save button */}
          <Button
            disabled={
              !can_edit ||
              (is_admin ? saving : saving || !stepSlug || !hasChanges)
            }
            onClick={handleSave}
            variant="outline"
            size="default"
            className="h-9 bg-green-100 hover:bg-green-200 text-green-800 border-green-200 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {!can_edit
              ? "View Only"
              : saving
                ? "Saving..."
                : "Save Table"}
          </Button>
        </div>
      </div>
      {/* Invalid affiliate link dialog (shown on save) */}
      <AlertDialog
        open={showLinkErrorDialog}
        onOpenChange={setShowLinkErrorDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid link</AlertDialogTitle>
            <AlertDialogDescription>
              {linkErrors.affiliate_link && linkErrors.affiliate_master_link
                ? "The Affiliate Link and the Master Affiliate Link are not valid URLs."
                : linkErrors.affiliate_link
                ? "The Affiliate Link is not a valid URL."
                : "The Master Affiliate Link is not a valid URL."}{" "}
              Please enter a full URL starting with http:// or https://.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-200">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Card className="relative max-w-full overflow-hidden">
        <CardContent className="p-0 sm:p-4 lg:p-6">
          <div className="w-full max-w-full overflow-x-auto">
            <div
              className="flex w-full min-w-[var(--matrix-mobile-min-width)] flex-col gap-2 min-[1400px]:min-w-0"
              style={
                {
                  "--matrix-mobile-min-width": matrixMobileMinWidth,
                  "--matrix-grid-template": matrixGridTemplateColumns,
                  "--matrix-grid-template-mobile":
                    matrixMobileGridTemplateColumns,
                } as CSSProperties
              }
            >
              <div
                className="grid w-full grid-cols-[var(--matrix-grid-template-mobile)] gap-2 min-[1400px]:grid-cols-[var(--matrix-grid-template)]"
              >
            <div className="font-semibold text-gray-700 dark:text-gray-300 px-2 py-2 border-b border-gray-200 dark:border-gray-700 min-h-[2.5rem] flex items-center min-w-0">
              Row / Column
            </div>
            {columnHeaders.length > 0 &&
              columnHeaders.map((header, index) => (
                <div
                  key={index}
                  className="font-semibold text-gray-700 dark:text-gray-300 px-2 py-2 border-b border-gray-200 dark:border-gray-700 text-center min-h-[2.5rem] flex items-center justify-center min-w-0 break-words"
                >
                  {header.name}
                </div>
              ))}
              </div>
            {rowHeaders.length > 0 &&
              rowHeaders.map((rowHeader, rowIndex) => {
                //some rows headears are not visible to the broker, so we don't render them
                if (!is_admin && !rowHeader.broker_can_see) {
                  return null;
                }
                return (
                  <div
                    key={`row-${rowIndex}`}
                    className="grid w-full grid-cols-[var(--matrix-grid-template-mobile)] gap-2 min-[1400px]:grid-cols-[var(--matrix-grid-template)]"
                  >
                    <div className="font-medium text-gray-600 dark:text-gray-400 px-2 py-2 border-r border-gray-200 dark:border-gray-700 min-h-[4rem] flex items-center min-w-0">
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <span className="break-words">{rowHeader.name}</span>
                        {rowHeader.description && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex shrink-0 items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                aria-label={`${rowHeader.name} info`}
                              >
                                <CircleHelp className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              sideOffset={6}
                              className="text-sm px-3.5 py-2"
                            >
                              {rowHeader.description}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {is_admin && !rowHeader.broker_can_see && (
                          <span className="shrink-0 text-xs font-bold text-green-500">
                            (Admin only)
                          </span>
                        )}
                      </span>
                    </div>
                    {columnHeaders.map((colHeader, colIndex) => {
                      const cellData = matrixData[rowIndex] && matrixData[rowIndex][colIndex];
                        
                      return (
                        <div
                          key={cellData?.id ?? `cell-${rowIndex}-${colIndex}`}
                          className="p-2  min-h-[4rem] flex items-center min-w-0"
                        >
                          {cellData ? (
                            renderCell(
                              cellData,
                              rowIndex,
                              colIndex,
                              rowHeader.is_percentage,
                            )
                          ) : (
                            <div className="text-gray-400 text-sm w-full">
                              No data
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            {/* Affiliate link row (separate from matrix data) */}
            {(type === "challenge" || type === "placeholder") && (
              <>
                <div
                  className="grid w-full grid-cols-[var(--matrix-grid-template-mobile)] gap-2 min-[1400px]:grid-cols-[var(--matrix-grid-template)]"
                >
                <div className="font-medium text-gray-600 dark:text-gray-400 px-2 py-2 border-r border-gray-200 dark:border-gray-700 min-h-[4rem] flex items-center min-w-0 break-words">
                  Evaluation Cost Discount
                </div>
                <div
                  className="p-2 min-h-[4rem] flex flex-col min-w-0"
                  style={{
                    gridColumn: `span ${matrixColumnCount} / span ${matrixColumnCount}`,
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {/*If is_admin=true and if publi_value is empty,then the value is copy in public value when the matrix extradata is set at the begining*/}
                      <Input
                        value={
                          is_admin
                            ? matrixExtraData?.evaluation_cost_discount
                                ?.public_value ?? ""
                            : matrixExtraData?.evaluation_cost_discount
                                ?.value ?? ""
                        }
                        placeholder={
                          matrixExtraData?.evaluation_cost_discount
                            ?.placeholder ?? "Enter evaluation cost discount"
                        }
                        onChange={(e) => {
                          setHasChanges(true);
                          setMatrixExtraData((prev: any) => ({
                            ...prev,
                            evaluation_cost_discount: {
                              ...prev.evaluation_cost_discount,
                              [is_admin && type === "challenge"
                                ? "public_value"
                                : "value"]: e.target.value,
                              is_updated_entry: false,
                            },
                          }));
                        }}
                        className="flex-1 min-w-0"
                      />
                      {/*If is_admin=true show button to copy evaluation cost discount's broker value to public value*/}
                      {is_admin &&
                        type === "challenge" &&
                        (!!matrixExtraData?.evaluation_cost_discount
                          ?.is_updated_entry ||
                          matrixExtraData?.evaluation_cost_discount
                            ?.has_copied_public_value) && (
                          <CopyBtn
                            isGreen={
                              !!matrixExtraData?.evaluation_cost_discount
                                ?.has_copied_public_value
                            }
                            onClick={() => {
                              matrixExtraData?.evaluation_cost_discount?.value &&
                                setMatrixExtraData((prev: any) => ({
                                  ...prev,
                                  evaluation_cost_discount: {
                                    ...prev.evaluation_cost_discount,
                                    public_value:
                                      prev.evaluation_cost_discount.value,
                                    has_copied_public_value: true,
                                  },
                                }));
                            }}
                          />
                        )}
                    </div>
                    {is_admin && (
                      <div
                        className={cn("text-xs space-y-1", {
                          "text-red-500 dark:text-red-400":
                            matrixExtraData?.evaluation_cost_discount
                              ?.is_updated_entry,
                          "text-gray-500 dark:text-gray-400": !matrixExtraData
                            ?.evaluation_cost_discount?.is_updated_entry,
                        })}
                      >
                        <div>
                          Broker Value:{" "}
                          {matrixExtraData?.evaluation_cost_discount?.value ??
                            ""}
                        </div>
                        {!isValueEmpty(matrixExtraData?.evaluation_cost_discount?.previous_value) && (
                         
                          <PreviousValues
                            label="Previous Value"
                            previousValue={matrixExtraData?.evaluation_cost_discount?.previous_value ?? ""
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                </div>

                <div
                  className="grid w-full grid-cols-[var(--matrix-grid-template-mobile)] gap-2 min-[1400px]:grid-cols-[var(--matrix-grid-template)]"
                >
                <div className="font-medium text-gray-600 dark:text-gray-400 px-2 py-2 border-r border-gray-200 dark:border-gray-700 min-h-[4rem] flex items-center min-w-0 break-words">
                  Affiliate Link
                </div>
                <div
                  className="p-2  min-h-[4rem] flex flex-col min-w-0"
                  style={{
                    gridColumn: `span ${matrixColumnCount} / span ${matrixColumnCount}`,
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={
                          is_admin
                            ? matrixExtraData?.affiliate_link?.public_url ?? ""
                            : matrixExtraData?.affiliate_link?.url ?? ""
                        }
                        placeholder={
                          matrixExtraData?.affiliate_link?.placeholder ??
                          "Enter affiliate link"
                        }
                        onChange={(e) => {
                          setHasChanges(true);
                          setLinkErrors((prev) => ({
                            ...prev,
                            affiliate_link: false,
                          }));
                          setMatrixExtraData((prev: any) => ({
                            ...prev,
                            affiliate_link: {
                              ...prev.affiliate_link,
                              [is_admin && type === "challenge"
                                ? "public_url"
                                : "url"]: e.target.value,
                              is_updated_entry: false,
                            },
                          }));
                        }}
                        className={cn(
                          "flex-1 min-w-0",
                          linkErrors.affiliate_link && "border-red-500",
                        )}
                      />

                      {/*If admin show button to copy affiliate link's url to public url*/}
                      {is_admin &&
                        type === "challenge" &&
                        (!!matrixExtraData?.affiliate_link?.is_updated_entry ||
                          matrixExtraData?.affiliate_link
                            ?.has_copied_public_value) && (
                          <CopyBtn
                            isGreen={
                              !!matrixExtraData?.affiliate_link
                                ?.has_copied_public_value
                            }
                            onClick={() => {
                              matrixExtraData?.affiliate_link.url &&
                                setMatrixExtraData((prev: any) => ({
                                  ...prev,
                                  affiliate_link: {
                                    ...prev.affiliate_link,
                                    public_url: prev.affiliate_link.url,
                                    has_copied_public_value: true,
                                  },
                                }));
                            }}
                          />
                        )}
                    </div>
                    {is_admin && (
                      <div
                        className={cn("text-xs space-y-1", {
                          "text-red-500 dark:text-red-400":
                            matrixExtraData?.affiliate_link?.is_updated_entry,
                          "text-gray-500 dark:text-gray-400": !matrixExtraData
                            ?.affiliate_link?.is_updated_entry,
                        })}
                      >
                        <div>
                          Broker Value:{" "}
                          {matrixExtraData?.affiliate_link?.url ?? ""}
                        </div>
                        {!isValueEmpty(matrixExtraData?.affiliate_link?.previous_url) && (
                          <PreviousValues
                            label="Previous Value"
                            previousValue={matrixExtraData?.affiliate_link?.previous_url ?? ""}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                </div>
                <div
                  className="grid w-full grid-cols-[var(--matrix-grid-template-mobile)] gap-2 min-[1400px]:grid-cols-[var(--matrix-grid-template)]"
                >
                <div className="font-medium text-gray-600 dark:text-gray-400 px-2 py-2 border-r border-gray-200 dark:border-gray-700 min-h-[4rem] flex items-center gap-2 min-w-0">
                  <span className="min-w-0 break-words">Master Affiliate Link</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs cursor-help text-green-800 dark:text-gray-400">
                        (info)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={6}
                      className="text-sm px-3.5 py-2"
                    >
                      This master affiliate link applies to all challenges
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div
                  className="p-2  min-h-[4rem] flex flex-col min-w-0"
                  style={{
                    gridColumn: `span ${matrixColumnCount} / span ${matrixColumnCount}`,
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={
                          is_admin
                            ? matrixExtraData?.affiliate_master_link
                                ?.public_url ?? ""
                            : matrixExtraData?.affiliate_master_link?.url ?? ""
                        }
                        placeholder={
                          matrixExtraData?.affiliate_master_link?.placeholder ??
                          "Enter affiliate link"
                        }
                        onChange={(e) => {
                          setHasChanges(true);
                          setLinkErrors((prev) => ({
                            ...prev,
                            affiliate_master_link: false,
                          }));
                          setMatrixExtraData((prev: any) => ({
                            ...prev,
                            affiliate_master_link: {
                              ...prev.affiliate_master_link,
                              [is_admin && type === "challenge"
                                ? "public_url"
                                : "url"]: e.target.value,
                              is_updated_entry: false,
                            },
                          }));
                        }}
                        className={cn(
                          "flex-1 min-w-0",
                          linkErrors.affiliate_master_link && "border-red-500",
                        )}
                      />
                      {/*If admin show button to copy master affiliate link's url to public url*/}
                      {is_admin &&
                        type === "challenge" &&
                        (!!matrixExtraData?.affiliate_master_link
                          ?.is_updated_entry ||
                          matrixExtraData?.affiliate_master_link
                            ?.has_copied_public_value) && (
                          <CopyBtn
                            isGreen={
                              !!matrixExtraData?.affiliate_master_link
                                ?.has_copied_public_value
                            }
                            onClick={() => {
                              matrixExtraData?.affiliate_master_link?.url &&
                                setMatrixExtraData((prev: any) => ({
                                  ...prev,
                                  affiliate_master_link: {
                                    ...prev.affiliate_master_link,
                                    public_url: prev.affiliate_master_link.url,
                                    has_copied_public_value: true,
                                  },
                                }));
                            }}
                          />
                        )}
                    </div>

                    {is_admin && (
                      <div
                        className={cn("text-xs space-y-1", {
                          "text-red-500 dark:text-red-400":
                            matrixExtraData?.affiliate_master_link
                              ?.is_updated_entry,
                          "text-gray-500 dark:text-gray-400": !matrixExtraData
                            ?.affiliate_master_link?.is_updated_entry,
                        })}
                      >
                        <div>
                          Broker Value:{" "}
                          {matrixExtraData?.affiliate_master_link?.url ?? ""}
                        </div>
                        {!isValueEmpty( matrixExtraData?.affiliate_master_link?.previous_url) && (
                          <PreviousValues
                            label="Previous Value"
                            previousValue={matrixExtraData?.affiliate_master_link
                              ?.previous_url ?? ""}
                          />
                        )}
                       
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </>
            )}
            </div>
          </div>
        </CardContent>
      <MatrixLoadingOverlay loading={loading} />
      </Card>
      </div>
    </div>
  );
}