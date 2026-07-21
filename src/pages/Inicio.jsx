import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import BotonVoz from "../components/BotonVoz";

function Inicio() {

  const [estado, setEstado] = useState(null);

  useEffect(() => {

    fetch("http://192.168.1.67:3001/sancho")
      .then(res => res.json())
      .then(data => {

        setEstado(data);

        const voz = new SpeechSynthesisUtterance("Oído.");

        voz.lang = "es-ES";
        voz.rate = 0.95;

        speechSynthesis.cancel();
        speechSynthesis.speak(voz);

      })
      .catch(() => {

        setEstado(null);

      });

  }, []);

  return (

    <div>

      <div
        style={{
          background: "#1f2937",
          color: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}
      >

        <h2>🤖 SANCHO</h2>

        <hr />

        {estado ? (

          <>

            <h3>Oído.</h3>

            <p>Buenos días Maurizio.</p>

            <p>
              Producciones pendientes:
              <strong> {estado.estado?.producciones ?? 0}</strong>
            </p>

            <p>
              Pedidos pendientes:
              <strong> {estado.estado?.pedidos ?? 0}</strong>
            </p>

            <p>
              Stock crítico:
              <strong> {estado.estado?.stockCritico ?? 0}</strong>
            </p>

            <p>
              Ventas hoy:
              <strong> {estado.estado?.ventasHoy ?? 0}</strong>
            </p>

            <h3>¿Qué hacemos primero?</h3>
{estado?.incidencias?.length > 0 && (

  <div
    style={{
      marginTop: 20,
      background: "#7f1d1d",
      padding: 15,
      borderRadius: 10
    }}
  >

    <h3>⚠️ Incidencias</h3>
{estado?.recomendaciones?.length > 0 && (

  <div
    style={{
      marginTop: 20,
      background: "#14532d",
      color: "white",
      padding: 15,
      borderRadius: 10
    }}
  >

    <h3>🤖 Recomendaciones</h3>

    {estado.recomendaciones.map((texto, index) => (

      <p key={index}>
        • {texto}
      </p>

    ))}

  </div>

)}
    {estado.incidencias.map((item, index) => (

      <p key={index}>

        • {item.nombre}
        {" "}
        ({item.stock_actual}/{item.stock_minimo})

      </p>

    ))}

  </div>

)}
          </>

        ) : (

          <p>Conectando con Sancho...</p>

        )}

      </div>

      <BotonVoz />

      <Dashboard />

    </div>

  );

}

export default Inicio;