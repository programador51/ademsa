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
  tipoId: yup.number().nullable().default(null),
  agrupadorId: yup.number().nullable().default(null),
  proyectoId: yup.number().nullable().default(null),
});

export const mantCorrectivoSchema = yup.object({
  presupuesto: yup.string().default(""),
  ejercido: yup.string().default(""),
  proyectoId: yup.number().nullable().default(null),
});

export type MantPreventivoFormValues = yup.InferType<typeof mantPreventivoSchema>;
export type MantCorrectivoFormValues = yup.InferType<typeof mantCorrectivoSchema>;

export const defaultMantPreventivoValues: MantPreventivoFormValues = {
  ultimo: "",
  siguiente: "",
  tipoId: null,
  agrupadorId: null,
  proyectoId: null,
};

export const defaultMantCorrectivoValues: MantCorrectivoFormValues = {
  presupuesto: "",
  ejercido: "",
  proyectoId: null,
};
