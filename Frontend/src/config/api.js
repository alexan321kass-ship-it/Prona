/**
 * Configuración de la API
 * Centraliza la URL base para todas las llamadas al backend
 */

// URL base del backend
export const API_BASE = "http://localhost:4000/api";
export const UPLOAD_BASE = "http://localhost:4000";

/**
 * Helper para hacer peticiones al backend
 * Ahora usa cookies HttpOnly para autenticación
 * @param {string} endpoint - Ruta del endpoint (sin /api)
 * @param {object} options - Opciones de fetch
 * @returns {Promise<any>} - Respuesta JSON
 */
export const fetchAPI = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;

    // Si el body es FormData, el navegador pone el Content-Type automáticamente con el boundary
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: "include", // Envía la cookie HttpOnly automáticamente en cada petición
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Error en la petición");
        }

        return data;
    } catch (error) {
        console.error(`❌ Error en ${endpoint}:`, error);
        throw error;
    }
};

/**
 * Métodos HTTP simplificados
 */
export const api = {
    get: (endpoint) => fetchAPI(endpoint, { method: "GET" }),

    post: (endpoint, body) => fetchAPI(endpoint, {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),

    put: (endpoint, body) => fetchAPI(endpoint, {
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),

    patch: (endpoint, body) => fetchAPI(endpoint, {
        method: "PATCH",
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),

    delete: (endpoint) => fetchAPI(endpoint, { method: "DELETE" })
};

export default api;
