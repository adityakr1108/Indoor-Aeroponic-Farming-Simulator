// Indian number formatting (INR)
export function formatINR(value: number): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatKg(value: number): string {
  return `${value.toFixed(2)} kg`;
}

export function formatYears(value: number): string {
  if (value < 0) return "Not reached";
  return `${value.toFixed(1)} years`;
}
