"use client";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";

interface FormDatePickerProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  disabled?: boolean;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  disabled,
}: FormDatePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          label={label}
          disabled={disabled}
          value={field.value ? dayjs(field.value) : null}
          onChange={(date: Dayjs | null) => {
            field.onChange(date ? date.format("YYYY-MM-DD") : "");
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              size: "medium",
              error: !!fieldState.error,
              helperText: fieldState.error?.message,
            },
            popper: {
              disablePortal: false,
            },
          }}
        />
      )}
    />
  );
}
