import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("ko-KR").format(n);
}

export function formatPercent(n: number | null | undefined, digits = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  return `${n.toFixed(digits)}%`;
}
