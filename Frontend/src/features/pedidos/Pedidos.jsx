import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import "../../compartido/styles/seguimiento-compartido.css";
import "./pedidos.css";

// Componentes modulares
import FiltrosCategorias from "./FiltrosCategorias";
import GridProductos from "./GridProductos";
import PanelCarrito from "./PanelCarrito";
import SelectorCliente from "./SelectorCliente";
import logoPronavid from "../../images/Logopronavid.png";

export default function Pedidos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActual, setCategoriaActual] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [descuento, setDescuento] = useState(0);
  const [vigencia, setVigencia] = useState("");

  // Validación de acceso por rol
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("usuario"));
      const rol = user ? Number(user.id_rol) : null;
      if (!user || (rol !== 1 && rol !== 2 && rol !== 3)) {
        navigate("/login", { replace: true });
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const { api } = await import("../../config/api");

      const dataProductos = await api.get("/productos");
      const prods = dataProductos.productos || [];
      // CP-08: Solo productos activos
      setProductos(prods.filter(p => p.estado_producto !== 'Inactivo' && p.estado !== 'Inactivo'));

      const cats = [...new Set(prods.map(p => p.nombre_categoria))];
      setCategorias(cats);

      const dataClientes = await api.get("/clientes");
      const clis = dataClientes.clientes || [];
      // CP-07: Solo clientes activos
      setClientes(clis.filter(c => c.estado_cliente !== 'Inactivo' && c.estado !== 'Inactivo'));

    } catch (err) {
      console.error("Error cargando datos:", err);
      setMensaje({ texto: "Error al cargar datos", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  // Carga inicial de catálogo y clientes
  useEffect(() => {
    cargarDatos();
  }, []);

  const productosFiltrados = productos.filter(p => {
    const matchCategoria = !categoriaActual || p.nombre_categoria === categoriaActual;
    const matchBusqueda = !busqueda ||
      p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id_producto === producto.id_producto);
      if (existe) {
        return prev.map(item =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    if (!mostrarCarrito) setMostrarCarrito(true);
  };

  const modificarCantidad = (id_producto, delta) => {
    setCarrito(prev =>
      prev.map(item => {
        if (item.id_producto === id_producto) {
          const nuevaCantidad = Math.max(1, item.cantidad + delta);
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      })
    );
  };

  const eliminarDelCarrito = (id_producto) => {
    setCarrito(prev => prev.filter(item => item.id_producto !== id_producto));
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(precio);
  };

    const exportarCotizacion = async () => {
    if (!clienteSeleccionado) {
      setMensaje({ texto: "Selecciona un cliente primero", tipo: "error" });
      return;
    }
    if (carrito.length === 0) {
      setMensaje({ texto: "El sistema informa que debe agregar al menos un producto", tipo: "error" });
      return;
    }
    if (descuento > 20) {
      setMensaje({ texto: "El descuento excede el límite permitido", tipo: "error" });
      return;
    }
    if (!vigencia) {
      setMensaje({ texto: "La vigencia es inválida (fecha requerida)", tipo: "error" });
      return;
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaMinima = new Date(hoy);
    fechaMinima.setDate(hoy.getDate() + 4);

    const fechaVigencia = new Date(vigencia + "T00:00:00");
    if (fechaVigencia < fechaMinima) {
      setMensaje({ texto: "La cotización no se procesó porque la vigencia debe tener 4 días mínimo desde la fecha actual", tipo: "error" });
      return;
    }

    try {
      const { api } = await import("../../config/api");
      
      const cotizacionData = {
        id_cliente: parseInt(clienteSeleccionado.id_cliente || clienteSeleccionado), // Maneja si es objeto o ID
        detalles: carrito.map(item => ({
          id_producto: item.id_producto,
          cantidad: parseInt(item.cantidad) || 1
        }))
      };

      // Guardar en la base de datos (Auditoría / Registro)
      await api.post("/cotizaciones", cotizacionData);
      
    } catch (error) {
      console.error("Error al guardar cotización:", error);
      setMensaje({ texto: "Error guardando cotización en base de datos: " + (error.message || ""), tipo: "error" });
      return; // Abortamos la generación del PDF si falla la BD
    }

    const cliente = clientes.find(c => c.id_cliente == (clienteSeleccionado.id_cliente || clienteSeleccionado));
    const fecha = new Date().toLocaleDateString("es-CO", {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // CP-06: Cálculos
    const totalSub = calcularTotal();
    const valorDescuento = totalSub * (Number(descuento) / 100);
    const totalMenosDescuento = totalSub - valorDescuento;
    const iva = totalMenosDescuento * 0.19;
    const totalConIva = totalMenosDescuento + iva;

    const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Cotización - PRONAVID</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 3px solid #C0392B; padding-bottom: 20px; }
                    .logo-section h1 { color: #C0392B; font-size: 28px; margin-bottom: 5px; }
                    .logo-section p { color: #666; font-size: 14px; }
                    .cotizacion-info { text-align: right; }
                    .cotizacion-info h2 { font-size: 24px; color: #333; margin-bottom: 10px; }
                    .cotizacion-info p { font-size: 14px; color: #666; }
                    .cliente-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                    .cliente-section h3 { color: #C0392B; margin-bottom: 15px; font-size: 16px; }
                    .cliente-section p { margin: 5px 0; font-size: 14px; }
                    .cliente-section strong { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background: #C0392B; color: white; padding: 12px; text-align: left; font-size: 14px; }
                    td { padding: 12px; border-bottom: 1px solid #ddd; font-size: 14px; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .totales { text-align: right; margin-top: 20px; }
                    .totales p { margin: 8px 0; font-size: 14px; }
                    .totales .total-final { font-size: 20px; font-weight: bold; color: #C0392B; border-top: 2px solid #C0392B; padding-top: 10px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-section">
                        <h1>🍞 PRONAVID</h1>
                        <p>Productos Naturales y Vida Saludable</p>
                    </div>
                    <div class="cotizacion-info">
                        <h2>COTIZACIÓN</h2>
                        <p><strong>Fecha:</strong> ${fecha}</p>
                    </div>
                </div>

                <div class="cliente-section">
                    <h3>DATOS DEL CLIENTE</h3>
                    <p><strong>Cliente:</strong> ${cliente?.nombre_cliente || 'N/A'}</p>
                    <p><strong>Identificación:</strong> ${cliente?.identificacion || 'N/A'}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${carrito.map(item => `
                            <tr>
                                <td>${item.nombre_producto}</td>
                                <td style="text-align: center">${item.cantidad}</td>
                                <td style="text-align: right">${formatearPrecio(item.precio)}</td>
                                <td style="text-align: right">${formatearPrecio(item.precio * item.cantidad)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totales">
                    <p><strong>Subtotal:</strong> ${formatearPrecio(totalSub)}</p>
                    <p><strong>Descuento (${descuento}%):</strong> -${formatearPrecio(valorDescuento)}</p>
                    <p><strong>IVA (19%):</strong> ${formatearPrecio(iva)}</p>
                    <p class="total-final"><strong>TOTAL:</strong> ${formatearPrecio(totalConIva)}</p>
                </div>
            </body>
            </html>
        `;

    const ventana = window.open('', '_blank');
    ventana.document.write(htmlContent);
    ventana.document.close();
    setTimeout(() => { ventana.print(); }, 500);

    setMensaje({ texto: "Cotización generada correctamente", tipo: "success" });
  };

  const enviarPedido = async () => {
    if (!clienteSeleccionado || carrito.length === 0) return;

    // Validación de stock
    const itemSinStock = carrito.find(item => item.cantidad > item.stock);
    if (itemSinStock) {
      setMensaje({ 
        texto: `El pedido no se procesó: La cantidad solicitada de "${itemSinStock.nombre_producto}" (${itemSinStock.cantidad}) supera el stock disponible (${itemSinStock.stock}).`, 
        tipo: "error" 
      });
      return;
    }
    
    if (!vigencia) {
      setMensaje({ texto: "La fecha (vigencia) es requerida para el pedido", tipo: "error" });
      return;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaMinima = new Date(hoy);
    fechaMinima.setDate(hoy.getDate() + 4);

    const fechaVigencia = new Date(vigencia + "T00:00:00");
    if (fechaVigencia < fechaMinima) {
      setMensaje({ texto: "El pedido no se procesó porque debe tener 4 días mínimo desde la fecha actual", tipo: "error" });
      return;
    }

    setEnviando(true);
    try {
      const user = JSON.parse(localStorage.getItem("usuario"));
      const { api } = await import("../../config/api");
      const pedidoData = {
        id_cliente: parseInt(clienteSeleccionado.id_cliente),
        id_usuario: user?.id_usuario || 1,
        productos: carrito.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: parseFloat(item.precio)
        }))
      };
      const data = await api.post("/pedidos", pedidoData);
      setMensaje({ texto: `¡Pedido #${data.id_pedido} creado exitosamente!`, tipo: "success" });
      setCarrito([]);
      setClienteSeleccionado(null);
      setMostrarCarrito(false);
      // Actualizar existencias tras pedido
      await cargarDatos();
    } catch (error) {
      setMensaje({ texto: error.message || "Error al enviar pedido", tipo: "error" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pedidos-pagina">
      {/* Botón Carrito Flotante */}
      <AnimatePresence>
        {!mostrarCarrito && (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMostrarCarrito(true)}
                className="boton-carrito-flotante"
            >
                <ShoppingCart size={28} />
                {carrito.length > 0 && (
                    <span className="boton-carrito-flotante__badge">
                        {carrito.length}
                    </span>
                )}
            </motion.button>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div className={`pedidos-contenido ${mostrarCarrito ? "pedidos-contenido--con-carrito" : ""}`}>
        
        {/* PREMIUM HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--color-primary-glass)', padding: '0.8rem', borderRadius: '14px', color: 'var(--color-primary)' }}>
                    <ShoppingCart size={28} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
                        Punto de Venta
                    </h2>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem', fontWeight: 500 }}>
                        Gestiona y procesa nuevos pedidos
                    </p>
                </div>
            </div>
        </div>

        <div>
            <div className="pedidos-seccion-cliente" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <SelectorCliente 
                    clientes={clientes}
                    clienteSeleccionado={clienteSeleccionado}
                    setClienteSeleccionado={setClienteSeleccionado}
                />
            </div>

            <FiltrosCategorias
                categorias={categorias}
                categoriaActual={categoriaActual}
                setCategoriaActual={setCategoriaActual}
            />

            <AnimatePresence>
                {mensaje.texto && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className={`seg-mensaje ${mensaje.tipo}`}
                    >
                        {mensaje.texto}
                    </motion.div>
                )}
            </AnimatePresence>

            <GridProductos
                productos={productosFiltrados}
                agregarAlCarrito={agregarAlCarrito}
                formatearPrecio={formatearPrecio}
            />
        </div>
      </div>

      <PanelCarrito
        carrito={carrito}
        setCarrito={setCarrito}
        clienteSeleccionado={clienteSeleccionado}
        formatearPrecio={formatearPrecio}
        onConfirmar={enviarPedido}
        onCotizar={exportarCotizacion}
        cargandoPedido={enviando}
        isOpen={mostrarCarrito}
        onClose={() => setMostrarCarrito(false)}
        descuento={descuento}
        setDescuento={setDescuento}
        vigencia={vigencia}
        setVigencia={setVigencia}
      />
    </div>
  );
}
