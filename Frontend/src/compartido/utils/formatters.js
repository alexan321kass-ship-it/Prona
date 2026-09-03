/**
 * Utilidades para formateo de datos en toda la aplicación
 */

/**
 * Formatea un número como moneda colombiana (COP)
 * @param {number|string} precio 
 * @returns {string}
 */
export const formatearPrecio = (precio) => {
    const valor = parseFloat(precio) || 0;
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    }).format(valor);
};

/**
 * Formatea una fecha en formato legible (es-ES)
 * @param {string|Date} fecha 
 * @param {object} options 
 * @returns {string}
 */
export const formatearFecha = (fecha, options = {}) => {
    if (!fecha) return "-";
    const defaultOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...options
    };
    return new Date(fecha).toLocaleDateString("es-ES", defaultOptions);
};
