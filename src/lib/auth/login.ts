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

export function userHasPassword(user: Usuario): boolean {
  return user[FIELDS.USUARIOS.CONTRASENA] === true;
}

export type AuthenticateResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: "not_found" | "password_required" | "invalid_password" };

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticateResult> {
  const user = await findUserByEmail(email);
  if (!user) return { ok: false, reason: "not_found" };

  const trimmedPassword = password.trim();
  const hasPassword = userHasPassword(user);

  if (!hasPassword) {
    const sessionUser = mapUsuarioToSession(user);
    if (!sessionUser) return { ok: false, reason: "not_found" };
    return { ok: true, user: sessionUser };
  }

  if (!trimmedPassword) {
    return { ok: false, reason: "password_required" };
  }

  const valid = await verifyUserPassword(user.id, trimmedPassword);
  if (!valid) return { ok: false, reason: "invalid_password" };

  const sessionUser = mapUsuarioToSession(user);
  if (!sessionUser) return { ok: false, reason: "not_found" };

  return { ok: true, user: sessionUser };
}
