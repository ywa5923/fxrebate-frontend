import {
  Control,
  Controller,
  FieldValues,
  useFieldArray,
  useFormState,
} from "react-hook-form";
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

export function StringArrayGetterField({
  name,
  control,
  placeholder,
}: StringArrayGetterFieldProps) {
  const fieldName = `${name}_getter`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });
  const { errors } = useFormState({ control, name: fieldName });
  const rootError = errors[fieldName]?.root;

  

  return (
    <Field data-invalid={!!rootError}>
      <FieldContent className="space-y-2">
        {fields.map((item, index) => (
          <Controller
            key={item.id}
            control={control}
            name={`${fieldName}.${index}`}
            render={({ field, fieldState }) => (
              <>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    value={field.value != null ? String(field.value) : ""}
                    aria-invalid={fieldState.invalid}
                    placeholder={placeholder ?? undefined}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => remove(index)}
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </>
            )}
          />
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
          onClick={() => append("")}
        >
          <Plus className="h-3.5 w-3.5" /> 
        </Button>

        {rootError && <FieldError errors={[rootError]} />}
      </FieldContent>
    </Field>
  );
}
