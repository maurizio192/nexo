import { Link } from "react-router-dom";

function Menu() {
  return (
    <div
      style={{
        background: "#1f2937",
        color: "white",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <h2>NEXO</h2>

      <hr />

      <p>
        <Link
          to="/"
          style={{ color: "white", textDecoration: "none" }}
        >
          🏠 Inicio
        </Link>
      </p>

      <p>
        <Link
          to="/productos"
          style={{ color: "white", textDecoration: "none" }}
        >
          📦 Productos
        </Link>
      </p>

      <p>🚚 Proveedores</p>
      <p>📊 Stock</p>
      <p>👨‍🍳 Producción</p>
    </div>
  );
}

export default Menu;