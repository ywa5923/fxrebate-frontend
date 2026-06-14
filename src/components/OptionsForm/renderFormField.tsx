import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { Option } from "@/types";
import { FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Multiselect from "react-select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function renderFormField(
    option: Option,
    formField: ControllerRenderProps<FieldValues, string>,
    form: UseFormReturn<any>, 
    renderOptionHistory: (option: Option) => React.ReactNode,
    fileInputKey: number,
    type: "cols" | "vertical" = "cols",
    ) {
    switch (option.form_type) {
      case "numberWithUnit":
        const fieldError = form.formState.errors?.[option.slug];
        const unitError =
          fieldError && typeof fieldError === "object" && "unit" in fieldError
            ? (fieldError as any).unit
            : undefined;
        return (
          <div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={
                  option.placeholder || `Enter ${option.name.toLowerCase()}`
                }
                min={option.min_constraint}
                max={option.max_constraint}
                value={formField.value?.value || ""}
                onChange={(e) =>
                  formField.onChange({
                    ...formField.value,
                    value: parseFloat(e.target.value),
                  })
                }
              />
              <Select
                value={formField.value?.unit || ""}
                onValueChange={(unit) =>
                  formField.onChange({ ...formField.value, unit })
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-[120px]",
                    option.required === 1 &&
                      unitError &&
                      "border-red-500 focus:border-red-500",
                  )}
                >
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {option.meta_data?.map(
                    (metaData: { value: string; label: string }) => (
                      <SelectItem key={metaData?.value} value={metaData?.value}>
                        {metaData?.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            {option.required === 1 && unitError && (
              <p className="text-sm text-red-500 mt-1">
                {`Unit is required for ${option.name}`}
              </p>
            )}
            {renderOptionHistory(option)}
          </div>
        );
      case "textarea":
        return (
          <div>
            <Textarea
              placeholder={
                option.placeholder || `Enter ${option.name.toLowerCase()}`
              }
              {...formField}
              value={formField.value || ""} // Ensure value is never null
            />
            {renderOptionHistory(option)}
          </div>
        );
      case "select":
        return (
          <div>
            <Select
              onValueChange={formField.onChange}
              defaultValue={formField.value}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    option.placeholder || `Select ${option.name.toLowerCase()}`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {option.meta_data &&
                  Array.isArray(option.meta_data) &&
                  option.meta_data.map((metaData: any) => (
                    <SelectItem key={metaData?.id} value={metaData?.value}>
                      {metaData?.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {renderOptionHistory(option)}
          </div>
        );
      case "multiple_select":
        return (
          <div>
            <Multiselect
              options={option.meta_data}
              isMulti
              classNamePrefix="react-select"
              instanceId={option.slug} // Add stable instanceId to prevent hydration errors
              onChange={(selected) => {
                // Store the actual array of selected values
                const values = selected
                  ? selected.map((option: { value: string }) => option.value)
                  : [];
                formField.onChange(values);

                // Trigger validation after selection changes
                // setTimeout(() => form.trigger(field.slug), 100);
              }}
              value={
                option.meta_data?.filter(
                  (metaData) =>
                    Array.isArray(formField.value) &&
                    formField.value.includes(metaData.value),
                ) || []
              }
              placeholder={
                option.placeholder || `Select ${option.name.toLowerCase()}`
              }
              name={option.name}
              id={option.slug}
            />
            {renderOptionHistory(option)}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={Boolean(formField.value)}
                onCheckedChange={formField.onChange}
                id={option.slug}
              />
              <FormLabel
                htmlFor={option.slug}
                className="text-sm font-medium cursor-pointer select-none"
              >
                {option.name}
              </FormLabel>
            </div>
            {renderOptionHistory(option)}
          </div>
        );
      case "radio":
        return (
          <div>
            <RadioGroup
              onValueChange={formField.onChange}
              defaultValue={formField.value}
            >
              {option.meta_data?.map((metaData: any) => (
                <div
                  key={metaData.value}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={metaData.value}
                    id={`${option.slug}-${metaData.value}`}
                  />
                  <label htmlFor={`${option.slug}-${metaData.value}`}>
                    {metaData.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
            {renderOptionHistory(option)}
          </div>
        );

      case "notes": {
        const isVertical = type === "vertical";
        return (
          <div
            className={cn(
              "space-y-3",
              isVertical && "w-full max-w-full space-y-5",
            )}
          >
            {Array.isArray(formField.value) &&
              formField.value.map((note: string, index: number) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-2",
                    isVertical && "w-full items-center gap-3",
                  )}
                >
                  <Input
                    type="text"
                    placeholder={`Enter ${option.name.toLowerCase()} ${
                      index + 1
                    }`}
                    value={note || ""}
                    className={cn(
                      isVertical && "h-11 w-full min-w-0 flex-1 text-base",
                    )}
                    onChange={(e) => {
                      const newNotes = [...(formField.value || [])];
                      newNotes[index] = e.target.value;
                      formField.onChange(newNotes);
                      // Trigger validation for this field
                      setTimeout(() => form.trigger(option.slug), 100);
                    }}
                  />
                  {formField.value  && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newNotes = formField.value.filter(
                          (_: string, i: number) => i !== index,
                        );
                        formField.onChange(newNotes);
                      }}
                      className={cn(
                        "shrink-0 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive",
                        isVertical ? "h-11 w-11" : "h-9 w-9",
                      )}
                      title="Remove note"
                      aria-label={`Remove ${option.name.toLowerCase()} ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const newNotes = [...(formField.value || []), ""];
                formField.onChange(newNotes);
                // Trigger validation for this field
                setTimeout(() => form.trigger(option.slug), 100);
              }}
              className={cn(
                "mt-1 gap-2 border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50 hover:text-foreground",
                isVertical && "h-10 px-4",
              )}
            >
              <Plus className="h-4 w-4" />
             
            </Button>
            {renderOptionHistory(option)}
          </div>
        );
      }
      case "image":
        return (
          <div className="min-w-0 overflow-hidden">
            {formField.value && typeof formField.value === "string" && (
              <div className="text-sm text-muted-foreground mb-2 min-w-0 overflow-hidden">
                <span>Current file: </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={formField.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600 hover:text-blue-800 break-all"
                      >
                        {formField.value.split("/").pop()}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      style={{
                        border: "none",
                        background: "transparent",
                        boxShadow: "none",
                        padding: 0,
                      }}
                    >
                      <img
                        src={formField.value}
                        key={Math.random()*1000}
                        alt="Current file"
                        style={{
                          maxWidth: 200,
                          maxHeight: 200,
                          display: "block",
                          border: "none",
                          background: "transparent",
                          boxShadow: "none",
                        }}
                      />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <Input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  formField.onChange(file);
                }
              
                
              }}
            />
            {renderOptionHistory(option)}
          </div>
        );
      default:
        return (
          <div>
            <Input
              type={option.form_type === "number" ? "number" : "text"}
              placeholder={
                option.placeholder || `Enter ${option.name.toLowerCase()}`
              }
              {...formField}
              value={
                option.form_type === "number"
                  ? formField.value === null || formField.value === undefined
                    ? ""
                    : formField.value
                  : formField.value || ""
              }
            />
            {renderOptionHistory(option)}
          </div>
        );
    }
  };