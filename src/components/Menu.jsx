import { Link, useLocation } from "react-router-dom";

function Menu() {
  const location = useLocation();

  const enlace = (ruta, icono, texto) => {
    const activo = location.pathname === ruta;

    return (
      <Link
        to={ruta}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 14px",
          marginBottom: "6px",
          borderRadius: "10px",
          color: activo ? "#ffffff" : "#9aa6b2",
          background: activo ? "#1d2630" : "transparent",
          border: activo
            ? "1px solid #303b48"
            : "1px solid transparent",
          textDecoration: "none",
          fontSize: "15px",
          fontWeight: activo ? "600" : "500",
          transition: "all 0.2s ease",
        }}
      >
        <span style={{ fontSize: "19px", width: "22px" }}>
          {icono}
        </span>

        <span>{texto}</span>
      </Link>
    );
  };

  const separador = {
    height: "1px",
    background: "#252d38",
    border: "none",
    margin: "20px 0",
  };

  return (
    <aside
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#0b0f14",
        color: "#ffffff",
        padding: "24px 16px",
        boxSizing: "border-box",
        borderRight: "1px solid #202731",
        position: "sticky",
        top: 0,
      }}
    >
      {/* LOGO */}
      <div
        style={{
          padding: "4px 10px 20px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#00d9ff",
            fontWeight: "700",
            letterSpacing: "2px",
            marginBottom: "5px",
          }}
        >
          COCINA & GESTIÓN
        </div>

        <div
          style={{
            fontSize: "27px",
            fontWeight: "800",
            letterSpacing: "1px",
          }}
        >
          🧠 NEXO
        </div>
      </div>

      <hr style={separador} />

      {/* OPERACIÓN */}
      <div
        style={{
          padding: "0 10px 10px",
          fontSize: "11px",
          fontWeight: "700",
          color: "#647180",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        Operación
      </div>

      {enlace("/", "🏠", "Inicio")}
      {enlace("/productos", "📦", "Productos")}
      {enlace("/proveedores", "🚚", "Proveedores")}
      {enlace("/pedidos", "🛒", "Pedidos")}

      <hr style={separador} />

      {/* COCINA */}
      <div
        style={{
          padding: "0 10px 10px",
          fontSize: "11px",
          fontWeight: "700",
          color: "#647180",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        Cocina
      </div>

      {enlace("/libro-recetas", "📖", "Libro de Recetas")}
      {enlace("/producciones", "👨‍🍳", "Producciones")}
      {enlace("/servicio", "🍽", "Servicio")}

      <hr style={separador} />

      {/* CONTROL */}
      <div
        style={{
          padding: "0 10px 10px",
          fontSize: "11px",
          fontWeight: "700",
          color: "#647180",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        Control
      </div>

      {enlace("/sancho", "🤖", "SANCHO")}
      {enlace("/mermas", "📉", "Mermas")}

      {/* HISTORIAL */}
      <div
        style={{
          marginTop: "20px",
          padding: "14px",
          background: "#121820",
          border: "1px solid #252d38",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#647180",
            marginBottom: "5px",
          }}
        >
          SISTEMA
        </div>

        <div
          style={{
            fontSize: "14px",
            color: "#aeb8c5",
          }}
        >
          ● Sistema operativo
        </div>
      </div>
    </aside>
  );
}

export default Menu;

