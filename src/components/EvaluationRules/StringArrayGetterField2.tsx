import { Control, Controller, FieldValues } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type StringArrayGetterFieldProps = {
  name: string;
  control: Control<FieldValues>;
  placeholder?: string | null;
};

export function StringArrayGetterField2({
  name,
  control,
  placeholder,
}: StringArrayGetterFieldProps) {
  const fieldName = `${name}_getter`;

  return (
    <Controller
      control={control}
      name={fieldName}
      render={({ field, fieldState }) => {
        const items =
          Array.isArray(field.value) && field.value.length > 0
            ? field.value.map((v) => (v != null ? String(v) : ""))
            : [""];

        const updateItem = (index: number, value: string) => {
          const next = [...items];
          next[index] = value;
          field.onChange(next);
        };

        const removeItem = (index: number) => {
          const next = items.filter((_, i) => i !== index);
          field.onChange(next.length > 0 ? next : [""]);
        };

        const addItem = () => {
          field.onChange([...items, ""]);
        };

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldContent className="space-y-2">
              {items.map((item, index) => (
                <div key={`${fieldName}-${index}`}>
                  <InputGroup>
                    <InputGroupInput
                      value={item}
                      onChange={(e) => updateItem(index, e.target.value)}
                      onBlur={field.onBlur}
                      placeholder={placeholder ?? undefined}
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeItem(index)}
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              ))}

              <Button
                type="button"
                size="icon"
                variant="outline"
                title="Add item"
                aria-label="Add item"
                className={cn(
                  "h-7 w-7 shrink-0 rounded border transition-all duration-150",
                  "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400",
                  "hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
                )}
                onClick={addItem}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>

              {fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}
