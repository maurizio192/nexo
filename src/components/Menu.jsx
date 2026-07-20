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
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          🏠 Inicio
        </Link>
      </p>

      <p>
        <Link to="/productos" style={{ color: "white", textDecoration: "none" }}>
          📦 Productos
        </Link>
      </p>

      <p>
        <Link to="/elaboraciones" style={{ color: "white", textDecoration: "none" }}>
          📖 Elaboraciones
        </Link>
      </p>

      <p>
        <Link to="/fichas-tecnicas" style={{ color: "white", textDecoration: "none" }}>
          📑 Fichas Técnicas
        </Link>
      </p>

      <p>
        <Link to="/producciones" style={{ color: "white", textDecoration: "none" }}>
          👨‍🍳 Producciones
        </Link>
      </p>
<p>
  <Link
    to="/servicio"
    style={{ color: "white", textDecoration: "none" }}
  >
    🍽 Servicio
  </Link>
</p>
      <p>
        <Link to="/sancho" style={{ color: "white", textDecoration: "none" }}>
          🧠 Sancho
        </Link>
      </p>

      <hr />

     <p>
  <Link
    to="/proveedores"
    style={{ color: "white", textDecoration: "none" }}
  >
    🚚 Proveedores
  </Link>
</p>
      <p>📊 Stock</p>
     <p>
  <Link
    to="/pedidos"
    style={{ color: "white", textDecoration: "none" }}
  >
    🛒 Pedidos
  </Link>
</p>
      <p>📉 Mermas</p>
      <p>📜 Historial</p>
    </div>
  );
}

export default Menu;
