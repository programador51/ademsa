import { FIELDS, ROLES } from "./constants";

export interface BaserowListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BaserowLinkRow {
  id: number;
  value: string;
}

export interface BaserowFile {
  url: string;
  name: string;
}

export interface BaserowSelectOption {
  id: number;
  value: string;
  color: string;
}

type BaserowRow = {
  id: number;
  order: string;
};

export type Condominio = BaserowRow & {
  [FIELDS.CONDOMINIOS.NOMBRE]: string;
  [FIELDS.CONDOMINIOS.DIRECCION]: string;
  [FIELDS.CONDOMINIOS.USUARIOS]: BaserowLinkRow[];
};

export type Usuario = BaserowRow & {
  [FIELDS.USUARIOS.NOMBRE]: string;
  [FIELDS.USUARIOS.EMAIL]: string;
  [FIELDS.USUARIOS.ROL]: BaserowSelectOption | number | null;
  [FIELDS.USUARIOS.CONTRASENA]: boolean | null;
  [FIELDS.USUARIOS.CONDOMINIOS]: BaserowLinkRow[];
  [FIELDS.USUARIOS.UNIDADES]: BaserowLinkRow[];
};

export type Reporte = BaserowRow & {
  [FIELDS.REPORTES.DESCRIPCION]: string;
  [FIELDS.REPORTES.FECHA_REPORTE]: string | null;
  [FIELDS.REPORTES.IMAGENES]: BaserowFile[];
  [FIELDS.REPORTES.CONDOMINIO]: BaserowLinkRow[];
  [FIELDS.REPORTES.AGRUPADORES]: BaserowLinkRow[];
};

export type Tipo = BaserowRow & {
  [FIELDS.TIPOS.NOMBRE]: string;
  [FIELDS.TIPOS.CREADO]: string | null;
  [FIELDS.TIPOS.AGRUPADORES]: BaserowLinkRow[];
  [FIELDS.TIPOS.CONDOMINIO]: BaserowLinkRow | BaserowLinkRow[] | null;
};

export type Agrupador = BaserowRow & {
  [FIELDS.AGRUPADORES.NOMBRE]: string;
  [FIELDS.AGRUPADORES.CREADO]: string | null;
  [FIELDS.AGRUPADORES.PROYECTOS]: BaserowLinkRow[];
  [FIELDS.AGRUPADORES.TIPO]: BaserowLinkRow[];
  [FIELDS.AGRUPADORES.REPORTES]: BaserowLinkRow[];
};

export type Proyecto = BaserowRow & {
  [FIELDS.PROYECTOS.NOMBRE]: string;
  [FIELDS.PROYECTOS.DETALLES]: string;
  [FIELDS.PROYECTOS.CREADO]: string | null;
  [FIELDS.PROYECTOS.AGRUPADOR]: BaserowLinkRow[];
  [FIELDS.PROYECTOS.CONDOMINIO]: BaserowLinkRow[];
};

export type MantenimientoPreventivo = BaserowRow & {
  [FIELDS.MANT_PREVENTIVOS.FOLIO]: number;
  [FIELDS.MANT_PREVENTIVOS.ULTIMO]: string | null;
  [FIELDS.MANT_PREVENTIVOS.SIGUIENTE]: string | null;
  [FIELDS.MANT_PREVENTIVOS.PROYECTO]: BaserowLinkRow[];
};

export type MantenimientoCorrectivo = BaserowRow & {
  [FIELDS.MANT_CORRECTIVOS.FOLIO]: number;
  [FIELDS.MANT_CORRECTIVOS.PRESUPUESTO]: string | null;
  [FIELDS.MANT_CORRECTIVOS.EJERCIDO]: string | null;
  [FIELDS.MANT_CORRECTIVOS.PROYECTO]: BaserowLinkRow[];
};

export type Inversion = BaserowRow & {
  [FIELDS.INVERSIONES.FOLIO]: number;
  [FIELDS.INVERSIONES.FECHA]: string | null;
  [FIELDS.INVERSIONES.PRESUPUESTO]: string | null;
  [FIELDS.INVERSIONES.INGRESO]: string | null;
  [FIELDS.INVERSIONES.EJERCIDO]: string | null;
  [FIELDS.INVERSIONES.PROYECTO]: BaserowLinkRow[];
  [FIELDS.INVERSIONES.ESTATUS]: BaserowSelectOption | number | null;
};

export type Unidad = BaserowRow & {
  [FIELDS.UNIDADES.NUMERO]: string;
  [FIELDS.UNIDADES.EDIFICIO]: string;
  [FIELDS.UNIDADES.INDIVISO]: string | null;
  [FIELDS.UNIDADES.PROPIETARIO]: BaserowLinkRow[];
  [FIELDS.UNIDADES.CONDOMINIO]: BaserowLinkRow[];
};

export type UserRole = typeof ROLES.ADMINISTRADOR | typeof ROLES.RESIDENTE;

export interface SessionUser {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  rolLabel: string;
  condominioIds: number[];
  unidadIds: number[];
}

export interface SessionPayload {
  user: SessionUser;
  exp: number;
}
