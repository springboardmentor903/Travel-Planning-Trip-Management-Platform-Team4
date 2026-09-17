"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "JPY";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  rateVsINR: number; // 1 INR = rateVsINR in target currency
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", rateVsINR: 1.0 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", rateVsINR: 0.012 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", rateVsINR: 0.011 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", rateVsINR: 0.0094 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", rateVsINR: 1.81 },
};

export function convertAmount(amountInINR: number | null | undefined, targetCurrency: CurrencyCode): {
  amount: number;
  currency: CurrencyCode;
  isApproximate: boolean;
} {
  if (amountInINR == null || isNaN(amountInINR)) {
    return { amount: 0, currency: targetCurrency, isApproximate: false };
  }

  const info = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.INR;
  const converted = amountInINR * info.rateVsINR;

  return {
    amount: converted,
    currency: info.code,
    isApproximate: info.code !== "INR",
  };
}

export function formatCurrencyValue(
  amountInINR: number | null | undefined,
  currencyCode: CurrencyCode = "INR"
): string {
  if (amountInINR == null || isNaN(amountInINR)) {
    return "N/A";
  }

  try {
    const { amount, currency } = convertAmount(amountInINR, currencyCode);
    const info = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;

    const fractionDigits = currency === "JPY" ? 0 : 0;

    const formatter = new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    });

    return formatter.format(amount);
  } catch (err) {
    // Fallback: Return original base INR formatting
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amountInINR);
    } catch {
      return `₹${amountInINR}`;
    }
  }
}

// React Context for Global Selected Currency
interface CurrencyContextType {
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (code: CurrencyCode) => void;
  format: (amountInINR: number | null | undefined) => string;
  isConverted: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  selectedCurrency: "INR",
  setSelectedCurrency: () => {},
  format: (val) => formatCurrencyValue(val, "INR"),
  isConverted: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>("INR");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tripnest_currency") as CurrencyCode;
      if (stored && SUPPORTED_CURRENCIES[stored]) {
        setSelectedCurrencyState(stored);
      }
    }
  }, []);

  const setSelectedCurrency = (code: CurrencyCode) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setSelectedCurrencyState(code);
      if (typeof window !== "undefined") {
        localStorage.setItem("tripnest_currency", code);
      }
    }
  };

  const format = (amountInINR: number | null | undefined) => {
    return formatCurrencyValue(amountInINR, selectedCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        format,
        isConverted: selectedCurrency !== "INR",
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
