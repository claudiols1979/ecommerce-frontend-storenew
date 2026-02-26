// src/utils/formatters.js

/**
 * Formatea un número como un precio en colones costarricenses (CRC).
 * Ejemplo: 23000 se convierte en "₡23.000"
 * @param {number} price - El precio a formatear.
 * @returns {string} El precio formateado como un string.
 */
export const formatPrice = (price) => {
  // Si el precio no es un número válido, retorna un texto por defecto.
  if (typeof price !== "number" || isNaN(price)) {
    return "Precio no disponible";
  }

  // Añade el símbolo de colón al principio y redondea a 0 decimales.
  return `₡${Math.round(price).toLocaleString("es-CR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
