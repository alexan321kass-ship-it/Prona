/**
 * Configuración de la API
 * Centraliza la URL base para todas las llamadas al backend
 */

// URL base del backend - usa variable de entorno en producción
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export const UPLOAD_BASE = import.meta.env.VITE_UPLOAD_URL || "http://localhost:4000";

/**
 * Helper para hacer peticiones al backend
 * Ahora usa cookies HttpOnly para autenticación
 * @param {string} endpoint - Ruta del endpoint (sin /api)
 * @param {object} options - Opciones de fetch
 * @returns {Promise<any>} - Respuesta JSON
 */
export const fetchAPI = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;

    const isFormData = options.body instanceof FormData;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
            if (response.status === 401 && typeof window !== "undefined") {
                localStorage.removeItem("usuario");
                localStorage.removeItem("token");
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
            let errorMessage = data.message;
            if (Array.isArray(errorMessage)) {
                errorMessage = errorMessage.join(", ");
            }
            throw new Error(errorMessage || data.error || "Error en la petición");
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
