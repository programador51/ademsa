"use client";

import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps<T extends FieldValues> extends Omit<
  SelectProps,
  "name" | "value" | "onChange"
> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
  emptyOption?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  emptyOption,
  ...props
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth error={!!fieldState.error}>
          <InputLabel>{label}</InputLabel>
          <Select {...props} {...field} label={label} value={field.value ?? ""}>
            {emptyOption !== undefined && (
              <MenuItem value="">{emptyOption}</MenuItem>
            )}
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && (
            <FormHelperText>{fieldState.error.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}
