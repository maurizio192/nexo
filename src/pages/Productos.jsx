import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API } from "../config/api";

import {
  Paper,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";

import ProductoForm from "../components/ProductoForm";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const location = useLocation();

  const [stockActual, setStockActual] = useState(0);
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [stockGarantizado, setStockGarantizado] = useState(0);
  const [formatoCompra, setFormatoCompra] = useState("");
  const [cantidadFormato, setCantidadFormato] = useState("");

  const formularioRef = useRef(null);

  const [editandoId, setEditandoId] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    if (modoEdicion) {
      formularioRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [modoEdicion]);

  useEffect(() => {
    if (location.state?.producto) {
      editarProducto(location.state.producto);
    }
  }, [location]);

  const productosFiltrados = productos.filter(
    (p) =>
      Number(p.categoria_id) === Number(categoriaSeleccionada)
  );

  const estadoStock = (producto) => {
    if (Number(producto.stock_actual) <= 0) {
      return "🔴 MANCANTE";
    }

    if (
      Number(producto.stock_actual) <
      Number(producto.stock_minimo)
    ) {
      return "🟡 BAJO";
    }

    return "🟢 OK";
  };

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API}/productos-proveedores`);
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch(`${API}/categorias-productos`);
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorias:", error);
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setUnidad("");
    setCategoria("");
    setProveedor("");
    setStockMinimo("");
    setUbicacion("");
    setEditandoId(null);
    setModoEdicion(false);
    setFormatoCompra("");
    setCantidadFormato("");
    setStockActual(0);
    setStockGarantizado(0);
  };

  const guardarProducto = async () => {
    if (!nombre || !unidad || !categoria || !proveedor) {
      alert("Completa los campos obligatorios");
      return;
    }

    const datos = {
      nombre,
      unidad,
      categoria_id: Number(categoria),
      proveedor_id: Number(proveedor),
      ubicacion_id: Number(ubicacion),
      stockGarantizado: Number(stockGarantizado) || 0,
      stock_actual: Number(stockActual) || 0,
      stockMinimo: Number(stockMinimo) || 0,
      formato_compra: formatoCompra || null,
      cantidad_formato:
        cantidadFormato !== undefined &&
        cantidadFormato !== null &&
        cantidadFormato !== ""
          ? Number(cantidadFormato)
          : null,
    };

    const method = modoEdicion ? "PUT" : "POST";

    const url = modoEdicion
      ? `${API}/productos/${editandoId}`
      : `${API}/productos`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert(data.error || "Error guardando producto");
        return;
      }

      await cargarProductos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error completo:", error);
      alert(error.message);
    }
  };

  const editarProducto = (producto) => {
    setEditandoId(producto.id);
    setModoEdicion(true);

    setNombre(producto.nombre || "");
    setUnidad(producto.unidad || "");
    setCategoria(String(producto.categoria_id || ""));
    setProveedor(String(producto.proveedor_id || ""));
    setStockMinimo(String(producto.stock_minimo || ""));
    setStockActual(String(producto.stock_actual || 0));
    setStockGarantizado(String(producto.stock_garantizado || 0));
    setFormatoCompra(producto.formato_compra || "");

    setCantidadFormato(
      producto.cantidad_formato !== null &&
        producto.cantidad_formato !== undefined
        ? String(producto.cantidad_formato)
        : ""
    );

    setUbicacion(String(producto.ubicacion_id || ""));
  };

  const iconoCategoria = {
    Verdura: "🥬",
    Carne: "🥩",
    Pescado: "🐟",
    Lácteos: "🧀",
    Despensa: "🧂",
    Congelados: "🧊",
    Limpieza: "🧼",
    Delivery: "🚚",
    Huevos: "🥚",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0f14",
        color: "#fff",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .productos-page .MuiTypography-root {
          color: inherit;
        }

        .productos-page .MuiPaper-root {
          background: #151a21;
          color: #fff;
        }

        .productos-page .MuiInputBase-root {
          color: #fff;
          background: #10151c;
        }

        .productos-page .MuiOutlinedInput-notchedOutline {
          border-color: #303a47;
        }

        .productos-page .MuiInputLabel-root {
          color: #8f9baa;
        }

        .productos-page .MuiInputLabel-root.Mui-focused {
          color: #00d9ff;
        }

        .productos-page .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #465362;
        }

        .productos-page .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #00d9ff;
        }
      `}</style>

      <div className="productos-page">
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              color: "#00d9ff",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            NEXO · INVENTARIO
          </div>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "28px", md: "32px" },
            }}
          >
            📦 Productos
          </Typography>

          <Typography
            sx={{
              color: "#8f9baa !important",
              fontSize: 14,
              mt: 0.5,
            }}
          >
            Stock, proveedores y organización del almacén
          </Typography>
        </div>

        <div
          ref={formularioRef}
          style={{
            marginBottom: 22,
            scrollMarginTop: 20,
          }}
        >
          <ProductoForm
            ref={formularioRef}
            nombre={nombre}
            setNombre={setNombre}
            unidad={unidad}
            setUnidad={setUnidad}
            categoria={categoria}
            setCategoria={setCategoria}
            proveedor={proveedor}
            setProveedor={setProveedor}
            stockMinimo={stockMinimo}
            setStockMinimo={setStockMinimo}
            stockGarantizado={stockGarantizado}
            setStockGarantizado={setStockGarantizado}
            stockActual={stockActual}
            setStockActual={setStockActual}
            formatoCompra={formatoCompra}
            setFormatoCompra={setFormatoCompra}
            cantidadFormato={cantidadFormato}
            setCantidadFormato={setCantidadFormato}
            ubicacion={ubicacion}
            setUbicacion={setUbicacion}
            guardarProducto={guardarProducto}
            modoEdicion={modoEdicion}
          />
        </div>

        <Paper
          elevation={0}
          sx={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "14px",
            p: 2,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              mb: 1.5,
            }}
          >
            Categorías
          </Typography>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 10,
            }}
          >
            {categorias.map((cat) => {
              const seleccionada =
                Number(categoriaSeleccionada) === Number(cat.id);

              return (
                <Paper
                  key={cat.id}
                  elevation={0}
                  onClick={() =>
                    setCategoriaSeleccionada(cat.id)
                  }
                  sx={{
                    p: 1.5,
                    minHeight: 76,
                    background: seleccionada
                      ? "#172c34"
                      : "#10151c",
                    border: seleccionada
                      ? "1px solid #00d9ff"
                      : "1px solid #252d38",
                    borderRadius: "11px",
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      lineHeight: 1,
                      marginBottom: 7,
                    }}
                  >
                    {iconoCategoria[cat.nombre] || "📦"}
                  </div>

                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: seleccionada ? 700 : 500,
                      color: seleccionada
                        ? "#00d9ff !important"
                        : "#dce3eb !important",
                    }}
                  >
                    {cat.nombre}
                  </Typography>
                </Paper>
              );
            })}
          </div>
        </Paper>

        {categoriaSeleccionada && (
          <Paper
            elevation={0}
            sx={{
              background: "#151a21",
              border: "1px solid #252d38",
              borderRadius: "14px",
              p: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  Productos
                </Typography>

                <Typography
                  sx={{
                    color: "#8f9baa !important",
                    fontSize: 12,
                    mt: 0.3,
                  }}
                >
                  {productosFiltrados.length} productos
                </Typography>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {[...productosFiltrados]
                .sort((a, b) => {
                  const orden = {
                    "🔴 MANCANTE": 1,
                    "🟡 BAJO": 2,
                    "🟢 OK": 3,
                  };

                  return (
                    orden[estadoStock(a)] -
                    orden[estadoStock(b)]
                  );
                })
                .map((producto) => {
                  const estado = estadoStock(producto);

                  const borde =
                    estado.startsWith("🔴")
                      ? "#8d3030"
                      : estado.startsWith("🟡")
                      ? "#85621d"
                      : "#285f3a";

                  return (
                    <Paper
                      key={producto.id}
                      elevation={0}
                      sx={{
                        background: "#10151c",
                        border: "1px solid #252d38",
                        borderLeft: `5px solid ${borde}`,
                        borderRadius: "11px",
                        p: 1.5,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#fff",
                              lineHeight: 1.2,
                            }}
                          >
                            {producto.nombre}
                          </Typography>

                          <Typography
                            sx={{
                              color: "#7f8b99 !important",
                              fontSize: 11,
                              mt: 0.4,
                            }}
                          >
                            {producto.unidad || "-"} ·{" "}
                            {producto.ubicacion || "Sin ubicación"}
                          </Typography>
                        </div>

                        <Chip
                          label={estado}
                          size="small"
                          sx={{
                            flexShrink: 0,
                            fontWeight: 700,
                            fontSize: 10,
                            height: 26,
                            background:
                              estado.startsWith("🔴")
                                ? "#401f23"
                                : estado.startsWith("🟡")
                                ? "#44351b"
                                : "#1c3828",
                            color:
                              estado.startsWith("🔴")
                                ? "#ff7777"
                                : estado.startsWith("🟡")
                                ? "#ffcb69"
                                : "#6ee7a0",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(3, 1fr)",
                          gap: 7,
                          marginTop: 12,
                        }}
                      >
                        <div
                          style={{
                            background: "#151c24",
                            borderRadius: 8,
                            padding: "8px 9px",
                          }}
                        >
                          <div
                            style={{
                              color: "#718091",
                              fontSize: 10,
                            }}
                          >
                            STOCK
                          </div>

                          <div
                            style={{
                              color: "#fff",
                              fontSize: 17,
                              fontWeight: 700,
                              marginTop: 2,
                            }}
                          >
                            {producto.stock_actual}
                          </div>
                        </div>

                        <div
                          style={{
                            background: "#151c24",
                            borderRadius: 8,
                            padding: "8px 9px",
                          }}
                        >
                          <div
                            style={{
                              color: "#718091",
                              fontSize: 10,
                            }}
                          >
                            MÍNIMO
                          </div>

                          <div
                            style={{
                              color: "#fff",
                              fontSize: 17,
                              fontWeight: 700,
                              marginTop: 2,
                            }}
                          >
                            {producto.stock_minimo}
                          </div>
                        </div>

                        <div
                          style={{
                            background: "#151c24",
                            borderRadius: 8,
                            padding: "8px 9px",
                          }}
                        >
                          <div
                            style={{
                              color: "#718091",
                              fontSize: 10,
                            }}
                          >
                            FORMATO
                          </div>

                          <div
                            style={{
                              color: "#dce3eb",
                              fontSize: 12,
                              fontWeight: 600,
                              marginTop: 4,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {producto.formato_compra ||
                              "—"}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: 5,
                        }}
                      >
                        <IconButton
                          onClick={() =>
                            editarProducto(producto)
                          }
                          sx={{
                            width: 44,
                            height: 44,
                            color: "#00d9ff",
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </div>
                    </Paper>
                  );
                })}
            </div>
          </Paper>
        )}
      </div>
    </div>
  );
}

export default Productos;
