import {
  ArrayPath,
  Control,
  Controller,
  FieldPath,
  FieldValues,
  Path,
  useFieldArray,
  
} from "react-hook-form";

import { FormBaseProps, FormControlFunc, FormControlProps } from "@/components/XForm/types";

import { Field, FieldLabel, FieldDescription, FieldContent, FieldError } from "@/components/ui/field";
import { ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { XIcon, PlusIcon } from "lucide-react";
import { XFormField } from "@/types";


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
  {/*----Class names for to disable the focus ring on the elements---
   Input element: 
   className="focus-visible:ring-0 focus-visible:border-ring"
   InputGroup element: 
    className="border border-input rounded-md focus-within:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-0"
 
  */}
export const FormInputGroup: FormControlFunc<{ remove: () => void; required?: boolean }> = props => {
  return <FormBase {...props}>{({ value, ...field }) => {
    return (
      <InputGroup  >
        
        <InputGroupInput  value={value ?? ""} {...field} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="button"  variant="ghost" size="icon-xs"  onClick={() => props.remove()}>
          <XIcon />
          </InputGroupButton>
        </InputGroupAddon>                    
      </InputGroup>
    )
  }}</FormBase>
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
      {fields.map((item, index) => (
        <div key={item.id ?? index}>
          {fieldDef.fields && Object.entries(fieldDef.fields as Record<string, XFormField>).map(([fKey, inner]: [string, XFormField]) => (
            <FormInputGroup
              key={fKey}
              control={control}
              name={`${String(name)}.${index}.${fKey}` as Path<TFieldValues>}
              label={inner?.label || ""}
              remove={() => remove(index)}
            />
          ))}
       
      
        </div>
      ))}
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


export const ArrayFields3: FormControlFunc<{
  fieldDef: XFormField;
  required?: boolean;
}> = ({ control, name, fieldDef, required }) => {

  const { fields, append, remove } = useFieldArray({
    control,
    // `name` is FieldPath<> from FormControlFunc; RHF requires ArrayPath<> here.
    name: name as ArrayPath<FieldValues> as never,
  });

  return (
    <>
      {fields.map((item, index) => (
        <div key={item.id ?? index}>
          {fieldDef.fields && Object.entries(fieldDef.fields as Record<string, XFormField>).map(([fKey, inner]: [string, XFormField]) => (
            <FormInputGroup
              key={fKey}
              control={control}
              name={`${name}.${index}.${fKey}` as any}
              label={inner?.label || ""}
              remove={() => remove(index)}
            />
          ))}
       
      
        </div>
      ))}
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
};

//to refactor this component to use type scrypt types
export function ArrayFields2({
  control,
  name,
  fieldDef,
  required,
}: { control: any; name: string; fieldDef: any; required?: boolean }) {

  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <>
      {fields.map((item, index) => (
        <div key={item.id ?? index}>
          {Object.entries(fieldDef.fields ?? {}).map(([fKey, inner]: [string, any]) => (
            <FormInputGroup
              key={fKey}
              control={control}
              name={`${name}.${index}.${fKey}` as any}
              label={inner?.label || ""}
              remove={() => remove(index)}
            />
          ))}
       
      
        </div>
      ))}
      <div className="mt-3 flex justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => append({})}
        >
          <PlusIcon className="h-4 w-4" />
          Add {fieldDef.label ?? "Item"}
        </Button>
      </div>
     
    </>
  );
}