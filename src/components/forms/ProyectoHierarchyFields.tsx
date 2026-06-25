"use client";

export {
  ProyectoHierarchyAutocomplete,
  type ProyectoHierarchyAutocompleteProps,
} from "./ProyectoHierarchyAutocomplete";

import { FieldValues } from "react-hook-form";
import {
  ProyectoHierarchyAutocomplete,
  ProyectoHierarchyAutocompleteProps,
} from "./ProyectoHierarchyAutocomplete";

export type ProyectoHierarchyFieldsProps<T extends FieldValues> =
  ProyectoHierarchyAutocompleteProps<T>;

export function ProyectoHierarchyFields<T extends FieldValues>(
  props: ProyectoHierarchyFieldsProps<T>
) {
  return <ProyectoHierarchyAutocomplete {...props} />;
}
