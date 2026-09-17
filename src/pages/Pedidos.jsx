import { useEffect, useState } from "react";
import { API } from "../config/api";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Box,
} from "@mui/material";

function Pedidos() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch(`${API}/pedidos`)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error(err));
  }, []);

  let proveedorAnterior = "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0f14",
        color: "#ffffff",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          background: "#151a21",
          color: "#ffffff",
          border: "1px solid #252d38",
          borderRadius: "16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.22)",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "#00d9ff",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            NEXO · COMPRAS
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: "#ffffff",
              fontWeight: 700,
              fontSize: { xs: "28px", sm: "32px" },
            }}
          >
            🛒 Pedidos
          </Typography>

          <Typography
            sx={{
              color: "#8f9baa",
              fontSize: "14px",
              mt: 0.5,
            }}
          >
            Productos que necesitan reposición
          </Typography>
        </Box>

        {productos.length === 0 ? (
          <Box
            sx={{
              background: "#10151c",
              border: "1px solid #252d38",
              borderRadius: "12px",
              padding: "20px",
              color: "#8f9baa",
              textAlign: "center",
            }}
          >
            No hay productos pendientes de pedido.
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {productos.map((p) => {
              const mostrarProveedor =
                proveedorAnterior !== p.proveedor;

              proveedorAnterior = p.proveedor;

              return (
                <Box key={`${p.proveedor}-${p.nombre}`}>
                  {mostrarProveedor && (
                    <>
                      {proveedorAnterior !== p.proveedor &&
                        null}

                      <Divider
                        sx={{
                          mt: 2,
                          mb: 2,
                          borderColor: "#303a47",
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: {
                            xs: "flex-start",
                            sm: "center",
                          },
                          justifyContent: "space-between",
                          gap: 2,
                          flexWrap: "wrap",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "18px",
                          }}
                        >
                          📦 {p.proveedor}
                        </Typography>

                        <Button
                          variant="contained"
                          size="large"
                          sx={{
                            minHeight: "44px",
                            background: "#00a8c7",
                            color: "#ffffff",
                            fontWeight: 700,
                            borderRadius: "10px",
                            px: 2,
                            "&:hover": {
                              background: "#0095b1",
                            },
                          }}
                          onClick={async () => {
                            try {
                              const res = await fetch(
                                `${API}/pedidos/generar`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type":
                                      "application/json",
                                  },
                                  body: JSON.stringify({
                                    proveedor: p.proveedor,
                                  }),
                                }
                              );

                              const data = await res.json();

                              if (data.ok) {
                                alert(
                                  `✅ Pedido nº ${data.pedido} generado`
                                );
                              } else {
                                alert(
                                  "Error creando pedido"
                                );
                              }
                            } catch (err) {
                              console.error(err);
                              alert("Error de conexión");
                            }
                          }}
                        >
                          📄 Generar pedido
                        </Button>
                      </Box>
                    </>
                  )}

                  <ListItem
                    sx={{
                      background: "#10151c",
                      border: "1px solid #252d38",
                      borderRadius: "10px",
                      mb: 1,
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          {p.nombre}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{
                            color: "#7f8b99",
                            fontSize: "12px",
                            mt: 0.4,
                          }}
                        >
                          Stock: {p.stock_actual} · Mínimo:{" "}
                          {p.stock_minimo} · Pedir:{" "}
                          {p.cantidad_pedir}
                        </Typography>
                      }
                    />
                  </ListItem>
                </Box>
              );
            })}
          </List>
        )}
      </Paper>
    </div>
  );
}

export default Pedidos;