import React, { createContext, useCallback, useContext, useState } from "react";

interface CalculatorContextValue {
  isOpen: boolean;
  openCalculator: () => void;
  closeCalculator: () => void;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openCalculator = useCallback(() => setIsOpen(true), []);
  const closeCalculator = useCallback(() => setIsOpen(false), []);
  return (
    <CalculatorContext.Provider value={{ isOpen, openCalculator, closeCalculator }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error("useCalculator must be used within CalculatorProvider");
  return ctx;
}
