import { useEffect, useState } from "react";

function Tarjeta({ titulo, valor, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderLeft: `8px solid ${color}`,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 3px 10px rgba(0,0,0,.15)",
      }}
    >
      <div style={{ color: "#666", fontSize: 14 }}>
        {titulo}
      </div>

      <div
        style={{
          fontSize: 40,
          fontWeight: "bold",
          marginTop: 10,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

export default function Sancho() {
  const [saludo, setSaludo] = useState("");

  const [resumen, setResumen] = useState({
    stockCritico: 0,
    compras: 0,
    producciones: 0,
  });

  const [avisos, setAvisos] = useState([]);
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [textoVoz, setTextoVoz] = useState("");

  useEffect(() => {
    cargarSancho();
  }, []);

  async function cargarSancho() {
    try {
      const res = await fetch("http://192.168.1.67:3001/sancho");
      const data = await res.json();

      setSaludo(data.saludo || "");
      setResumen(data.resumen || {});
      setAvisos(data.avisos || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function hablarConSancho() {
    if (!pregunta.trim()) return;

    setRespuesta("⏳ Pensando...");

    try {
      const res = await fetch(
        "http://192.168.1.67:3001/sancho/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pregunta }),
        }
      );

      const data = await res.json();

      setRespuesta(data.respuesta);
    } catch {
      setRespuesta("❌ No puedo conectar con Sancho");
    }
  }

  function escuchar() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("SpeechRecognition no disponible");
      return;
    }

    const rec = new SpeechRecognition();

    rec.lang = "es-ES";

    rec.onresult = (e) => {
      const texto = e.results[0][0].transcript;

      setTextoVoz(texto);
      setPregunta(texto);
    };

    rec.onerror = (e) => {
      alert(e.error);
    };

    rec.start();
  }

  return (
    <div
      style={{
        padding: 30,
        background: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      <h1>🧠 SANCHO</h1>

      <h2>{saludo}</h2>

      <button
        onClick={escuchar}
        style={{
          padding: 12,
          fontSize: 18,
          marginBottom: 20,
        }}
      >
        🎤 Escuchar
      </button>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 25,
        }}
      >
        <h2>💬 Hablar con Sancho</h2>

        <input
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Escribe una pregunta..."
          style={{
            width: "100%",
            padding: 12,
            fontSize: 18,
            marginBottom: 15,
          }}
        />

        <button onClick={hablarConSancho}>
          Enviar
        </button>

        <h3>{respuesta}</h3>

        <h4>{textoVoz}</h4>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <Tarjeta
          titulo="🔴 Stock crítico"
          valor={resumen.stockCritico}
          color="red"
        />

        <Tarjeta
          titulo="🟠 Compras"
          valor={resumen.compras}
          color="orange"
        />

        <Tarjeta
          titulo="🟢 Producciones"
          valor={resumen.producciones}
          color="green"
        />
      </div>

      <h2>🚨 Avisos</h2>

      {avisos.length === 0 ? (
        <p>No hay avisos.</p>
      ) : (
        avisos.map((a, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            {a.mensaje}
          </div>
        ))
      )}
    </div>
  );
}