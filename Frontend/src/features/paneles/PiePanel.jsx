import { servicioAutenticacion } from "../autenticacion/autenticacion.service";
import "./panel.css";

export default function PiePanel() {
    const handleLogout = async () => {
        await servicioAutenticacion.logout();
    };

    return (
        <footer className="barra-inferior">
            <span className="barra-inferior__copyright">
                © {new Date().getFullYear()} PRONAVID - Sistema de Gestión Comercial
            </span>
            <button onClick={handleLogout} className="cerrar-sesion" title="Cerrar sesión activa">
                Cerrar Sesión
            </button>
        </footer>
    );
}

