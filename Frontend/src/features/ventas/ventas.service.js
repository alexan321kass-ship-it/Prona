import { api } from "../../config/api";

export const ventasService = {
    crearDevolucion: async (id_venta, motivo) => {
        return await api.post(`/ventas/${id_venta}/devolucion`, { motivo });
    }
};
