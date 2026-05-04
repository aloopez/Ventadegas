import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAgenciaBySlug,
  getPedidosByAgencia,
  updateEstadoPedido,
  simularNuevoPedido,
  // NUEVAS FUNCIONES IMPORTADAS:
  getProductosByAgenciaId,
  togglePausarTienda,
  updatePrecioProducto
} from "../services/api";
import AdminLogin from "./AdminLogin";

export default function AdminPanel() {
  const { agenciaSlug } = useParams();
  const [agencia, setAgencia] = useState(null);

  const [pedidos, setPedidos] = useState([]);
  // NUEVO ESTADO: Para guardar los productos y sus precios
  const [productos, setProductos] = useState([]);
  
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // AHORA EL FILTRO SOPORTA 'ajustes'
  const [filtro, setFiltro] = useState('activos');

  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("adminAuth") === "true",
  );

  const cargarPedidos = () => {
    getPedidosByAgencia(agenciaSlug).then((data) => {
      setPedidos(data);
      setLoadingPedidos(false);
    });
  };

  useEffect(() => {
    getAgenciaBySlug(agenciaSlug).then((data) => {
      setAgencia(data);
      // NUEVO: Si estamos logueados, cargamos los productos de esta agencia
      if (isAuthenticated) {
        getProductosByAgenciaId(data.id).then(setProductos).catch(console.error);
      }
    }).catch(console.error);

    if (isAuthenticated) {
      setLoadingPedidos(true);
      cargarPedidos();
    }
  }, [agenciaSlug, isAuthenticated]);

  const cambiarEstado = (id, nuevoEstado) => {
    setPedidos(
      pedidos.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
    );
    updateEstadoPedido(id, nuevoEstado).catch(console.error);
  };

  const handleSimularPedido = () => {
    setIsSimulating(true);
    simularNuevoPedido(agenciaSlug).then(() => {
      cargarPedidos();
      setIsSimulating(false);
    });
  };

  // NUEVA FUNCIÓN: Apagar o encender la tienda
  const handleTogglePausar = async () => {
    const nuevoEstado = !agencia.pausado;
    setAgencia({ ...agencia, pausado: nuevoEstado }); // Actualiza la UI rápido
    await togglePausarTienda(agencia.id, nuevoEstado); // Guarda en BD
  };

  // NUEVA FUNCIÓN: Guardar el precio nuevo
  const handleActualizarPrecio = async (productoId, nuevoPrecio) => {
    const precioNumerico = parseFloat(nuevoPrecio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) return alert("Ingresa un precio válido");
    
    setProductos(productos.map(p => p.id === productoId ? { ...p, precio: precioNumerico } : p));
    await updatePrecioProducto(productoId, precioNumerico);
    alert("¡Precio actualizado correctamente!");
  };

  const handleLogin = () => {
    sessionStorage.setItem("adminAuth", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  };

  const getEstadoEstilo = (estado) => {
    switch (estado) {
      case "Pendiente":
        return { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" };
      case "Confirmado":
        return { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" };
      case "En camino":
        return { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" };
      case "Entregado":
        return {
          bg: "var(--success-bg)",
          text: "var(--success)",
          border: "var(--success-border)",
        };
      case "Cancelado":
        return { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" };
      default:
        return {
          bg: "var(--bg-element)",
          text: "var(--text-main)",
          border: "var(--border-color)",
        };
    }
  };

  const isOpcionBloqueada = (estadoActual, opcionFila) => {
    const niveles = {
      "Pendiente": 1,
      "Confirmado": 2,
      "En camino": 3,
      "Entregado": 4
    };

    if ((estadoActual === "Entregado" || estadoActual === "Cancelado") && estadoActual !== opcionFila) {
      return true;
    }

    if (opcionFila !== "Cancelado" && niveles[opcionFila] < niveles[estadoActual]) {
      return true;
    }

    return false;
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === 'todos' || filtro === 'ajustes') return true;
    return pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado';
  });

  if (!agencia)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Cargando panel... ⏳
      </div>
    );

  if (!isAuthenticated)
    return <AdminLogin agencia={agencia} onLogin={handleLogin} />;

  return (
    <div
      className="page"
      style={{
        "--primary": agencia.tema?.primary || "#e85d04",
        maxWidth: "600px",
        margin: "20px auto",
      }}
    >
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", color: "var(--text-main)" }}>
            Panel de Pedidos
          </h2>
          <span className="tagline" style={{ marginLeft: 0 }}>
            {agencia.nombre}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "var(--error)",
              fontSize: "13px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Cerrar sesión
          </button>
          <Link
            to={`/${agenciaSlug}`}
            style={{
              fontSize: "13px",
              color: "var(--primary)",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Ver Tienda ↗
          </Link>
        </div>
      </div>

      <div className="main" style={{ padding: "20px", background: "var(--bg-body)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          
          {/* Pestañas de Filtro (Se agregó la pestaña de Ajustes) */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              onClick={() => setFiltro('activos')}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: filtro === 'activos' ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                background: filtro === 'activos' ? "var(--primary-light)" : "var(--bg-app)",
                color: filtro === 'activos' ? "var(--primary)" : "var(--text-muted)",
                fontWeight: filtro === 'activos' ? "600" : "500",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.15s"
              }}
            >
              🔥 Activos
            </button>
            <button 
              onClick={() => setFiltro('todos')}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: filtro === 'todos' ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                background: filtro === 'todos' ? "var(--primary-light)" : "var(--bg-app)",
                color: filtro === 'todos' ? "var(--primary)" : "var(--text-muted)",
                fontWeight: filtro === 'todos' ? "600" : "500",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.15s"
              }}
            >
              📚 Historial
            </button>
            <button 
              onClick={() => setFiltro('ajustes')}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: filtro === 'ajustes' ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                background: filtro === 'ajustes' ? "var(--primary-light)" : "var(--bg-app)",
                color: filtro === 'ajustes' ? "var(--primary)" : "var(--text-muted)",
                fontWeight: filtro === 'ajustes' ? "600" : "500",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.15s"
              }}
            >
              ⚙️ Ajustes
            </button>
          </div>

          {/* Ocultamos el botón de simular si estamos en ajustes */}
          {filtro !== 'ajustes' && (
            <button
              onClick={handleSimularPedido}
              disabled={isSimulating}
              style={{
                background: "var(--primary)",
                color: "#ffffff",
                border: "none",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                cursor: isSimulating ? "not-allowed" : "pointer",
                opacity: isSimulating ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {isSimulating ? "Generando..." : "🚀 Simular"}
            </button>
          )}
        </div>

        {/* --- NUEVA PANTALLA: AJUSTES --- */}
        {filtro === 'ajustes' ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Módulo: Botón de Pánico */}
            <div style={{ padding: "20px", background: "var(--bg-app)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main)", fontSize: "16px" }}>Estado de la Tienda</h3>
              <p style={{ margin: "0 0 15px 0", color: "var(--text-muted)", fontSize: "14px" }}>Pausa temporalmente los pedidos si tienes una emergencia.</p>
              <button 
                onClick={handleTogglePausar}
                style={{
                  width: "100%", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "15px", fontWeight: "bold", border: "none", cursor: "pointer",
                  background: agencia.pausado ? "#ef4444" : "#10b981", color: "#fff",
                  transition: "background 0.3s"
                }}
              >
                {agencia.pausado ? "🚨 TIENDA PAUSADA - CLIC PARA ABRIR" : "✅ TIENDA ABIERTA - CLIC PARA PAUSAR"}
              </button>
            </div>

            {/* Módulo: Precios */}
            <div style={{ padding: "20px", background: "var(--bg-app)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ margin: "0 0 15px 0", color: "var(--text-main)", fontSize: "16px" }}>Precios de Cilindros</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {productos.map(prod => (
                  <div key={prod.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--bg-element)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>{prod.peso}</strong>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{prod.nombre}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold", color: "var(--text-main)" }}>$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        defaultValue={prod.precio}
                        id={`input-precio-${prod.id}`}
                        style={{ width: "70px", padding: "6px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", textAlign: "center", background: "var(--bg-app)", color: "var(--text-main)" }}
                      />
                      <button 
                        onClick={() => handleActualizarPrecio(prod.id, document.getElementById(`input-precio-${prod.id}`).value)}
                        style={{ padding: "6px 12px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : loadingPedidos ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
            Obteniendo pedidos recientes... 🔄
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", background: "var(--bg-app)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)" }}>
            {filtro === 'activos' ? 'No hay pedidos activos en este momento. ¡Todo al día! 🎉' : 'No hay pedidos en el historial.'}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {pedidosFiltrados.map((pedido) => {
              const estilo = getEstadoEstilo(pedido.estado);
              const isFinalizado = pedido.estado === "Entregado" || pedido.estado === "Cancelado";

              return (
                <div
                  key={pedido.id}
                  style={{
                    border: `1px solid ${estilo.border}`,
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-app)",
                    boxShadow: "var(--shadow-sm)",
                    opacity: isFinalizado ? 0.8 : 1, 
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <strong style={{ color: "var(--text-main)", fontSize: "16px" }}>
                      {pedido.codigo_pedido}
                    </strong>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                      {new Date(pedido.fecha_creacion).toLocaleString("es-ES")}
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", color: "var(--text-main)", marginBottom: "14px", lineHeight: "1.6" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <span>👤</span>
                      <span><strong>{pedido.cliente_nombre}</strong> ({pedido.cliente_telefono})</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "4px" }}>
                      <span>📍</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                        <span>{pedido.direccion_entrega}</span>
                        
                        {pedido.latitud && pedido.longitud && (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${pedido.latitud},${pedido.longitud}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "#e8f0fe",
                              color: "#2563eb",
                              padding: "6px 12px",
                              borderRadius: "var(--radius-sm)",
                              textDecoration: "none",
                              fontSize: "13px",
                              fontWeight: "700",
                              border: "1px solid #bfdbfe",
                              transition: "background 0.2s"
                            }}
                          >
                            🗺️ Abrir ruta en Mapa
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ marginTop: "12px", padding: "14px", background: "var(--bg-element)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", fontSize: "13.5px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {pedido.detalles.split('\n').map((linea, index) => {
                        const lineaLimpia = linea.trim();
                        if (!lineaLimpia) return null;
                        
                        const separador = lineaLimpia.indexOf(':');
                        if (separador !== -1) {
                          const titulo = lineaLimpia.substring(0, separador);
                          const valor = lineaLimpia.substring(separador + 1);
                          return (
                            <div key={index}>
                              <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>{titulo}:</span>
                              <span style={{ color: "var(--text-main)", marginLeft: "6px" }}>{valor}</span>
                            </div>
                          );
                        }
                        
                        return <div key={index} style={{ color: "var(--text-main)" }}>{lineaLimpia}</div>;
                      })}
                    </div>
                    
                    <div style={{ marginTop: "12px", fontSize: "16px", textAlign: "right" }}>
                      <strong>Total: ${Number(pedido.total).toFixed(2)}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "14px", borderTop: "1px dashed var(--border-color)" }}>
                    <label style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>
                      Estado:
                    </label>
                    <select
                      value={pedido.estado}
                      onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                      disabled={isFinalizado}
                      style={{
                        backgroundColor: estilo.bg,
                        color: estilo.text,
                        borderColor: estilo.border,
                        padding: "8px 12px",
                        paddingRight: isFinalizado ? "12px" : "36px",
                        borderRadius: "var(--radius-md)",
                        fontWeight: "600",
                        outline: "none",
                        cursor: isFinalizado ? "not-allowed" : "pointer",
                        appearance: "none",
                        WebkitAppearance: "none",
                        backgroundImage: isFinalizado ? "none" : undefined,
                        flex: 1,
                        fontSize: "14px"
                      }}
                    >
                      <option value="Pendiente" disabled={isOpcionBloqueada(pedido.estado, "Pendiente")}>🟡 Pendiente</option>
                      <option value="Confirmado" disabled={isOpcionBloqueada(pedido.estado, "Confirmado")}>🔵 Confirmado</option>
                      <option value="En camino" disabled={isOpcionBloqueada(pedido.estado, "En camino")}>🚚 En camino</option>
                      <option value="Entregado" disabled={isOpcionBloqueada(pedido.estado, "Entregado")}>✅ Entregado</option>
                      <option value="Cancelado" disabled={isOpcionBloqueada(pedido.estado, "Cancelado")}>❌ Cancelado</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}