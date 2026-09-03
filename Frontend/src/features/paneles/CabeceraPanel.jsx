import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { servicioAutenticacion } from "../autenticacion/autenticacion.service";
import logoPronavid from "../../images/Logopronavid.png";

export default function CabeceraPanel({ rol, perfilLink }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await servicioAutenticacion.logout();
    };

    // Obtener nombre del usuario
    let nombreUsuario = "";
    try {
        const user = JSON.parse(localStorage.getItem("usuario"));
        if (user) {
            nombreUsuario = user.primer_nombre || "";
        }
    } catch (e) { }

    return (
        <header className="barra-superior">
            <div className="logo-area">
                <Link to={rol === "Administrador" ? "/DashboardAdmin" : "/DashboardAsesor"}>
                    <img src={logoPronavid} className="logo" alt="Logo Pronavid" />
                </Link>
            </div>

            <div className="usuario-contenedor">
                <span>{nombreUsuario ? `Hola, ${nombreUsuario}` : rol}</span>
                <Link to={perfilLink || "#"} className="icono-usuario" title="Mi perfil">
                    <User size={20} strokeWidth={2.5} />
                </Link>
            </div>
        </header>
    );
}
