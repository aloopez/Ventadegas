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

  // Función rápida para determinar el color de fondo del estado
  const getEstadoEstilo = (estado) => {
    switch (estado) {
      case "Pendiente":
        return { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" }; // Amarillo
      case "Confirmado":
        return { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" }; // Azul
      case "En camino":
        return { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" }; // Morado
      case "Entregado":
        return {
          bg: "var(--success-bg)",
          text: "var(--success)",
          border: "var(--success-border)",
        }; // Verde
      case "Cancelado":
        return { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" }; // Rojo
      default:
        return {
          bg: "var(--bg-element)",
          text: "var(--text-main)",
          border: "var(--border-color)",
        };
    }
  };

  // LÓGICA: Determinar qué opciones se bloquean según el estado actual
  const isOpcionBloqueada = (estadoActual, opcionFila) => {
    const niveles = {
      "Pendiente": 1,
      "Confirmado": 2,
      "En camino": 3,
      "Entregado": 4
    };

    // Si ya es un estado final, bloqueamos todo lo demás
    if ((estadoActual === "Entregado" || estadoActual === "Cancelado") && estadoActual !== opcionFila) {
      return true;
    }

    // No permitir retrocesos. Ej: Si está "En camino"(3), no puede ir a "Confirmado"(2)
    if (opcionFila !== "Cancelado" && niveles[opcionFila] < niveles[estadoActual]) {
      return true;
    }

    return false;
  };

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
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
          <button
            onClick={handleSimularPedido}
            disabled={isSimulating}
            style={{
              background: "var(--text-main)",
              color: "var(--bg-body)",
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
            {isSimulating ? "Generando..." : "✨ Simular nuevo pedido"}
          </button>
        </div>

        {loadingPedidos ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
            Obteniendo pedidos recientes... 🔄
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
            No hay pedidos en este momento.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {pedidos.map((pedido) => {
              const estilo = getEstadoEstilo(pedido.estado);
              
              // 1. Declaramos si el pedido ya está en un punto sin retorno
              const isFinalizado = pedido.estado === "Entregado" || pedido.estado === "Cancelado";

              return (
                <div
                  key={pedido.id}
                  style={{
                    border: `1.5px solid ${estilo.border}`,
                    padding: "15px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-card)",
                    boxShadow: "var(--shadow-sm)",
                    opacity: isFinalizado ? 0.8 : 1, // Si está finalizado se opaca un poco la tarjeta
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <strong style={{ color: "var(--text-main)" }}>
                      {pedido.codigo_pedido}
                    </strong>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(pedido.fecha_creacion).toLocaleString("es-ES")}
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", color: "var(--text-main)", marginBottom: "12px", lineHeight: "1.5" }}>
                    <div>
                      👤 <strong>{pedido.cliente_nombre}</strong> ({pedido.cliente_telefono})
                    </div>
                    <div>📍 {pedido.direccion_entrega}</div>
                    <div style={{ whiteSpace: "pre-wrap", marginTop: "8px", color: "var(--text-muted)" }}>
                      📝 {pedido.detalles}
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "16px" }}>
                      💰 <strong>Total: ${Number(pedido.total).toFixed(2)}</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px dashed var(--border-color)" }}>
                    <label style={{ margin: 0, fontSize: "13px", fontWeight: "bold" }}>
                      Estado:
                    </label>
                    <select
                      value={pedido.estado}
                      onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                      disabled={isFinalizado} // 2. Bloquea todo el elemento si ya está finalizado
                      style={{
                        backgroundColor: estilo.bg,
                        color: estilo.text,
                        borderColor: estilo.border,
                        padding: "6px 12px",
                        paddingRight: isFinalizado ? "12px" : "36px", 
                        borderRadius: "var(--radius-md)",
                        fontWeight: "bold",
                        outline: "none",
                        cursor: isFinalizado ? "not-allowed" : "pointer",
                        
                        // CORRECCIÓN: Siempre "none" para matar la flecha del navegador
                        appearance: "none", 
                        WebkitAppearance: "none",
                        
                        // Solo ocultamos TU flecha (la del CSS) si está finalizado
                        backgroundImage: isFinalizado ? "none" : undefined,
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