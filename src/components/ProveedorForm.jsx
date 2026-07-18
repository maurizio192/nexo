import { useState } from "react";

export default function ProveedorForm({ actualizar }) {

  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

     async function guardar() {

  console.log("Guardar pulsado");

  try {

    const res = await fetch("http://192.168.1.67:3001/proveedores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        contacto,
        telefono,
        email
      })
    });

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

  return(

    <div
      style={{
        background:"white",
        padding:20,
        marginBottom:20,
        borderRadius:10
      }}
    >

      <h2>Nuevo proveedor</h2>

      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e)=>setNombre(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Contacto"
        value={contacto}
        onChange={(e)=>setContacto(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Teléfono"
        value={telefono}
        onChange={(e)=>setTelefono(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br/><br/>

      <button onClick={guardar}>

        Guardar proveedor

      </button>

    </div>

  );

}