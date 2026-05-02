import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getAgenciaBySlug,
  getPedidosByAgencia,
  updateEstadoPedido,
  simularNuevoPedido,
} from "../services/api";
import AdminLogin from "./AdminLogin";

export default function AdminPanel() {
  const { agenciaSlug } = useParams();
  const [agencia, setAgencia] = useState(null);

  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // NUEVO ESTADO: Controla qué pedidos estamos viendo ('activos' o 'todos')
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
    getAgenciaBySlug(agenciaSlug).then(setAgencia).catch(console.error);

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

  // NUEVA LÓGICA: Filtramos la lista antes de dibujarla en pantalla
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === 'todos') return true;
    // Si el filtro es 'activos', solo pasamos los que NO están Entregados o Cancelados
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
        
        {/* NUEVA BARRA DE HERRAMIENTAS: Filtros a la izquierda, Simular a la derecha */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          
          {/* Pestañas de Filtro */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => setFiltro('activos')}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: filtro === 'activos' ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                background: filtro === 'activos' ? "var(--primary-light)" : "app)",
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
                background: filtro === 'todos' ? "var(--primary-light)" : "app",
                color: filtro === 'todos' ? "var(--primary)" : "var(--text-muted)",
                fontWeight: filtro === 'todos' ? "600" : "500",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.15s"
              }}
            >
              📚 Historial
            </button>
          </div>

          <button
            onClick={handleSimularPedido}
            disabled={isSimulating}
           style={{
              background: "var(--primary)", /* Usamos el naranja de tu marca */
              color: "#ffffff", /* Texto blanco forzado */
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
        </div>

        {loadingPedidos ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
            Obteniendo pedidos recientes... 🔄
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", background: "var(--bg-app)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)" }}>
            {filtro === 'activos' ? 'No hay pedidos activos en este momento. ¡Todo al día! 🎉' : 'No hay pedidos en el historial.'}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {/* OJO AQUÍ: Ahora mapeamos "pedidosFiltrados" en lugar de la lista cruda */}
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
                      <span>{pedido.direccion_entrega}</span>
                    </div>
                    
                    {/* Caja de detalles mejorada y alineada */}
                    <div style={{ marginTop: "12px", padding: "14px", background: "var(--bg-element)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", fontSize: "13.5px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {pedido.detalles.split('\n').map((linea, index) => {
                        const lineaLimpia = linea.trim(); // Quitamos los espacios invisibles
                        if (!lineaLimpia) return null; // Ignoramos líneas vacías
                        
                        // Separamos el título del valor para darle estilo
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