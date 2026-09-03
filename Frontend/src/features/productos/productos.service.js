import { api } from "../../config/api";

export const productosService = {
    /**
     * Obtiene todos los productos
     */
    getAll: async () => {
        const data = await api.get("/productos");
        return data.productos;
    },

    /**
     * Obtiene todas las categorías
     */
    getCategories: async () => {
        const data = await api.get("/productos/categorias");
        return data.categorias;
    },

    createCategory: async (data) => {
        return await api.post("/productos/categorias", data);
    },

    updateCategory: async (id, data) => {
        return await api.put(`/productos/categorias/${id}`, data);
    },

    deleteCategory: async (id) => {
        return await api.delete(`/productos/categorias/${id}`);
    },

    /**
     * Obtiene productos por categoría
     */
    getByCategory: async (id) => {
        if (!id) return productosService.getAll();
        const data = await api.get(`/productos/categoria/${id}`);
        return data.productos;
    },

    /**
     * Crea un nuevo producto
     */
    create: async (productoData) => {
        return await api.post("/productos", productoData);
    },

    /**
     * Actualiza un producto
     */
    update: async (id, productoData) => {
        return await api.put(`/productos/${id}`, productoData);
    },

    /**
     * Elimina un producto
     */
    delete: async (id) => {
        return await api.delete(`/productos/${id}`);
    },

    /**
     * Subida masiva de productos (Excel/CSV)
     */
    bulkUpload: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return await api.post("/productos/bulk", formData);
    }
};
