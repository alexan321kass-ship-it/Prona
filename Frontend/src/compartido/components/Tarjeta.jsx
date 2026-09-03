import { Link } from "react-router-dom";

export default function Tarjeta({ to, icono: Icono, titulo, descripcion }) {
    return (
        <Link to={to} className="tarjeta">
            <span className="icono">
                {typeof Icono === "string" ? Icono : <Icono size={40} strokeWidth={1.5} />}
            </span>
            <h3>{titulo}</h3>
            <p>{descripcion}</p>
        </Link>
    );
}
