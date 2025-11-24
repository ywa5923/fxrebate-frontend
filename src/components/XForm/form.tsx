import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFieldArray,
} from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldContent, FieldError } from "@/components/ui/field";
import { ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { XIcon } from "lucide-react";

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = {
  name: TName;
  label: ReactNode;
  description?: ReactNode;
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"];
};

type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  horizontal?: boolean;
  controlFirst?: boolean;
  children: (
    field: Parameters<
      ControllerProps<TFieldValues, TName, TTransformedValues>["render"]
    >[0]["field"] & {
      "aria-invalid": boolean;
      id: string;
    }
  ) => ReactNode;
};

type FormControlFunc<
  ExtraProps extends Record<string, unknown> = Record<never, never>
> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>(
  props: FormControlProps<TFieldValues, TName, TTransformedValues> & ExtraProps
) => ReactNode;

export function FormBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>({
  children,
  control,
  label,
  name,
  description,
  controlFirst,
  horizontal,
}: FormBaseProps<TFieldValues, TName, TTransformedValues>) {

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const labelElement = (
          <>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
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

export const FormInput: FormControlFunc = props => {
  return <FormBase {...props}>{field => <Input {...field} />}</FormBase>
}

export const FormInputGroup: FormControlFunc<{ remove: () => void }> = props => {
  return <FormBase {...props}>{field => {
    return (
      <InputGroup>
        <InputGroupInput {...field} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="button"  variant="ghost" size="icon-xs"  onClick={() => props.remove()}>
          <XIcon />
          </InputGroupButton>
        </InputGroupAddon>                    
      </InputGroup>
    )
  }}</FormBase>
}
export const FormTextarea: FormControlFunc = props => {
  return <FormBase {...props}>{field => <Textarea {...field} />}</FormBase>
}

export const FormSelect: FormControlFunc<{ children: ReactNode; placeholder?: string }> = ({
  children,
  placeholder,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, ...field }) => (
        <Select {...field} onValueChange={onChange}>
          <SelectTrigger
            aria-invalid={field["aria-invalid"]}
            id={field.id}
            onBlur={onBlur}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      )}
    </FormBase>
  )
}

export const FormCheckbox: FormControlFunc = props => {
  return (
    <FormBase {...props} horizontal controlFirst>
      {({ onChange, value, ...field }) => (
        <Checkbox {...field} checked={value} onCheckedChange={onChange} />
      )}
    </FormBase>
  )
}

export const FormNumber: FormControlFunc = props => {
  return <FormBase {...props}>{field => <Input type="number" {...field} />}</FormBase>
}

export const FormArray: FormControlFunc = props => {
  return <FormBase {...props}>{field => <Input type="array" {...field} />}</FormBase>
}

export const FieldArrayItem: FormControlFunc = props => {
  return <FormBase {...props}>{field => <Input type="text" placeholder="Enter item" {...field} />}</FormBase>
}

export function ArrayField({
  control,
  name,
  fieldDef,
}: { control: any; name: string; fieldDef: any }) {

  console.log("fieldDef", fieldDef);
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <>
      {fields.map((item, index) => (
        <div key={item.id ?? index}>
          {Object.entries(fieldDef.fields ?? {}).map(([fKey, inner]: [string, any]) => (
            <FormInput
              key={fKey}
              control={control}
              name={`${name}.${index}.${fKey}` as any}
              label={inner?.label || ""}
            />
          ))}
          <Button type="button" onClick={() => remove(index)}>Remove</Button>
          
        </div>
      ))}
      <Button type="button" onClick={() => append({})}>Add</Button>
    </>
  );
}
export function ArrayFields({
  control,
  name,
  fieldDef,
}: { control: any; name: string; fieldDef: any }) {

  console.log("fieldDef", fieldDef);
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
      <Button type="button" onClick={() => append({})}>Add</Button>
    </>
  );
}