import { NextRequest, NextResponse } from "next/server";
import { getRow, updateRow, deleteRow } from "@/lib/baserow/client";
import { TABLES } from "@/lib/baserow/constants";
import { getSessionUser } from "@/lib/auth/session";

const TABLE_MAP: Record<string, number> = {
  condominios: TABLES.CONDOMINIOS,
  usuarios: TABLES.USUARIOS,
  reportes: TABLES.REPORTES,
  tipos: TABLES.TIPOS,
  agrupadores: TABLES.AGRUPADORES,
  proyectos: TABLES.PROYECTOS,
  "mant-preventivos": TABLES.MANTENIMIENTOS_PREVENTIVOS,
  "mant-correctivos": TABLES.MANTENIMIENTOS_CORRECTIVOS,
  inversiones: TABLES.INVERSIONES,
  unidades: TABLES.UNIDADES,
};

function resolveTable(tableKey: string): number | null {
  return TABLE_MAP[tableKey] ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { table, id } = await params;
  const tableId = resolveTable(table);
  if (!tableId) {
    return NextResponse.json({ error: "Tabla no encontrada" }, { status: 404 });
  }

  const data = await getRow(tableId, Number(id));
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { table, id } = await params;
  const tableId = resolveTable(table);
  if (!tableId) {
    return NextResponse.json({ error: "Tabla no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const data = await updateRow(tableId, Number(id), body);
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { table, id } = await params;
  const tableId = resolveTable(table);
  if (!tableId) {
    return NextResponse.json({ error: "Tabla no encontrada" }, { status: 404 });
  }

  await deleteRow(tableId, Number(id));
  return NextResponse.json({ ok: true });
}
