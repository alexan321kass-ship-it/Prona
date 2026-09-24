import "./panel.css";

export default function PiePanel() {
    return (
        <footer className="barra-inferior">
            <span className="barra-inferior__copyright">
                © {new Date().getFullYear()} PRONAVID - Sistema de Gestión Comercial
            </span>
        </footer>
    );
}


