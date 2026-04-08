import { useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { useCurrency } from "../context/CurrencyContext";
import { currencySymbols } from "../utils/currency";

const CURRENCIES = [
  { code: "INR", countryCode: "IN", symbol: "₹" },
  { code: "USD", countryCode: "US", symbol: "$" },
  { code: "EUR", countryCode: "DE", symbol: "€" },
  { code: "GBP", countryCode: "GB", symbol: "£" },
  { code: "JPY", countryCode: "JP", symbol: "¥" },
  { code: "AED", countryCode: "AE", symbol: "د.إ" },
  { code: "CAD", countryCode: "CA", symbol: "C$" },
  { code: "AUD", countryCode: "AU", symbol: "A$" },
];

export const CurrencySelector = ({ variant = "navbar" }) => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const isCompact = variant === "create";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
          isCompact ? "px-3 py-2 text-sm" : "px-4 py-2"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select currency"
      >
        <ReactCountryFlag
          countryCode={current.countryCode}
          svg
          style={{ width: "1.5em", height: "1.5em", borderRadius: "2px" }}
          title={current.code}
        />
        <span className="font-semibold text-[var(--color-text-heading)]">
          {current.code} ({currencySymbols[current.code]})
        </span>
        <svg className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute left-0 mt-2 w-full min-w-[200px] bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-50 max-h-72 overflow-y-auto"
        >
          {CURRENCIES.map((c) => (
            <li key={c.code} role="option" aria-selected={currency === c.code}>
              <button
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[var(--color-bg-tertiary)] transition-colors ${
                  currency === c.code ? "bg-[var(--color-accent-light)] text-[var(--color-accent)] font-bold" : "text-[var(--color-text)]"
                }`}
              >
                <ReactCountryFlag countryCode={c.countryCode} svg style={{ width: "1.5em", height: "1.5em", borderRadius: "2px", flexShrink: 0 }} title={c.code} />
                <span>{c.code} ({c.symbol})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
