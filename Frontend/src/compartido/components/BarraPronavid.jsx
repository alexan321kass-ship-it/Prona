import "../styles/navbar.css";
import logoPronavid from "../../images/Logopronavid.png";

export default function BarraPronavid() {
    return (
        <nav className="nav" style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
            <img
                src={logoPronavid}
                alt="Pronavid"
                className="nav-logo"
            />
            {/* Las notificaciones web fueron removidas para que sean exclusivas del móvil */}
        </nav>
    );
}
