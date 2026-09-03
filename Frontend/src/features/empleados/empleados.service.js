import { api } from "../../config/api";

export const servicioEmpleados = {
    obtenerTodos: async () => {
        return await api.get("/users");
    },
    cambiarEstado: async (id, estado) => {
        return await api.put(`/users/${id}/estado`, { estado });
    },
    resetPassword: async (id) => {
        return await api.post(`/users/${id}/reset-password`);
    },
    actualizar: async (id, datos) => {
        return await api.put(`/users/${id}`, datos);
    }
};
