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
} from "@mui/material";


export default function Proveedores() {

  const navigate = useNavigate();


  const [proveedores, setProveedores] = useState([]);

  const [productosProveedor, setProductosProveedor] = useState([]);

  const [proveedorAbierto, setProveedorAbierto] = useState(null);



  const cargarProveedores = async () => {

    try {

      const res = await fetch(`${API}/proveedores`);

      const data = await res.json();

      setProveedores(data);


    } catch(err){

      console.error(err);

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


    } catch(err){

      console.error(err);

    }

  };




  const eliminarProveedor = async (id) => {


    if(!window.confirm("¿Eliminar proveedor?")) return;


    try {


      const res = await fetch(
        `${API}/proveedores/${id}`,
        {
          method:"DELETE"
        }
      );


      const data = await res.json();


      if(data.ok){

        cargarProveedores();

      }


    } catch(err){

      console.error(err);

    }

  };




  return (

    <div>


      <Typography variant="h4" gutterBottom>
        🚚 Proveedores
      </Typography>



      <ProveedorForm
        actualizar={cargarProveedores}
      />



      {
        proveedores.map((p)=>(


          <Paper

            key={p.id}

            sx={{
              p:3,
              mt:3
            }}

          >


            <Typography variant="h5">
              {p.nombre}
            </Typography>


            <Typography>
              👤 {p.contacto || "Sin contacto"}
            </Typography>


            <Typography>
              📞 {p.telefono || "Sin teléfono"}
            </Typography>


            <Typography>
              📧 {p.email || "Sin email"}
            </Typography>



            <Button

              variant="contained"

              sx={{
                mt:2
              }}

              onClick={()=>verProductos(p.nombre)}

            >
              📦 Ver productos
            </Button>



            <Button

              color="error"

              sx={{
                mt:2,
                ml:2
              }}

              onClick={()=>eliminarProveedor(p.id)}

            >
              🗑 Eliminar
            </Button>





            {
              proveedorAbierto === p.nombre && (


                <div style={{marginTop:25}}>


                  <Typography variant="h6">

                    Productos de {p.nombre}

                  </Typography>




                  <TableContainer component={Paper}>


                    <Table size="small">


                      <TableHead>


                        <TableRow>

                          <TableCell>
                            Producto
                          </TableCell>


                          <TableCell>
                            Unidad
                          </TableCell>


                          <TableCell>
                            Stock
                          </TableCell>


                          <TableCell>
                            Mínimo
                          </TableCell>


                          <TableCell>
                            Ubicación
                          </TableCell>


                          <TableCell>
                            Acción
                          </TableCell>


                        </TableRow>


                      </TableHead>




                      <TableBody>



                      {
                        productosProveedor.map((prod)=>(


                          <TableRow key={prod.id}>


                            <TableCell>
                              {prod.nombre}
                            </TableCell>


                            <TableCell>
                              {prod.unidad}
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



                            <TableCell>


                              <Button

                                size="small"

                                onClick={()=>navigate(
                                  "/productos",
                                  {
                                    state:{
                                      producto:prod
                                    }
                                  }
                                )}

                              >
                                ✏️
                              </Button>


                            </TableCell>



                          </TableRow>


                        ))

                      }


                      </TableBody>



                    </Table>


                  </TableContainer>





                  <Button

                    variant="outlined"

                    sx={{
                      mt:2
                    }}


                    onClick={()=>navigate(
                      "/productos",
                      {
                        state:{
                          proveedor:p.nombre
                        }
                      }
                    )}

                  >

                    ➕ Añadir producto

                  </Button>



                </div>


              )

            }



          </Paper>


        ))

      }



    </div>

  );


}