import { useNavigate } from "react-router-dom";
import { servicioAutenticacion } from "../autenticacion/autenticacion.service";
import "./panel.css";

export default function PiePanel() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await servicioAutenticacion.logout();
    };

    return (
        <footer className="barra-inferior">
            <span className="barra-inferior__copyright">
                © 2024 PRONAVID - Sistema de Gestión
            </span>
            <button onClick={handleLogout} className="cerrar-sesion">
                Cerrar Sesión
            </button>
        </footer>
    );
}
