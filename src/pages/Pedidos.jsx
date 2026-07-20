import { useEffect, useState } from "react";

import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";

function Pedidos() {

  const [productos, setProductos] = useState([]);

  useEffect(() => {

    fetch("http://192.168.1.67:3001/pedidos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error(err));

  }, []);

  let proveedorAnterior = "";

  return (

    <Paper sx={{ p: 3 }}>

      <Typography variant="h4" gutterBottom>
        🛒 Pedidos
      </Typography>

      <List>

        {productos.map((p) => {

          const mostrarProveedor = proveedorAnterior !== p.proveedor;
          proveedorAnterior = p.proveedor;

          return (

            <div key={p.nombre}>

             {mostrarProveedor && (

                <>

                  <Divider sx={{ mt: 2, mb: 2 }} />

                  <Typography variant="h6">
                    📦 {p.proveedor}
                  </Typography>

                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ mb: 2 }}
                    onClick={async () => {

                      try {

                        const res = await fetch(
                          "http://192.168.1.67:3001/pedidos/generar",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              proveedor: p.proveedor,
                            }),
                          }
                        );

                        const data = await res.json();

                        if (data.ok) {

                          alert(`✅ Pedido nº ${data.pedido} generado`);

                        } else {

                          alert("Error creando pedido");

                        }

                      } catch (err) {

                        console.error(err);

                        alert("Error de conexión");

                      }

                    }}
                  >
                    📄 Generar pedido
                  </Button>

                </>

              )}

              <ListItem>

                <ListItemText
                  primary={p.nombre}
                  secondary={`Stock: ${p.stock_actual} | Mínimo: ${p.stock_minimo}`}
                />

              </ListItem>

            </div>

          );

        })}

      </List>

    </Paper>

  );

}

export default Pedidos;
