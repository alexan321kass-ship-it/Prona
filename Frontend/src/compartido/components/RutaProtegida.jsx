import React from "react";
import { Navigate } from "react-router-dom";
import DashboardLayout from "./Layout/DashboardLayout";

/**
 * Componente para proteger rutas según autenticación y roles
 * Ya no verifica el token (ahora es una cookie HttpOnly invisible para JS)
 * Solo verifica que exista la info del usuario en localStorage
 * @param {object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si es exitoso
 * @param {number} props.rolRequerido - ID del rol necesario (1: Admin, 2: Asesor)
 */
const RutaProtegida = ({ children, rolRequerido }) => {
    let usuario = null;

    try {
        usuario = JSON.parse(localStorage.getItem("usuario"));
    } catch (e) {
        console.error("Error al parsear el usuario", e);
    }

    // Si no hay sesión, al login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si hay rol requerido y no coincide, al login o dashboard base
    // NOTA: El admin (1) puede entrar a rutas de asesor (2)
    const idRol = Number(usuario.id_rol);
    if (rolRequerido && idRol !== rolRequerido && idRol !== 1 && idRol !== 3) {
        return <Navigate to="/" replace />;
    }

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
};

export default RutaProtegida;
