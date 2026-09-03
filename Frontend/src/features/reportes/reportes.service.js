import { api } from "../../config/api";

export const reportesService = {
    getHistorial: async () => {
        return await api.get("/reportes/historial");
    },
    getMasVendidos: async () => {
        return await api.get("/reportes/mas-vendido");
    },
    getClientesFrecuentes: async () => {
        return await api.get("/reportes/cliente-frecuente");
    },
    getResumen: async () => {
        return await api.get("/reportes/resumen");
    },
    getVentasMensuales: async () => {
        return await api.get("/reportes/mensual");
    },
    getMetricasGrales: async () => {
        return await api.get("/reportes/metricas-grales");
    }
};
