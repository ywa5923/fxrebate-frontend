import {
  ArrayPath,
  Control,
  Controller,
  FieldPath,
  FieldValues,
  Path,
  useFieldArray,
  
} from "react-hook-form";
import { ReactNode } from "react";

import { FormBaseProps, FormControlFunc, FormControlProps } from "@/components/XForm/types";

import { Field, FieldLabel, FieldDescription, FieldContent, FieldError } from "@/components/ui/field";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

import { XIcon, PlusIcon } from "lucide-react";
import { XFormField, XFormOption } from "@/types";



export function FormBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  
>({
  children,
  control,
  label,
  name,
  description,
  controlFirst,
  horizontal,
  required,
}: FormBaseProps<TFieldValues, TName>) {

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const labelElement = (
          <>
            <FieldLabel htmlFor={field.name}>
              {label}
              {required ? <span className="text-destructive ml-0.5" aria-hidden>*</span> : null}
            </FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </>
        )
        const control = children({
          ...field,
          id: field.name,
          "aria-invalid": fieldState.invalid,
        })
        const errorElem = fieldState.invalid && (
          <FieldError errors={[fieldState.error]} />
        )

        return (
          <Field
            data-invalid={fieldState.invalid}
            orientation={horizontal ? "horizontal" : undefined}
          >
            {controlFirst ? (
              <>
                {control}
                <FieldContent>
                  {labelElement}
                  {errorElem}
                </FieldContent>
              </>
            ) : (
              <>
                <FieldContent>{labelElement}</FieldContent>
                {control}
                {errorElem}
              </>
            )}
          </Field>
        )
      }}
    />
  )
}

export const FormInput: FormControlFunc<{ required?: boolean }> = props => {
  return <FormBase {...props}>{({ value, ...field }) => <Input {...field}  defaultValue={value ?? ""}   className="" />}</FormBase>
}
export const FormTextarea: FormControlFunc<{ required?: boolean }> = props => {
  return <FormBase {...props}>{field => <Textarea {...field} />}</FormBase>
}
export const SelectIteNoneValue = "_none_";
export const FormSelect: FormControlFunc<{ children: ReactNode; placeholder?: string; required?: boolean }> = ({
  children,
  placeholder,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur,value, ...field }) => (
        <Select value={value ?? ""} onValueChange={(v) => onChange(v === SelectIteNoneValue ? "" : v)}>
          <SelectTrigger
            aria-invalid={field["aria-invalid"]}
            id={field.id}
            onBlur={onBlur}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value={SelectIteNoneValue}>— None —</SelectItem>
            {children}
          </SelectContent>
        </Select>
      )}
    </FormBase>
  )
}

export const FormCheckbox: FormControlFunc<{ required?: boolean }> = props => {
  return (
    <FormBase {...props} horizontal controlFirst>
      {({ onChange, value, ...field }) => (
        <Checkbox {...field} checked={value} onCheckedChange={onChange} />
      )}
    </FormBase>
  )
}

export const FormNumber: FormControlFunc<{ required?: boolean }> = props => {
  return (
    <FormBase {...props}>
      {({ value, ...field }) => (
        <Input
          type="number"
          {...field}
          value={value ?? ""}
        />
      )}
    </FormBase>
  )
}
export const FormNumber34: FormControlFunc<{ required?: boolean }> = props => {
  return (
    <FormBase {...props}>
      {({ value, onChange, ...field }) => (
        <Input
          type="number"
          {...field}
          value={value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              onChange(undefined);
            } else {
              const num = Number(val);
              onChange(Number.isNaN(num) ? undefined : num);
            }
          }}
        />
      )}
    </FormBase>
  )
}





function renderArrayInnerField<TFieldValues extends FieldValues>({
  fKey,
  inner,
  control,
  fieldPath,
}: {
  fKey: string;
  inner: XFormField;
  control: Control<TFieldValues>;
  fieldPath: Path<TFieldValues>;
}) {
  const common = {
    control,
    name: fieldPath,
    label: inner?.label || "",
  };

  if (inner?.type === "textarea") {
    return <FormTextarea key={fKey} {...common} />;
  }

  if (inner?.type === "select") {
    return (
      <FormSelect
        key={fKey}
        {...common}
        placeholder={inner.placeholder ?? "Select an option"}
      >
        {inner.options?.map((option: XFormOption) => (
          <SelectItem key={option.value.toString()} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </FormSelect>
    );
  }

  if (inner?.type === "number") {
    return <FormNumber key={fKey} {...common} />;
  }

  return <FormInput key={fKey} {...common} />;
}

function renderArrayFieldItems<TFieldValues extends FieldValues>({
  fields,
  fieldDef,
  control,
  name,
  remove,
}: {
  fields: { id?: string }[];
  fieldDef: XFormField;
  control: Control<TFieldValues>;
  name: string;
  remove: (index: number) => void;
}) {
  return fields.map((item, index) => (
    <div
      key={item.id ?? index}
      className={cn(
        "relative mb-3 rounded-md border p-3 pr-10",
        index % 2 === 0
          ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/40",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => remove(index)}
        aria-label={`Remove ${fieldDef.label ?? "item"}`}
      >
        <XIcon className="h-4 w-4" />
      </Button>
      <div className="space-y-2">
        {fieldDef.fields &&
          Object.entries(fieldDef.fields as Record<string, XFormField>).map(
            ([fKey, inner]: [string, XFormField]) =>
              renderArrayInnerField({
                fKey,
                inner,
                control,
                fieldPath: `${name}.${index}.${fKey}` as Path<TFieldValues>,
              }),
          )}
      </div>
    </div>
  ));
}

export const ArrayFields = <
  TFieldValues extends FieldValues,
  TArrayName extends ArrayPath<TFieldValues>
>({
  control,
  name,
  fieldDef,
  required,
}: {
  control: Control<TFieldValues>;
  name: TArrayName;
  fieldDef: XFormField;
  required?: boolean;
}) => {
  const { fields, append, remove } = useFieldArray({control, name});
    
  return (
    <>
      {renderArrayFieldItems({
        fields,
        fieldDef,
        control,
        name: String(name),
        remove,
      })}
      <div className="mt-3 flex justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => append({} as never)}
        >
          <PlusIcon className="h-4 w-4" />
          Add {fieldDef.label ?? "Item"}
        </Button>
      </div>
     
    </>
  );
}



