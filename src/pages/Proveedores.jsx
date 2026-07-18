import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProveedorForm from "../components/ProveedorForm";

export default function Proveedores() {

  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [productosProveedor, setProductosProveedor] = useState([]);
  const [proveedorAbierto, setProveedorAbierto] = useState(null);

  const cargarProveedores = () => {
    fetch("http://192.168.1.67:3001/proveedores")
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch(console.error);
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  async function verProductos(nombre) {
    const res = await fetch(
      `http://192.168.1.67:3001/proveedores/${encodeURIComponent(nombre)}/productos`
    );

    const datos = await res.json();

    setProveedorAbierto(nombre);
    setProductosProveedor(datos);
  }

  return (
    <div>

      <h1>🚚 Proveedores</h1>

      <ProveedorForm actualizar={cargarProveedores} />

      <p>
        Total proveedores: <strong>{proveedores.length}</strong>
      </p>

      {proveedores.map((p) => (

        <div
          key={p.id}
          style={{
            background: "white",
            padding: 20,
            marginBottom: 15,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,.15)"
          }}
        >

          <h3>{p.nombre}</h3>

          <p>👤 Contacto: {p.contacto || "No definido"}</p>

          <p>📞 Teléfono: {p.telefono || "No definido"}</p>

          <p>📧 Email: {p.email || "No definido"}</p>

          <button onClick={() => verProductos(p.nombre)}>
            📦 Ver productos
          </button>

          {proveedorAbierto === p.nombre && (

            <div
              style={{
                marginTop: 15,
                background: "#f8f8f8",
                padding: 15,
                borderRadius: 10
              }}
            >

              <h4>Productos</h4>

              {productosProveedor.length === 0 ? (
                <p>No hay productos para este proveedor.</p>
              ) : (
                productosProveedor.map((prod) => (
                  <div
                    key={prod.id}
                    style={{
                      padding: "6px 0",
                      borderBottom: "1px solid #ddd"
                    }}
                  >
                    📦 {prod.nombre}
                  </div>
                ))
              )}

              <button
                style={{ marginTop: 15 }}
                onClick={() =>
                  navigate("/productos", {
                    state: {
                      proveedor: p.nombre
                    }
                  })
                }
              >
                ➕ Añadir producto
              </button>

            </div>

          )}

        </div>

      ))}

    </div>
  );
}