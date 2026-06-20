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

export function getLinkIds(
  value: { id: number; value: string }[] | number[] | null | undefined
): number[] {
  if (!value?.length) return [];
  if (typeof value[0] === "number") return value as number[];
  return (value as { id: number; value: string }[]).map((item) => item.id);
}

export function getLinkLabel(
  value: { id: number; value: string }[] | null | undefined
): string {
  if (!value?.length) return "—";
  return value.map((item) => item.value).join(", ");
}

export function buildFieldFilter(
  field: string,
  type: string,
  value: string | number
) {
  return JSON.stringify({
    filter_type: "AND",
    filters: [{ type, field, value }],
  });
}

export function buildCondominioFilter(condominioId: number, field: string) {
  return buildFieldFilter(field, "link_row_has", condominioId);
}
