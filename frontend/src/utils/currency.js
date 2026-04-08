// Static rates relative to USD (backend stores prices in USD)
export const rates = {
  USD: 1,
  INR: 83,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 150,
  AED: 3.67,
  CAD: 1.35,
  AUD: 1.5,
};

/**
 * @param {number} priceUSD - Price in USD (as stored in backend)
 * @param {string} currency - Target currency code
 * @returns {number} Converted price
 */
export function convertPrice(priceUSD, currency) {
  const rate = rates[currency];
  if (rate == null) return priceUSD;
  return priceUSD * rate;
}

/**
 * @param {number} priceCur - Price in local currency
 * @param {string} currency - Source currency code
 * @returns {number} Converted price in USD
 */
export function convertToUSD(priceCur, currency) {
  const rate = rates[currency];
  if (rate == null || rate === 0) return priceCur;
  return priceCur / rate;
}

export const currencySymbols = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AED: "د.إ",
  CAD: "C$",
  AUD: "A$",
};
