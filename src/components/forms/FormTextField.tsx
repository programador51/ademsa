"use client";

import { TextField, TextFieldProps } from "@mui/material";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";

interface FormTextFieldProps<T extends FieldValues> extends Omit<
  TextFieldProps,
  "name" | "value" | "onChange"
> {
  name: FieldPath<T>;
  control: Control<T>;
}

export function FormTextField<T extends FieldValues>({
  name,
  control,
  ...props
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          value={field.value ?? ""}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          size="medium"
        />
      )}
    />
  );
}
