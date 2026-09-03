import { api } from "../../config/api";

export const clientesService = {
    getAll: async () => {
        return await api.get("/clientes");
    },
    search: async (q) => {
        return await api.get(`/clientes/buscar?q=${q}`);
    },
    getById: async (id) => {
        return await api.get(`/clientes/${id}`);
    },
    create: async (data) => {
        return await api.post("/clientes", data);
    },
    update: async (id, data) => {
        return await api.put(`/clientes/${id}`, data);
    },
    delete: async (id) => {
        return await api.delete(`/clientes/${id}`);
    }
};