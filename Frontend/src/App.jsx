import React from "react";
import "./compartido/styles/global.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RutaProtegida from "./compartido/components/RutaProtegida.jsx";

// Rutas públicas
import Login from "./features/autenticacion/Login.jsx";
import Registro from "./features/autenticacion/Registro.jsx";
import RecuperarContrasena from "./features/autenticacion/RecuperarContrasena.jsx";
import RestablecerContrasena from "./features/autenticacion/RestablecerContrasena.jsx";

// Rutas internas
import DashboardAdmin from "./features/paneles/DashboardAdmin.jsx";
import GestionEmpleados from "./features/empleados/GestionEmpleados.jsx";
import DashboardAsesor from "./features/paneles/DashboardAsesor.jsx";
import Perfil from "./features/perfil/Perfil.jsx";
import Seguimiento from "./features/pedidos/Seguimiento.jsx";
import SeguimientoAdmin from "./features/pedidos/SeguimientoAdmin.jsx";
import Catalogo from "./features/productos/Catalogo.jsx";
import ReporteBasico from "./features/reportes/ReporteBasico.jsx";
import RegistroCliente from "./features/reportes/RegistroCliente.jsx";
import Pedidos from "./features/pedidos/Pedidos.jsx";
import Clientes from "./features/clientes/Clientes.jsx";
import GestionCategorias from "./features/productos/GestionCategorias.jsx";
import HistorialCotizaciones from "./features/cotizaciones/HistorialCotizaciones.jsx";
import { Navigate } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/reset-password" element={<RestablecerContrasena />} />

        {/* Dashboards protegidos */}
        <Route path="/empleados" element={<RutaProtegida rolRequerido={1}><GestionEmpleados /></RutaProtegida>} />
        <Route
          path="/DashboardAdmin"
          element={
            <RutaProtegida rolRequerido={1}>
              <DashboardAdmin />
            </RutaProtegida>
          }
        />
        <Route
          path="/DashboardAsesor"
          element={
            <RutaProtegida rolRequerido={2}>
              <DashboardAsesor />
            </RutaProtegida>
          }
        />

        {/* Perfil de usuario (Cualquier logueado) */}
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          }
        />

        {/* Gestión y Operaciones */}
        <Route path="/clientes" element={<RutaProtegida rolRequerido={2}><Clientes /></RutaProtegida>} />
        <Route path="/Pedidos" element={<RutaProtegida rolRequerido={2}><Pedidos /></RutaProtegida>} />
        <Route path="/registro-cliente" element={<RutaProtegida><RegistroCliente /></RutaProtegida>} />
        <Route path="/Catalogo" element={<RutaProtegida><Catalogo /></RutaProtegida>} />
        <Route path="/categorias" element={<RutaProtegida rolRequerido={1}><GestionCategorias /></RutaProtegida>} />

        {/* Seguimiento */}
        <Route path="/seguimiento" element={<RutaProtegida><Seguimiento /></RutaProtegida>} />
        <Route path="/seguimiento-admin" element={<RutaProtegida rolRequerido={1}><SeguimientoAdmin /></RutaProtegida>} />

        {/* Cotizaciones - accesible por Admins y Asesores */}
        <Route path="/cotizaciones" element={<RutaProtegida><HistorialCotizaciones /></RutaProtegida>} />

        {/* Reportes Unificados */}
        <Route path="/ReporteBasico" element={<RutaProtegida rolRequerido={1}><ReporteBasico /></RutaProtegida>} />
        
        {/* Redirecciones de rutas antiguas a la nueva vista unificada */}
        <Route path="/Historial" element={<Navigate to="/ReporteBasico?tab=historial" replace />} />
        <Route path="/MasVendido" element={<Navigate to="/ReporteBasico?tab=frecuente" replace />} />
        <Route path="/Frecuente" element={<Navigate to="/ReporteBasico?tab=frecuente" replace />} />
      </Routes>
    </Router>
  );
}

