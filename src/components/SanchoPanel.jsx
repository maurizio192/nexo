function SanchoPanel({

  titulo = "SANCHO",

  mensaje = "",

  tipo = "info"

}) {

  const colores = {

    info: "#1f2937",

    ok: "#166534",

    warning: "#92400e",

    error: "#991b1b"

  };

  return (

    <div
      style={{
        background: colores[tipo],
        color: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
      }}
    >

      <h2>🤖 {titulo}</h2>

      <hr />

      <p
        style={{
          fontSize: 18
        }}
      >
        {mensaje}
      </p>

    </div>

  );

}

export default SanchoPanel;