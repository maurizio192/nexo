import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";

import ProveedorForm from "../components/ProveedorForm";

import {
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

export default function Proveedores() {
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [productosProveedor, setProductosProveedor] = useState([]);
  const [proveedorAbierto, setProveedorAbierto] = useState(null);
  const [buscarProducto, setBuscarProducto] = useState("");

  const cargarProveedores = async () => {
    try {
      const res = await fetch(`${API}/proveedores`);
      const data = await res.json();
      setProveedores(data);
    } catch (err) {
      console.error("Error cargando proveedores:", err);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const verProductos = async (nombre) => {
    try {
      const res = await fetch(
        `${API}/proveedores/${encodeURIComponent(nombre)}/productos`
      );

      const data = await res.json();

      setProveedorAbierto(nombre);
      setProductosProveedor(data);
      setBuscarProducto("");
    } catch (err) {
      console.error("Error cargando productos del proveedor:", err);
    }
  };

  const eliminarProveedor = async (id) => {
    if (!window.confirm("¿Eliminar proveedor?")) return;

    try {
      const res = await fetch(`${API}/proveedores/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.ok) {
        if (proveedorAbierto) {
          setProveedorAbierto(null);
          setProductosProveedor([]);
        }

        cargarProveedores();
      }
    } catch (err) {
      console.error("Error eliminando proveedor:", err);
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;

    try {
      const res = await fetch(`${API}/productos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.ok) {
        verProductos(proveedorAbierto);
      }
    } catch (err) {
      console.error("Error eliminando producto:", err);
    }
  };

  const productosFiltrados = productosProveedor.filter((prod) =>
    String(prod.nombre || "")
      .toLowerCase()
      .includes(buscarProducto.toLowerCase())
  );

  const botonBase = {
    minHeight: 44,
    borderRadius: "10px",
    fontWeight: 600,
    textTransform: "none",
  };

  const tarjetaProveedor = {
    background: "#151a21",
    border: "1px solid #252d38",
    borderRadius: "14px",
    padding: "16px",
    color: "#fff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
  };

  const textoSecundario = {
    color: "#9da8b6",
    fontSize: "13px",
    marginTop: "3px",
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
        .proveedores-page .MuiTypography-root {
          color: inherit;
        }

        .proveedores-page .MuiPaper-root {
          background: #151a21;
          color: #fff;
        }

        .proveedores-page .MuiInputBase-root {
          color: #fff;
          background: #10151c;
        }

        .proveedores-page .MuiOutlinedInput-notchedOutline {
          border-color: #303a47;
        }

        .proveedores-page .MuiInputLabel-root {
          color: #8f9baa;
        }

        .proveedores-page .MuiInputLabel-root.Mui-focused {
          color: #00d9ff;
        }

        .proveedores-page .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #465362;
        }

        .proveedores-page .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #00d9ff;
        }

        .proveedores-page .MuiTableContainer-root {
          background: #10151c;
          border: 1px solid #252d38;
          border-radius: 12px;
        }

        .proveedores-page .MuiTableCell-root {
          color: #dce3eb;
          border-bottom: 1px solid #252d38;
          padding: 10px 12px;
          font-size: 13px;
        }

        .proveedores-page .MuiTableHead-root .MuiTableCell-root {
          color: #8f9baa;
          font-weight: 700;
          background: #151a21;
        }

        .proveedores-page .MuiTableRow-hover:hover {
          background: #18202a;
        }

        .proveedores-page .MuiButton-root {
          font-size: 13px;
        }
      `}</style>

      <div className="proveedores-page">
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
            NEXO · COMPRAS
          </div>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "28px", md: "32px" },
            }}
          >
            🚚 Proveedores
          </Typography>

          <Typography
            sx={{
              color: "#8f9baa !important",
              fontSize: 14,
              mt: 0.5,
            }}
          >
            Gestión de proveedores y productos asociados
          </Typography>
        </div>

        <div style={{ marginBottom: 20 }}>
          <ProveedorForm actualizar={cargarProveedores} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {proveedores.map((p) => (
            <Paper
              key={p.id}
              elevation={0}
              sx={{
                ...tarjetaProveedor,
                borderColor:
                  proveedorAbierto === p.nombre ? "#00d9ff" : "#252d38",
                transition: "border-color 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.2,
                      mb: 1,
                    }}
                  >
                    {p.nombre}
                  </Typography>

                  <div style={textoSecundario}>
                    👤 {p.contacto || "Sin contacto"}
                  </div>

                  <div style={textoSecundario}>
                    📞 {p.telefono || "Sin teléfono"}
                  </div>

                  <div style={textoSecundario}>
                    📧 {p.email || "Sin email"}
                  </div>
                </div>

                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#1d2630",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 19,
                    flexShrink: 0,
                  }}
                >
                  🚚
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => verProductos(p.nombre)}
                  sx={{
                    ...botonBase,
                    background: "#00a8c7",
                    "&:hover": {
                      background: "#0094b0",
                    },
                  }}
                >
                  📦 Ver productos
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => eliminarProveedor(p.id)}
                  sx={{
                    ...botonBase,
                    borderColor: "#7d3030",
                  }}
                >
                  🗑 Eliminar
                </Button>
              </div>

              {proveedorAbierto === p.nombre && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid #252d38",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#fff",
                      mb: 1.5,
                    }}
                  >
                    Productos
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    label="🔍 Buscar producto"
                    value={buscarProducto}
                    onChange={(e) => setBuscarProducto(e.target.value)}
                    sx={{ mb: 1.5 }}
                  />

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell>Stock</TableCell>
                          <TableCell>Min.</TableCell>
                          <TableCell>Ubicación</TableCell>
                          <TableCell align="right">Acción</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {productosFiltrados.map((prod) => (
                          <TableRow key={prod.id} hover>
                            <TableCell>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#fff",
                                  maxWidth: 260,
                                }}
                              >
                                {prod.nombre}
                              </div>

                              <div
                                style={{
                                  color: "#7f8b99",
                                  fontSize: 11,
                                  marginTop: 2,
                                }}
                              >
                                {prod.unidad || "-"}
                              </div>
                            </TableCell>

                            <TableCell>
                              {prod.stock_actual}
                            </TableCell>

                            <TableCell>
                              {prod.stock_minimo}
                            </TableCell>

                            <TableCell>
                              {prod.ubicacion || "-"}
                            </TableCell>

                            <TableCell align="right">
                              <Button
                                size="small"
                                onClick={() =>
                                  navigate("/productos", {
                                    state: {
                                      producto: prod,
                                    },
                                  })
                                }
                                sx={{
                                  minWidth: 42,
                                  minHeight: 42,
                                  fontSize: 18,
                                }}
                              >
                                ✏️
                              </Button>

                              <Button
                                size="small"
                                color="error"
                                onClick={() => eliminarProducto(prod.id)}
                                sx={{
                                  minWidth: 42,
                                  minHeight: 42,
                                  fontSize: 18,
                                }}
                              >
                                🗑
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {productosFiltrados.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No hay productos que coincidan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Button
                    variant="outlined"
                    onClick={() =>
                      navigate("/productos", {
                        state: {
                          proveedor: p.nombre,
                        },
                      })
                    }
                    sx={{
                      ...botonBase,
                      mt: 1.5,
                      borderColor: "#344250",
                      color: "#00d9ff",
                    }}
                  >
                    ➕ Añadir producto
                  </Button>
                </div>
              )}
            </Paper>
          ))}
        </div>
      </div>
    </div>
  );
}