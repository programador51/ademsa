import { createTableRow } from "@/lib/api/data";
import { FIELDS } from "./constants";
import { Agrupador, Proyecto, Tipo } from "./types";

const DEFAULT_TIPOS = ["Seguridad", "Limpieza", "Administracion"] as const;
const DEFAULT_NA = "N/A";

export async function seedCondominioServicios(condominioId: number): Promise<void> {
  for (const nombreTipo of DEFAULT_TIPOS) {
    const tipo = await createTableRow<Tipo>("tipos", {
      [FIELDS.TIPOS.NOMBRE]: nombreTipo,
      [FIELDS.TIPOS.CONDOMINIO]: condominioId,
    });

    const agrupador = await createTableRow<Agrupador>("agrupadores", {
      [FIELDS.AGRUPADORES.NOMBRE]: DEFAULT_NA,
      [FIELDS.AGRUPADORES.TIPO]: [tipo.id],
    });

    await createTableRow<Proyecto>("proyectos", {
      [FIELDS.PROYECTOS.NOMBRE]: DEFAULT_NA,
      [FIELDS.PROYECTOS.DETALLES]: "",
      [FIELDS.PROYECTOS.CONDOMINIO]: [condominioId],
      [FIELDS.PROYECTOS.AGRUPADOR]: [agrupador.id],
    });
  }
}
