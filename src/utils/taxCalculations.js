export const getTaxRate = (ivaValue) => {
  if (!ivaValue) return 13; // Valor por defecto (13%)

  // Convertir a número (manejar tanto "13.0000%" como "13")
  const numericValue = parseFloat(ivaValue.toString().replace("%", ""));

  // Si no es un número válido, usar el valor por defecto
  if (isNaN(numericValue)) return 13;

  return numericValue;
};

export const calculatePriceWithTax = (price, ivaValue) => {
  const taxRate = getTaxRate(ivaValue);
  const total = price * (1 + taxRate / 100);
  // Redondear a 0 decimales (sin centavos)
  return Math.round(total);
};

export const calculateTaxAmount = (price, ivaValue) => {
  const taxRate = getTaxRate(ivaValue);
  const taxAmount = price * (taxRate / 100);
  // Redondear a 0 decimales (sin centavos)
  return Math.round(taxAmount);
};

export const formatPriceWithTax = (price, ivaValue) => {
  const total = calculatePriceWithTax(price, ivaValue);
  // Formatear como Colones (₡) sin decimales
  return `₡${total.toLocaleString("es-CR")}`;
};

// Función adicional para formatear precios base (sin impuesto)
export const formatPriceWithoutTax = (price) => {
  // Redondear precio base a 0 decimales
  const roundedPrice = Math.round(price);
  return `₡${roundedPrice.toLocaleString("es-CR")}`;
};
