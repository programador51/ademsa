import * as yup from "yup";

export const inversionFormSchema = yup.object({
  fecha: yup.string().default(""),
  presupuesto: yup.string().default(""),
  ingreso: yup.string().default(""),
  concluido: yup.string().default(""),
  tipoId: yup.number().nullable().default(null),
  agrupadorId: yup.number().nullable().default(null),
  proyectoId: yup.number().nullable().default(null),
});

export type InversionFormValues = yup.InferType<typeof inversionFormSchema>;

export const defaultInversionFormValues: InversionFormValues = {
  fecha: "",
  presupuesto: "",
  ingreso: "",
  concluido: "",
  tipoId: null,
  agrupadorId: null,
  proyectoId: null,
};
