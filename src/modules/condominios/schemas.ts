import * as yup from "yup";

export const condominioFormSchema = yup.object({
  nombre: yup.string().trim().required("El nombre es requerido"),
  direccion: yup.string().trim().default(""),
});

export type CondominioFormValues = yup.InferType<typeof condominioFormSchema>;

export const defaultCondominioFormValues: CondominioFormValues = {
  nombre: "",
  direccion: "",
};
