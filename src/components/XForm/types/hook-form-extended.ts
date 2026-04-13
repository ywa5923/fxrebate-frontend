import {
 // ControllerProps,
  FieldPath,
  FieldValues,
  Control,
  ControllerRenderProps
} from "react-hook-form";
import { ReactNode } from "react";


// export type FormControlProps<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
//   TTransformedValues = TFieldValues
// > = {
//   name: TName;
//   label: ReactNode;
//   description?: ReactNode;
//   control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"];
// };

export type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
  label: ReactNode;
  description?: ReactNode;
  control: Control<TFieldValues>;
};


// export type FormBaseProps<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
//   TTransformedValues = TFieldValues
// > = FormControlProps<TFieldValues, TName, TTransformedValues> & {
//   horizontal?: boolean;
//   controlFirst?: boolean;
//   /** When true, render a required indicator (e.g., asterisk) next to the label. */
//   required?: boolean;
//   children: (
//     field: Parameters<
//       ControllerProps<TFieldValues, TName, TTransformedValues>["render"]
//     >[0]["field"] & {
//       "aria-invalid": boolean;
//       id: string;
//     }
//   ) => ReactNode;
// };

export type RHFField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = ControllerRenderProps<TFieldValues, TName>;

export type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = FormControlProps<TFieldValues, TName> & {
  horizontal?: boolean;
  controlFirst?: boolean;
  required?: boolean;
  children: (
    field: RHFField<TFieldValues, TName> & {
      "aria-invalid": boolean;
      id: string;
    }
  ) => ReactNode;
};

// export type FormControlFunc<
//   ExtraProps extends Record<string, unknown> = Record<never, never>
// > = <
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
//   TTransformedValues = TFieldValues
// >(
//   props: FormControlProps<TFieldValues, TName, TTransformedValues> & ExtraProps
// ) => ReactNode;

export type FormControlFunc<
  ExtraProps extends Record<string, unknown> = Record<never, never>
> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FormControlProps<TFieldValues, TName> & ExtraProps
) => ReactNode;