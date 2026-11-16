import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Expense, Trip } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatage déterministe (identique serveur / client) : 1 500 000 */
export function formatNumber(value: number): string {
  const sign = value < 0 ? "-" : "";
  const digits = Math.round(Math.abs(value)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function fcfa(value: number): string {
  return `${formatNumber(value)} FCFA`;
}

/** Version compacte pour les axes : 4,2 M */
export function compactFcfa(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (Math.abs(value) >= 1_000) return `${Math.round(value / 1_000)} k`;
  return String(value);
}

export function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits).replace(".", ",")} %`;
}

export function tripExpenses(trip: Trip): number {
  return trip.expenses.reduce((sum, x) => sum + x.amount, 0);
}

export function tripMargin(trip: Trip): number {
  return trip.billed - tripExpenses(trip);
}

export function flaggedExpenses(trip: Trip): Expense[] {
  return trip.expenses.filter((x) => x.status === "anomalie" || x.status === "sans reçu");
}

export function shortCity(name: string): string {
  return name.replace("Port de ", "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Écart de consommation en % par rapport à la référence du camion. */
export function fuelDeviation(consumption: number, reference: number): number {
  return ((consumption - reference) / reference) * 100;
}

export function decimal(value: number, digits = 1): string {
  return value.toFixed(digits).replace(".", ",");
}
