import { useEffect, useState } from "react";

function Cartas() {

  const [cartas, setCartas] = useState([]);

  useEffect(() => {

    fetch("http://192.168.1.67:3001/cartas")
      .then(res => res.json())
      .then(data => setCartas(data));

  }, []);

  return (

    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12
      }}
    >

      <h2>📋 Cartas</h2>

      <hr />

      {cartas.map(carta => (

        <div
          key={carta.id}
          style={{
            padding: 15,
            marginBottom: 10,
            border: "1px solid #ddd",
            borderRadius: 10,
            cursor: "pointer"
          }}
        >

          <strong>{carta.nombre}</strong>

          <br />

          <small>{carta.tipo}</small>

        </div>

      ))}

    </div>

  );

}

export default Cartas;