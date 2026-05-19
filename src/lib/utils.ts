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

export function formatRadius(meters: number) {
  if (meters >= 1000) {
    const km = meters / 1000;
    return Number.isInteger(km) ? `${km}km` : `${km.toFixed(1)}km`;
  }
  return `${meters}m`;
}

// 상호명 마스킹 — 첫 글자/끝 글자만 남기고 가운데 ○
export function maskBizName(name: string) {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  if (trimmed.length === 2) return trimmed[0] + "○";
  return trimmed[0] + "○".repeat(trimmed.length - 2) + trimmed[trimmed.length - 1];
}

// 주소에서 번지만 마스킹 (행정구역·도로명은 유지)
export function maskAddress(addr: string) {
  if (!addr) return "";
  // 끝의 숫자(번지·호수)만 ○로
  return addr.replace(/\s*\d+(-\d+)?(\s*\([^)]+\))?$/, " ○");
}
