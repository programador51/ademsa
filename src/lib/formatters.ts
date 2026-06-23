import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function formatFolio(
  value: number | string | null | undefined,
  pad = 5
): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (Number.isNaN(num)) return String(value);
  return String(num).padStart(pad, "0");
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return value;
  const month = MONTHS_ES[parsed.month()];
  return `${parsed.format("DD")}/${month}/${parsed.format("YYYY")} ${parsed.format("HH:mm")}`;
}

export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function parseMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function formatMoneyInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}
