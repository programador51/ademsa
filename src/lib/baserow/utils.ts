import { FIELDS } from "./constants";

export function fieldId(fieldKey: string): number {
  return Number(fieldKey.replace(/^field_/, ""));
}

export function getSelectId(
  value: { id: number; value: string } | number | null | undefined
): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  return value.id;
}

type BaserowLinkValue =
  | { id: number; value: string }
  | { id: number; value: string }[]
  | number
  | number[]
  | null
  | undefined;

function normalizeLinkRows(
  value: BaserowLinkValue
): { id: number; value: string }[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    if (!value.length) return [];
    if (typeof value[0] === "number") {
      return (value as number[]).map((id) => ({ id, value: "" }));
    }
    return value as { id: number; value: string }[];
  }
  if (typeof value === "number") return [{ id: value, value: "" }];
  return [value];
}

export function getLinkIds(value: BaserowLinkValue): number[] {
  return normalizeLinkRows(value).map((item) => Number(item.id));
}

export function getLinkLabel(value: BaserowLinkValue): string {
  const rows = normalizeLinkRows(value);
  if (!rows.length) return "—";
  return rows.map((item) => item.value).join(", ");
}

export function buildFieldFilter(
  field: string,
  type: string,
  value: string | number
) {
  return JSON.stringify({
    filter_type: "AND",
    filters: [
      {
        type,
        field: fieldId(field),
        value: String(value),
      },
    ],
  });
}

export function buildCondominioFilter(condominioId: number, field: string) {
  return buildFieldFilter(field, "link_row_has", condominioId);
}
