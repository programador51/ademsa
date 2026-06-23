"use client";

import { TextField, TextFieldProps } from "@mui/material";
import { useState } from "react";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { formatMoneyInput, parseMoneyInput } from "@/lib/formatters";

interface FormMoneyFieldProps<T extends FieldValues> extends Omit<
  TextFieldProps,
  "name" | "value" | "onChange" | "label"
> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
}

export function FormMoneyField<T extends FieldValues>({
  name,
  control,
  label,
  ...props
}: FormMoneyFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <MoneyInput
          {...props}
          label={label}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
}

function MoneyInput({
  value,
  onChange,
  onBlur,
  error,
  helperText,
  label,
  ...props
}: {
  value: string | number;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: boolean;
  helperText?: string;
  label?: string;
} & Omit<TextFieldProps, "value" | "onChange" | "onBlur">) {
  const [focused, setFocused] = useState(false);

  const displayValue = focused
    ? String(value ?? "")
    : formatMoneyInput(value);

  return (
    <TextField
      {...props}
      label={label}
      value={displayValue}
      fullWidth
      error={error}
      helperText={helperText}
      inputMode="decimal"
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onBlur();
      }}
      onChange={(e) => onChange(parseMoneyInput(e.target.value))}
    />
  );
}
