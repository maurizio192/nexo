function Dashboard() {
  const tarjeta = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "220px",
  };

  return (
    <div>
      <h1 style={{ color: "blue" }}>DASHBOARD DE PRUEBA</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        <div style={tarjeta}>
          <h2>📦 Productos</h2>
          <h1>0</h1>
        </div>

        <div style={tarjeta}>
          <h2>🚚 Proveedores</h2>
          <h1>0</h1>
        </div>

        <div style={tarjeta}>
          <h2>📋 Producción</h2>
          <h1>0</h1>
        </div>

        <div style={tarjeta}>
          <h2>⚠️ Stock Bajo</h2>
          <h1>0</h1>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;