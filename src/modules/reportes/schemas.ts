import * as yup from "yup";

export const reporteFormSchema = yup.object({
  descripcion: yup.string().trim().required("La descripción es requerida"),
  tipoId: yup
    .number()
    .transform((value, original) =>
      original === "" || original === null || original === undefined
        ? undefined
        : Number(original)
    )
    .required("Selecciona un tipo"),
  agrupadorId: yup
    .number()
    .transform((value, original) =>
      original === "" || original === null || original === undefined
        ? undefined
        : Number(original)
    )
    .required("Selecciona un agrupador"),
  proyectoId: yup
    .number()
    .transform((value, original) =>
      original === "" || original === null || original === undefined
        ? undefined
        : Number(original)
    )
    .required("Selecciona un proyecto"),
});

export type ReporteFormValues = yup.InferType<typeof reporteFormSchema>;

export const defaultReporteFormValues: ReporteFormValues = {
  descripcion: "",
  tipoId: "" as unknown as number,
  agrupadorId: "" as unknown as number,
  proyectoId: "" as unknown as number,
};
