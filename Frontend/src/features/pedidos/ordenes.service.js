import { api } from "../../config/api";

export const ordenesService = {
    buscar: async (query) => {
        return await api.get(`/seguimiento/buscar?query=${encodeURIComponent(query)}`);
    },
    getDetalle: async (id) => {
        return await api.get(`/seguimiento/detalle/${id}`);
    },
    updateEstado: async (id, nuevoEstado) => {
        return await api.put(`/seguimiento/actualizar-estado/${id}`, { nuevoEstado });
    }
};
