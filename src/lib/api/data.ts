import api from "@/lib/axios";
import { BaserowListResponse } from "@/lib/baserow/types";
import { buildCondominioFilter } from "@/lib/baserow/utils";

export type TableKey =
  | "condominios"
  | "usuarios"
  | "reportes"
  | "tipos"
  | "agrupadores"
  | "proyectos"
  | "mant-preventivos"
  | "mant-correctivos"
  | "inversiones"
  | "unidades";

export async function fetchTable<T>(
  table: TableKey,
  params?: Record<string, string>
): Promise<BaserowListResponse<T>> {
  const { data } = await api.get<BaserowListResponse<T>>(`/data/${table}`, {
    params,
  });
  return data;
}

export async function fetchRow<T>(table: TableKey, id: number): Promise<T> {
  const { data } = await api.get<T>(`/data/${table}/${id}`);
  return data;
}

export async function createTableRow<T>(
  table: TableKey,
  payload: Record<string, unknown>
): Promise<T> {
  const { data } = await api.post<T>(`/data/${table}`, payload);
  return data;
}

export async function updateTableRow<T>(
  table: TableKey,
  id: number,
  payload: Record<string, unknown>
): Promise<T> {
  const { data } = await api.patch<T>(`/data/${table}/${id}`, payload);
  return data;
}

export async function deleteTableRow(table: TableKey, id: number): Promise<void> {
  await api.delete(`/data/${table}/${id}`);
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<{ name: string; url: string }>(
    "/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export { buildCondominioFilter };
