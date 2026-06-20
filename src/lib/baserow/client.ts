import axios, { AxiosInstance } from "axios";
import { BASEROW_URL } from "./constants";
import { BaserowListResponse } from "./types";

let serverClient: AxiosInstance | null = null;

export function getServerClient(): AxiosInstance {
  if (serverClient) return serverClient;

  const token = process.env.BASEROW_DATABASE_TOKEN;
  if (!token) {
    throw new Error("BASEROW_DATABASE_TOKEN no está configurado");
  }

  serverClient = axios.create({
    baseURL: BASEROW_URL,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return serverClient;
}

export async function listRows<T>(
  tableId: number,
  params?: Record<string, string | number | boolean>
): Promise<BaserowListResponse<T>> {  

  const { data } = await getServerClient().get<BaserowListResponse<T>>(
    `/api/database/rows/table/${tableId}/`,
    { params: { user_field_names: false, size: 200, ...params } }
  );
  return data;
}

export async function getRow<T>(tableId: number, rowId: number): Promise<T> {
  const { data } = await getServerClient().get<T>(
    `/api/database/rows/table/${tableId}/${rowId}/`,
    { params: { user_field_names: false } }
  );
  return data;
}

export async function createRow<T>(
  tableId: number,
  payload: Record<string, unknown>
): Promise<T> {
  const { data } = await getServerClient().post<T>(
    `/api/database/rows/table/${tableId}/`,
    payload,
    { params: { user_field_names: false } }
  );
  return data;
}

export async function updateRow<T>(
  tableId: number,
  rowId: number,
  payload: Record<string, unknown>
): Promise<T> { 

  const { data } = await getServerClient().patch<T>(
    `/api/database/rows/table/${tableId}/${rowId}/`,
    payload,
    { params: { user_field_names: false } }
  );
  return data;
}

export async function deleteRow(tableId: number, rowId: number): Promise<void> {
  await getServerClient().delete(
    `/api/database/rows/table/${tableId}/${rowId}/`
  );
}

export async function uploadFileServer(
  formData: FormData
): Promise<{ name: string; url: string }> {
  const { data } = await getServerClient().post<{ name: string; url: string }>(
    "/api/user/files/upload/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export function linkIds(ids: number[]): number[] {
  return ids;
}

export { getLinkIds, getLinkLabel, getSelectId } from "./utils";
