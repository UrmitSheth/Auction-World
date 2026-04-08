import { createContext, useContext, useState } from "react";

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("INR");

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
