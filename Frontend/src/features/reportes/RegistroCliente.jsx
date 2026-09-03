import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Trophy, ClipboardList } from "lucide-react";
import { API_BASE } from "../../config/api";
import "../../compartido/styles/seguimiento-compartido.css";
import "./reportes.css";
import logoPronavid from "../../images/Logopronavid.png";

export default function RegistroCliente() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Inicializar carga de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        const { api } = await import("../../config/api");

        const dataClientes = await api.get("/reportes/cliente-frecuente");
        setClientes(dataClientes.clientes || []);

        const dataProductos = await api.get("/productos");
        setProductos(dataProductos.productos || []);

      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar los datos");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  const volverDashboard = () => {
    try {
      const user = JSON.parse(localStorage.getItem("usuario"));
      if (user?.id_rol === 1 || user?.id_rol === 3) {
        navigate("/DashboardAdmin");
      } else {
        navigate("/DashboardAsesor");
      }
    } catch {
      navigate(-1);
    }
  };

  return (
    <div className="seguimiento-page">
      {/* HEADER */}
      <header className="seg-header">
        <img src={logoPronavid} alt="Pronavid" className="seg-logo" />
      </header>

      {/* BOTÓN VOLVER */}
      <button onClick={volverDashboard} className="btn-volver" title="Volver">
        <ArrowLeft size={20} />
      </button>

      {/* CONTENIDO */}
      <div className="seg-container">
        <div className="seg-card">
          <div className="seg-card-header">
            <h2><BarChart3 size={24} className="inline-block mr-2" /> Registro de Clientes</h2>
            <div className="registro-botones-nav">
              <button onClick={() => navigate("/ReporteBasico?tab=frecuente")} className="btn-secondary">
                <Trophy size={16} className="inline-block mr-1" /> Top Desempeño
              </button>
              <button onClick={() => navigate("/ReporteBasico?tab=historial")} className="btn-secondary">
                <ClipboardList size={16} className="inline-block mr-1" /> Historial Completo
              </button>
            </div>
          </div>

          {/* Filtro por mes */}
          <div className="seg-search-row">
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="seg-input registro-filtro-max"
            >
              <option value="">Todos los meses</option>
              {meses.map((mes, i) => (
                <option key={i} value={mes}>{mes}</option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <div className="seg-table-container">
            {cargando ? (
              <div className="seg-loading">
                <div className="loader"></div>
                <p>Cargando datos...</p>
              </div>
            ) : error ? (
              <div className="seg-mensaje error">{error}</div>
            ) : clientes.length === 0 ? (
              <div className="seg-empty">
                <p>No hay registros de clientes</p>
              </div>
            ) : (
              <table className="seg-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th className="celda-centrada">Total Compras</th>
                    <th>Producto Favorito</th>
                    <th className="celda-centrada">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente, index) => (
                    <tr key={index}>
                      <td className="celda-negrita">{cliente.nombre_cliente}</td>
                      <td className="celda-centrada">
                        <span className="compras-badge">
                          {cliente.cantidad}
                        </span>
                      </td>
                      <td>{cliente.producto_mas_comprado || "-"}</td>
                      <td className="celda-centrada">
                        {cliente.cantidad_producto_favorito || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Resumen */}
          {!cargando && clientes.length > 0 && (
            <div className="registro-resumen">
              <span className="registro-resumen__texto">
                Total clientes: <strong>{clientes.length}</strong>
              </span>
              <span className="registro-resumen__total">
                Total compras: {clientes.reduce((sum, c) => sum + (c.cantidad || 0), 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
