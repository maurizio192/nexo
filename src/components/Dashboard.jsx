import { useEffect, useState } from "react";
import { API } from "../config/api";

function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [producciones, setProducciones] = useState([]);
  const [necesidadesCompra, setNecesidadesCompra] = useState([]);
  const [mermas, setMermas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setCargando(true);

    try {
      const resultados = await Promise.allSettled([
        fetch(`${API}/productos-proveedores`).then((res) => res.json()),
        fetch(`${API}/proveedores`).then((res) => res.json()),
        fetch(`${API}/producciones`).then((res) => res.json()),
        fetch(`${API}/pedidos`).then((res) => res.json()),
        fetch(`${API}/mermas`).then((res) => res.json()),
      ]);

      const [
        productosRes,
        proveedoresRes,
        produccionesRes,
        pedidosRes,
        mermasRes,
      ] = resultados;

      if (productosRes.status === "fulfilled") {
        setProductos(
          Array.isArray(productosRes.value)
            ? productosRes.value
            : []
        );
      }

      if (proveedoresRes.status === "fulfilled") {
        setProveedores(
          Array.isArray(proveedoresRes.value)
            ? proveedoresRes.value
            : []
        );
      }

      if (produccionesRes.status === "fulfilled") {
        setProducciones(
          Array.isArray(produccionesRes.value)
            ? produccionesRes.value
            : []
        );
      }

      if (pedidosRes.status === "fulfilled") {
        setNecesidadesCompra(
          Array.isArray(pedidosRes.value)
            ? pedidosRes.value
            : []
        );
      }

      if (mermasRes.status === "fulfilled") {
        setMermas(
          Array.isArray(mermasRes.value)
            ? mermasRes.value
            : []
        );
      }
    } catch (error) {
      console.error("Error cargando Dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  const hoy = new Date();

  const produccionesHoy = producciones.filter((produccion) => {
    if (!produccion.fecha) return false;

    const fecha = new Date(produccion.fecha);

    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  });

  const stockBajo = productos.filter((producto) => {
    const stock = Number(producto.stock_actual) || 0;
    const minimo = Number(producto.stock_minimo) || 0;

    return stock <= minimo;
  });

  const stockMancante = productos.filter((producto) => {
    const stock = Number(producto.stock_actual) || 0;

    return stock <= 0;
  });

  const mermasActivas = mermas.filter(
    (merma) =>
      String(merma.estado || "").toLowerCase() !== "anulada"
  );

  const produccionesRecientes = [...producciones]
    .sort(
      (a, b) =>
        new Date(b.fecha || 0) -
        new Date(a.fecha || 0)
    )
    .slice(0, 4);

  const tarjeta = {
    background: "#151a21",
    border: "1px solid #252d38",
    borderRadius: "16px",
    padding: "18px",
    boxSizing: "border-box",
    boxShadow: "0 8px 25px rgba(0,0,0,0.22)",
    color: "#ffffff",
  };

  const numero = {
    fontSize: "34px",
    fontWeight: "700",
    marginTop: "12px",
    color: "#ffffff",
    lineHeight: "1",
  };

  const etiqueta = {
    color: "#8f9baa",
    fontSize: "13px",
    marginTop: "8px",
  };

  const miniNumero = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#00d9ff",
    marginTop: "6px",
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        background: "#0b0f14",
        color: "#ffffff",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "22px" }}>
        <div
          style={{
            color: "#00d9ff",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          NEXO · COCINA & GESTIÓN
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "32px",
                fontWeight: "700",
                lineHeight: "1.1",
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#8f9baa",
                fontSize: "14px",
              }}
            >
              Control general de la operación
            </p>
          </div>

          <button
            onClick={cargarDashboard}
            style={{
              minHeight: "44px",
              padding: "0 15px",
              borderRadius: "10px",
              border: "1px solid #303a47",
              background: "#151a21",
              color: "#00d9ff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      {cargando ? (
        <div
          style={{
            ...tarjeta,
            textAlign: "center",
            padding: "40px 20px",
            color: "#8f9baa",
          }}
        >
          Cargando datos de NEXO...
        </div>
      ) : (
        <>
          {/* KPIs PRINCIPALES */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "14px",
              width: "100%",
            }}
          >
            <div style={tarjeta}>
              <div style={{ fontSize: "23px" }}>📦</div>
              <div style={numero}>{productos.length}</div>
              <div style={etiqueta}>Productos</div>
            </div>

            <div style={tarjeta}>
              <div style={{ fontSize: "23px" }}>🚚</div>
              <div style={numero}>{proveedores.length}</div>
              <div style={etiqueta}>Proveedores</div>
            </div>

            <div style={tarjeta}>
              <div style={{ fontSize: "23px" }}>👨‍🍳</div>
              <div style={numero}>
                {produccionesHoy.length}
              </div>
              <div style={etiqueta}>
                Producciones hoy
              </div>
            </div>

            <div
              style={{
                ...tarjeta,
                border:
                  stockBajo.length > 0
                    ? "1px solid #6b4b18"
                    : "1px solid #285f3a",
              }}
            >
              <div style={{ fontSize: "23px" }}>
                {stockBajo.length > 0 ? "⚠️" : "✅"}
              </div>

              <div
                style={{
                  ...numero,
                  color:
                    stockBajo.length > 0
                      ? "#ffb84d"
                      : "#6ee7a0",
                }}
              >
                {stockBajo.length}
              </div>

              <div style={etiqueta}>
                Productos bajo mínimo
              </div>
            </div>
          </div>

          {/* OPERACIÓN */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "14px",
              marginTop: "14px",
            }}
          >
            {/* COMPRAS */}

            <div style={tarjeta}>
              <div
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                }}
              >
                🛒 Necesidades de compra
              </div>

              <div style={etiqueta}>
                Productos que necesitan reposición
              </div>

              <div
                style={{
                  marginTop: "15px",
                  padding: "14px",
                  background: "#1d2630",
                  border: "1px solid #303b48",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#aeb8c5" }}>
                  Para pedir
                </span>

                <strong
                  style={{
                    fontSize: "27px",
                    color:
                      necesidadesCompra.length > 0
                        ? "#ffb84d"
                        : "#6ee7a0",
                  }}
                >
                  {necesidadesCompra.length}
                </strong>
              </div>

              {necesidadesCompra.length > 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    color: "#7f8b99",
                    fontSize: "12px",
                  }}
                >
                  {necesidadesCompra.filter(
                    (p) => Number(p.stock_actual) <= 0
                  ).length}{" "}
                  productos están sin stock.
                </div>
              )}
            </div>

            {/* STOCK */}

            <div style={tarjeta}>
              <div
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                }}
              >
                📊 Estado del stock
              </div>

              <div style={etiqueta}>
                Situación actual del inventario
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "9px",
                  marginTop: "15px",
                }}
              >
                <div
                  style={{
                    background: "#401f23",
                    borderRadius: "9px",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      color: "#ff7777",
                      fontSize: "11px",
                    }}
                  >
                    SIN STOCK
                  </div>

                  <div
                    style={{
                      ...miniNumero,
                      color: "#ff7777",
                    }}
                  >
                    {stockMancante.length}
                  </div>
                </div>

                <div
                  style={{
                    background: "#44351b",
                    borderRadius: "9px",
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      color: "#ffcb69",
                      fontSize: "11px",
                    }}
                  >
                    BAJO MÍNIMO
                  </div>

                  <div
                    style={{
                      ...miniNumero,
                      color: "#ffcb69",
                    }}
                  >
                    {stockBajo.length}
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCCIÓN */}

            <div style={tarjeta}>
              <div
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                }}
              >
                👨‍🍳 Producción
              </div>

              <div style={etiqueta}>
                Actividad registrada
              </div>

              <div
                style={{
                  marginTop: "15px",
                  padding: "14px",
                  background: "#1d2630",
                  border: "1px solid #303b48",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    color: "#718091",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  Hoy
                </div>

                <div style={miniNumero}>
                  {produccionesHoy.length}
                </div>
              </div>
            </div>

            {/* MERMAS */}

            <div style={tarjeta}>
              <div
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                }}
              >
                📉 Mermas
              </div>

              <div style={etiqueta}>
                Control de desperdicio
              </div>

              <div
                style={{
                  marginTop: "15px",
                  padding: "14px",
                  background: "#1d2630",
                  border: "1px solid #303b48",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#718091",
                      fontSize: "11px",
                      textTransform: "uppercase",
                    }}
                  >
                    Activas
                  </div>

                  <div
                    style={{
                      ...miniNumero,
                      color:
                        mermasActivas.length > 0
                          ? "#ffb84d"
                          : "#6ee7a0",
                    }}
                  >
                    {mermasActivas.length}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    color: "#718091",
                    fontSize: "11px",
                  }}
                >
                  Total registros
                  <div
                    style={{
                      color: "#dce3eb",
                      fontSize: "18px",
                      fontWeight: "700",
                      marginTop: "3px",
                    }}
                  >
                    {mermas.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVIDAD RECIENTE */}

          <div
            style={{
              ...tarjeta,
              marginTop: "14px",
            }}
          >
            <div
              style={{
                fontSize: "19px",
                fontWeight: "700",
              }}
            >
              🕘 Actividad reciente
            </div>

            <div style={etiqueta}>
              Últimas producciones registradas
            </div>

            {produccionesRecientes.length === 0 ? (
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  background: "#10151c",
                  borderRadius: "9px",
                  color: "#718091",
                  fontSize: "13px",
                }}
              >
                No hay producciones registradas.
              </div>
            ) : (
              <div
                style={{
                  marginTop: "12px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                {produccionesRecientes.map(
                  (produccion) => (
                    <div
                      key={produccion.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "12px",
                        padding: "11px 12px",
                        background: "#10151c",
                        border:
                          "1px solid #252d38",
                        borderRadius: "9px",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {produccion.elaboracion ||
                            "Producción"}
                        </div>

                        <div
                          style={{
                            color: "#718091",
                            fontSize: "11px",
                            marginTop: "3px",
                          }}
                        >
                          {produccion.responsable ||
                            "Sin responsable"}{" "}
                          ·{" "}
                          {formatearFecha(
                            produccion.fecha
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          flexShrink: 0,
                          color: "#00d9ff",
                          fontSize: "14px",
                          fontWeight: "700",
                        }}
                      >
                        ×
                        {produccion.cantidad_producida ??
                          0}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* SANCHO */}

          <div
            style={{
              ...tarjeta,
              marginTop: "14px",
              border:
                "1px solid #244654",
              background:
                "linear-gradient(135deg, #151a21 0%, #101a20 100%)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "19px",
                    fontWeight: "700",
                  }}
                >
                  🤖 SANCHO
                </div>

                <div style={etiqueta}>
                  Asistente de gestión
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  color: "#6ee7a0",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "#6ee7a0",
                    display: "inline-block",
                  }}
                />
                SISTEMA PREPARADO
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;