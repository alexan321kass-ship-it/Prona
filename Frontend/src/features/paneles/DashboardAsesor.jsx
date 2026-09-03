import { Package, Users, TrendingUp, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./panel.css";
import PiePanel from "./PiePanel";
import Tarjeta from "../../compartido/components/Tarjeta";

export default function DashboardAsesor() {
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userRaw = localStorage.getItem("usuario");
        if (!userRaw) {
            navigate("/login");
            return;
        }

        try {
            const user = JSON.parse(userRaw);
            if (user.id_rol !== 2) {
                navigate("/DashboardAdmin");
                return;
            }
            setUsuario(user);
        } catch (e) {
            navigate("/login");
        }
    }, [navigate]);

    if (!usuario) return null;

    return (
        <>
            <section className="titulo-panel mt-6">
                <h2>Panel de Asesor</h2>
                <p>Bienvenido, {usuario.primer_nombre} {usuario.primer_apellido}</p>
            </section>

            <main className="dashboard-panel">
                <Tarjeta
                    to="/Pedidos"
                    icono={Package}
                    titulo="Pedidos"
                    descripcion="Registrar y gestionar pedidos"
                />
                <Tarjeta
                    to="/clientes"
                    icono={Users}
                    titulo="Clientes"
                    descripcion="Gestionar clientes"
                />
                <Tarjeta
                    to="/seguimiento"
                    icono={TrendingUp}
                    titulo="Seguimiento"
                    descripcion="Consultar estado de pedidos"
                />
                <Tarjeta
                    to="/cotizaciones"
                    icono={FileText}
                    titulo="Cotizaciones"
                    descripcion="Ver y gestionar cotizaciones"
                />
            </main>

            <PiePanel />
        </>
    );

}
