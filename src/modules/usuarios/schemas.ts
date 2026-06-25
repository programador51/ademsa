import * as yup from "yup";

export type UsuariosTab = "usuarios" | "unidades";

export const usuarioFormSchema = yup.object({
  nombre: yup.string().trim().required("El nombre es requerido"),
  email: yup.string().trim().email("Email inválido").required("El email es requerido"),
  rol: yup.number().required("El rol es requerido"),
  condominioId: yup.number().nullable().default(null),
  unidadId: yup.number().nullable().default(null),
});

export const unidadFormSchema = yup.object({
  condominioId: yup.number().required("El condominio es requerido"),
  numero: yup.string().trim().required("El número es requerido"),
  edificio: yup.string().trim().required("El edificio es requerido"),
  indiviso: yup.string().default(""),
  propietarioId: yup.number().nullable().default(null),
});

export type UsuarioFormValues = yup.InferType<typeof usuarioFormSchema>;
export type UnidadFormValues = yup.InferType<typeof unidadFormSchema>;

export const defaultUsuarioFormValues: UsuarioFormValues = {
  nombre: "",
  email: "",
  rol: 0,
  condominioId: null,
  unidadId: null,
};

export const defaultUnidadFormValues: UnidadFormValues = {
  condominioId: 0,
  numero: "",
  edificio: "",
  indiviso: "",
  propietarioId: null,
};
