import {
  BASEROW_URL,
  FIELDS,
  ROLE_LABELS,
  ROLES,
  TABLES,
} from "@/lib/baserow/constants";
import { getServerClient } from "@/lib/baserow/client";
import { fieldId, getLinkIds, getSelectId } from "@/lib/baserow/utils";
import { SessionUser, Usuario } from "@/lib/baserow/types";

export async function findUserByEmail(email: string): Promise<Usuario | null> {
  const filter = JSON.stringify({
    filter_type: "AND",
    filters: [
      {
        type: "equal",
        field: FIELDS.USUARIOS.EMAIL.split('_')[1],
        value: email.trim().toLowerCase(),
      },
    ],
  });

  

  const { data } = await getServerClient().get<{ results: Usuario[] }>(
    `/api/database/rows/table/${TABLES.USUARIOS}/`,
    { params: { filters: filter, user_field_names: false, size: 1 } }
  );

  return data.results[0] ?? null;
}

export async function verifyUserPassword(
  rowId: number,
  password: string
): Promise<boolean> {
  try {
    await getServerClient().post(
      `${BASEROW_URL}/api/database/fields/password-authentication/`,
      {
        password,
        field_id: fieldId(FIELDS.USUARIOS.CONTRASENA),
        row_id: rowId,
      }
    );
    return true;
  } catch {
    return false;
  }
}

export function mapUsuarioToSession(user: Usuario): SessionUser | null {
  const rolId = getSelectId(user[FIELDS.USUARIOS.ROL]);
  if (rolId !== ROLES.ADMINISTRADOR && rolId !== ROLES.RESIDENTE) {
    return null;
  }

  return {
    id: user.id,
    nombre: user[FIELDS.USUARIOS.NOMBRE],
    email: user[FIELDS.USUARIOS.EMAIL],
    rol: rolId,
    rolLabel: ROLE_LABELS[rolId] ?? "Usuario",
    condominioIds: getLinkIds(user[FIELDS.USUARIOS.CONDOMINIOS]),
    unidadIds: getLinkIds(user[FIELDS.USUARIOS.UNIDADES]),
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    return mapUsuarioToSession(user);
  }

  const valid = await verifyUserPassword(user.id, trimmedPassword);
  if (!valid) return null;

  return mapUsuarioToSession(user);
}
