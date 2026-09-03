import { api } from "../../config/api";

export const usuariosService = {
    /**
     * Obtiene todos los usuarios (Admin)
     */
    getAll: async () => {
        const data = await api.get("/users");
        return data; // El endpoint devuelve directamente el array
    },

    /**
     * Obtiene un usuario por ID
     */
    getById: async (id) => {
        const data = await api.get(`/users/${id}`);
        return data;
    },

    /**
     * Crea un nuevo usuario (Admin)
     */
    create: async (userData) => {
        return await api.post("/users/register", userData); // Endpoint definido en users.controller.js
    },

    /**
     * Actualiza un usuario
     */
    update: async (id, userData) => {
        return await api.put(`/users/${id}`, userData);
    },

    /**
     * Elimina un usuario
     */
    delete: async (id) => {
        return await api.delete(`/users/${id}`);
    }
};
