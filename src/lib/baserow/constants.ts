export const BASEROW_URL =
  process.env.NEXT_PUBLIC_BASEROW_URL ?? "https://api.baserow.io";

export const TABLES = {
  CONDOMINIOS: 1034042,
  USUARIOS: 1034043,
  REPORTES: 1034050,
  TIPOS: 1034069,
  AGRUPADORES: 1034070,
  PROYECTOS: 1034073,
  MANTENIMIENTOS_PREVENTIVOS: 1034081,
  MANTENIMIENTOS_CORRECTIVOS: 1034084,
  INVERSIONES: 1034085,
  UNIDADES: 1035837,
} as const;

export const FIELDS = {
  USUARIOS: {
    NOMBRE: "field_9103158",
    EMAIL: "field_9103167",
    ROL: "field_9103168",
    CONTRASENA: "field_9103304",
    CONDOMINIOS: "field_9103307",
    UNIDADES: "field_9123030",
  },
  REPORTES: {
    DESCRIPCION: "field_9103165",
    FECHA_REPORTE: "field_9103206",
    IMAGENES: "field_9103207",
    CONDOMINIO: "field_9103323",
    AGRUPADORES: "field_9103565",
    REPORTADO_POR: "field_9143122",
    ESTATUS: "field_9171145",
    FECHA_CIERRE: "field_9171147",
  },
  TIPOS: {
    NOMBRE: "field_9103350",
    CREADO: "field_9103351",
    AGRUPADORES: "field_9103564",
    CONDOMINIO: "field_9122984",
  },
  AGRUPADORES: {
    NOMBRE: "field_9103354",
    CREADO: "field_9103355",
    PROYECTOS: "field_9103512",
    TIPO: "field_9103563",
    REPORTES: "field_9103566",
  },
  PROYECTOS: {
    NOMBRE: "field_9103372",
    DETALLES: "field_9103373",
    CREADO: "field_9103374",
    AGRUPADOR: "field_9103511",
    MANT_PREVENTIVOS: "field_9103517",
    MANT_CORRECTIVOS: "field_9103534",
    INVERSIONES: "field_9103541",
    CONDOMINIO: "field_9103560",
  },
  MANT_PREVENTIVOS: {
    FOLIO: "field_9103513",
    ULTIMO: "field_9103514",
    SIGUIENTE: "field_9103515",
    PROYECTO: "field_9103516",
  },
  MANT_CORRECTIVOS: {
    FOLIO: "field_9103528",
    PRESUPUESTO: "field_9103529",
    EJERCIDO: "field_9103532",
    PROYECTO: "field_9103533",
    FECHA_REPORTE: "field_9170647",
    DESCRIPCION: "field_9170649",
    FECHA_CORRECCION: "field_9170974",
    ESTATUS: "field_9191196",
  },
  INVERSIONES: {
    FOLIO: "field_9103535",
    FECHA: "field_9103536",
    PRESUPUESTO: "field_9103537",
    INGRESO: "field_9103538",
    EJERCIDO: "field_9103539",
    PROYECTO: "field_9103540",
    CONCLUIDO: "field_9191223",
    ESTADO: "field_9191246",
  },
  UNIDADES: {
    NUMERO: "field_9123026",
    EDIFICIO: "field_9123027",
    INDIVISO: "field_9123028",
    PROPIETARIO: "field_9123029",
    CONDOMINIO: "field_9123031",
  },
  CONDOMINIOS: {
    NOMBRE: "field_9103157",
    DIRECCION: "field_9103166",
    USUARIOS: "field_9103308",
  },
} as const;

export const ROLES = {
  ADMINISTRADOR: 6546168,
  RESIDENTE: 6546169,
} as const;

export const INVERSION_ESTADO = {
  PLANEADO: "Planeado",
  EN_PROCESO: "En proceso",
  TERMINADO: "Terminado",
} as const;

export const MANT_CORRECTIVO_ESTATUS = {
  EN_FALLO: "En Fallo",
  EN_OPERACION: "En operacion",
} as const;

export const REPORTE_ESTATUS = {
  ABIERTA: 6594921,
  CERRADA: 6594922,
} as const;

export const REPORTE_ESTATUS_LABELS: Record<number, string> = {
  [REPORTE_ESTATUS.ABIERTA]: "Abierta",
  [REPORTE_ESTATUS.CERRADA]: "Cerrada",
};

export const ROLE_LABELS: Record<number, string> = {
  [ROLES.ADMINISTRADOR]: "Administrador",
  [ROLES.RESIDENTE]: "Residente",
};
