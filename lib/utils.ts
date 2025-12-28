import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string) {
  const currencyMap: { [key: string]: string } = {
    "TL": "TRY",
    "tl": "TRY",
  };

  const isoCurrency = currencyMap[currency] || currency || "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: isoCurrency,
    }).format(amount);
  } catch (error) {
    console.error(`Invalid currency code: ${currency}`, error);
    // Fallback to simple formatting if Intl fails
    return `${isoCurrency} ${amount.toFixed(2)}`;
  }
}

