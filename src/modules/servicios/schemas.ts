import * as yup from "yup";

export type ServicioNivel = 1 | 2 | 3;

export const servicioFormSchema = yup.object({
  nivel: yup
    .number()
    .oneOf([1, 2, 3], "Selecciona un nivel válido")
    .required("El nivel es requerido"),
  nombre: yup.string().trim().required("El nombre es requerido"),
  detalles: yup.string().when("nivel", {
    is: 3,
    then: (schema) => schema.trim().optional(),
    otherwise: (schema) => schema.strip(),
  }),
  tipoId: yup
    .number()
    .transform((value, original) =>
      original === "" || original === null || original === undefined
        ? undefined
        : Number(original)
    )
    .when("nivel", {
      is: (v: number) => v === 2 || v === 3,
      then: (schema) => schema.required("Selecciona un tipo"),
      otherwise: (schema) => schema.strip(),
    }),
  agrupadorId: yup
    .number()
    .transform((value, original) =>
      original === "" || original === null || original === undefined
        ? undefined
        : Number(original)
    )
    .when("nivel", {
      is: 3,
      then: (schema) => schema.required("Selecciona un agrupador"),
      otherwise: (schema) => schema.strip(),
    }),
});

export type ServicioFormValues = {
  nivel: ServicioNivel;
  nombre: string;
  detalles?: string;
  tipoId?: number;
  agrupadorId?: number;
};

export const defaultServicioFormValues: ServicioFormValues = {
  nivel: 1,
  nombre: "",
  detalles: "",
};

export interface ServiciosFilters {
  search: string;
  tipoId: number | "";
  agrupadorId: number | "";
}

export const defaultServiciosFilters: ServiciosFilters = {
  search: "",
  tipoId: "",
  agrupadorId: "",
};
