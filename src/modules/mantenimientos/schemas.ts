import * as yup from "yup";

export type MantenimientoTipo = "preventivo" | "correctivo";

export const mantPreventivoSchema = yup.object({
  ultimo: yup.string().default(""),
  siguiente: yup
    .string()
    .default("")
    .test(
      "siguiente-no-menor",
      "La fecha del siguiente mantenimiento no puede ser anterior al último mantenimiento",
      function validateSiguiente(value) {
        const { ultimo } = this.parent as { ultimo?: string };
        if (!value?.trim() || !ultimo?.trim()) return true;
        return value >= ultimo;
      }
    ),
  aplicadoEl: yup
    .string()
    .default("")
    .test(
      "aplicado-max-hoy",
      "La fecha aplicada no puede ser posterior a hoy",
      (value) => {
        if (!value?.trim()) return true;
        return value <= new Date().toISOString().slice(0, 10);
      }
    ),
  tipoId: yup.number().nullable().default(null),
  agrupadorId: yup.number().nullable().default(null),
  proyectoId: yup.number().nullable().default(null),
});

export const mantCorrectivoSchema = yup.object({
  presupuesto: yup.string().default(""),
  ejercido: yup.string().default(""),
  fechaReporte: yup.string().default(""),
  fechaCorreccion: yup.string().default(""),
  descripcion: yup.string().default(""),
  notas: yup.string().default(""),
  tipoId: yup.number().nullable().default(null),
  agrupadorId: yup.number().nullable().default(null),
  proyectoId: yup.number().nullable().default(null),
});

export const mantPreventivoFollowUpSchema = yup.object({
  siguiente: yup
    .string()
    .required("La fecha del siguiente mantenimiento es obligatoria")
    .default(""),
});

export type MantPreventivoFormValues = yup.InferType<typeof mantPreventivoSchema>;
export type MantCorrectivoFormValues = yup.InferType<typeof mantCorrectivoSchema>;
export type MantPreventivoFollowUpFormValues = yup.InferType<
  typeof mantPreventivoFollowUpSchema
>;

export const defaultMantPreventivoValues: MantPreventivoFormValues = {
  ultimo: "",
  siguiente: "",
  aplicadoEl: "",
  tipoId: null,
  agrupadorId: null,
  proyectoId: null,
};

export const defaultMantCorrectivoValues: MantCorrectivoFormValues = {
  presupuesto: "",
  ejercido: "",
  fechaReporte: "",
  fechaCorreccion: "",
  descripcion: "",
  notas: "",
  tipoId: null,
  agrupadorId: null,
  proyectoId: null,
};

export const defaultMantPreventivoFollowUpValues: MantPreventivoFollowUpFormValues = {
  siguiente: "",
};
