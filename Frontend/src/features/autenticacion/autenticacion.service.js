import { api } from "../../config/api";

export const servicioAutenticacion = {
    /**
     * Inicia sesión de usuario
     * El token JWT ahora se guarda como cookie HttpOnly (lo maneja el backend)
     * Solo guardamos la info del usuario para la UI
     * @param {string} correo 
     * @param {string} contrasena 
     * @returns {Promise<object>}
     */
    login: async (correo, contrasena) => {
        const data = await api.post("/auth/login", { correo, contrasena });
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        if (data.user) {
            localStorage.setItem("usuario", JSON.stringify(data.user));
        }
        return data;
    },

    /**
     * Registra un nuevo usuario
     * @param {object} userData 
     * @returns {Promise<object>}
     */
    register: async (userData) => {
        return await api.post("/users/register", userData);
    },

    /**
     * Cierra la sesión — primero destruye la cookie en el backend, luego limpia el localStorage
     */
    logout: async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            // Si el backend falla, igual limpiamos localmente
            console.warn("No se pudo contactar al backend para logout:", e);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "/login";
    },

    /**
     * Solicita la recuperación de contraseña
     * @param {string} correo 
     * @returns {Promise<object>}
     */
    forgotPassword: async (correo) => {
        return await api.post("/auth/forgot-password", { correo });
    },

    /**
     * Restablece la contraseña usando el token
     * @param {string} token 
     * @param {string} nuevaContrasena 
     * @returns {Promise<object>}
     */
    resetPassword: async (token, codigo, nuevaContrasena) => {
        return await api.post("/auth/reset-password", { token, codigo, nuevaContrasena });
    },

    /**
     * Cambia la contraseña obligatoria de un usuario que acaba de ingresar
     * @param {string} nuevaContrasena 
     * @returns {Promise<object>}
     */
    changePassword: async (nuevaContrasena) => {
        return await api.post("/auth/change-password", { nuevaContrasena });
    }
};
