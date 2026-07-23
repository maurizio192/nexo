import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import BotonVoz from "../components/BotonVoz";
import Cartas from "./Cartas";

function Inicio() {

  const [estado, setEstado] = useState(null);
  const [mensajeSancho, setMensajeSancho] = useState("");
  const [panel, setPanel] = useState(null);

  useEffect(() => {

    fetch("http://192.168.1.67:3001/sancho")
      .then(res => res.json())
      .then(data => {

        setEstado(data);
        setMensajeSancho(`${data.saludo} ${data.mensaje}`);

      })
      .catch(() => {

        setEstado(null);

      });

    fetch("http://192.168.1.67:3001/panel-operaciones")
      .then(res => res.json())
      .then(data => {

        setPanel(data);

      })
      .catch(console.error);

  }, []);

  const generarPedido = async () => {

    try {

      const res = await fetch(
        "http://192.168.1.67:3001/pedidos/generar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            proveedor: "Makro"
          })
        }
      );

      const data = await res.json();

      setMensajeSancho(
        `✅ Pedido Makro generado correctamente.\nNúmero de pedido: ${data.pedido}.\n¿Qué hacemos ahora?`
      );

    } catch (err) {

      console.error(err);

      setMensajeSancho(
        "❌ No he podido generar el pedido."
      );

    }

  };

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

            <h3>{estado.saludo}</h3>

            <p style={{ whiteSpace: "pre-line" }}>
              {mensajeSancho}
            </p>

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

          </>

        ) : (

          <p>Conectando con Sancho...</p>

        )}

      </div>

      <div
        style={{
          background: "#2563eb",
          color: "white",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}
      >

        <h2>📋 Panel de Operaciones</h2>

        {panel ? (

          <>

            <h3>{panel.titulo}</h3>

            <p>
              Estado actual:
              <strong> {panel.modo}</strong>
            </p>

          </>

        ) : (

          <p>Cargando Panel...</p>

        )}

      </div>

      {estado?.incidencias?.length > 0 && (

        <div
          style={{
            marginTop: 20,
            background: "#7f1d1d",
            color: "white",
            padding: 15,
            borderRadius: 10
          }}
        >

          <h3>⚠ Incidencias</h3>

          {estado.incidencias.map((item, index) => (

            <p key={index}>
              • {item.nombre} ({item.stock_actual}/{item.stock_minimo})
            </p>

          ))}

        </div>

      )}

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

          <button
            onClick={generarPedido}
            style={{
              marginTop: 15,
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            📦 Generar pedido
          </button>

        </div>

      )}

      <BotonVoz />

      <Dashboard />

      <Cartas />

    </div>

  );

}

export default Inicio;