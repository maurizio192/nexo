import { useState } from "react";

export default function ProveedorForm({ actualizar }) {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  async function guardar() {
    console.log("Guardar pulsado");

    try {
      const res = await fetch(
        "http://192.168.1.67:3001/api/proveedores",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            contacto,
            telefono,
            email,
          }),
        }
      );

      console.log("Status:", res.status);

      const texto = await res.text();
      console.log("Respuesta:", texto);

      if (res.ok) {
        setNombre("");
        setContacto("");
        setTelefono("");
        setEmail("");

        actualizar();

        alert("Proveedor guardado");
      } else {
        alert("Error del servidor");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  }

  const inputStyle = {
    width: "100%",
    height: "46px",
    boxSizing: "border-box",
    padding: "0 14px",
    background: "#10151c",
    color: "#ffffff",
    border: "1px solid #303a47",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div
      style={{
        background: "#151a21",
        border: "1px solid #252d38",
        padding: "20px",
        borderRadius: "14px",
        marginBottom: "20px",
        color: "#ffffff",
        boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            color: "#00d9ff",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "5px",
          }}
        >
          NEXO · COMPRAS
        </div>

        <h2
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          Nuevo proveedor
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "12px",
        }}
      >
        <input
          style={inputStyle}
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Contacto"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button
        onClick={guardar}
        style={{
          marginTop: "14px",
          width: "100%",
          minHeight: "46px",
          border: "none",
          borderRadius: "10px",
          background: "#00a8c7",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Guardar proveedor
      </button>
    </div>
  );
}