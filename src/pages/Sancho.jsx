import { useEffect, useState } from "react";

function Tarjeta({ titulo, valor, color }) {
  return (
    <div
      style={{
        background: "#151a21",
        border: "1px solid #252d38",
        borderLeft: `5px solid ${color}`,
        borderRadius: 14,
        padding: 18,
        boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          color: "#8f9baa",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: "700",
          marginTop: 10,
          color: "#ffffff",
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

  const API = "http://localhost:3001";

  useEffect(() => {
    cargarSancho();
  }, []);

  async function cargarSancho() {
    try {
      const res = await fetch(`${API}/sancho`);

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
      const res = await fetch(`${API}/sancho/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pregunta,
        }),
      });

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
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        padding: "24px",
        background: "#0b0f14",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              color: "#00d9ff",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            NEXO · ASISTENTE
          </div>

          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            🧠 SANCHO
          </h1>

          {saludo && (
            <p
              style={{
                margin: "8px 0 0",
                color: "#8f9baa",
                fontSize: 14,
              }}
            >
              {saludo}
            </p>
          )}
        </div>

        <div
          style={{
            background:
              "linear-gradient(135deg, #151a21 0%, #101a20 100%)",
            border: "1px solid #244654",
            borderRadius: 16,
            padding: 20,
            marginBottom: 18,
            boxShadow: "0 8px 25px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                💬 Hablar con Sancho
              </div>

              <div
                style={{
                  color: "#8f9baa",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                Pregunta a SANCHO sobre la operación de NEXO
              </div>
            </div>

            <button
              onClick={escuchar}
              style={{
                minHeight: 46,
                padding: "0 18px",
                borderRadius: 10,
                border: "1px solid #303a47",
                background: "#10151c",
                color: "#00d9ff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🎤 Escuchar
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "stretch",
              flexWrap: "wrap",
            }}
          >
            <input
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  hablarConSancho();
                }
              }}
              placeholder="Escribe una pregunta..."
              style={{
                flex: "1 1 400px",
                minWidth: 0,
                minHeight: 48,
                boxSizing: "border-box",
                padding: "0 14px",
                borderRadius: 10,
                border: "1px solid #303a47",
                background: "#10151c",
                color: "#ffffff",
                fontSize: 14,
                outline: "none",
              }}
            />

            <button
              onClick={hablarConSancho}
              style={{
                minHeight: 48,
                padding: "0 22px",
                border: "none",
                borderRadius: 10,
                background: "#00a8c7",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Enviar
            </button>
          </div>

          {textoVoz && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#10151c",
                border: "1px solid #252d38",
                borderRadius: 9,
                color: "#8f9baa",
                fontSize: 12,
              }}
            >
              🎤 Detectado por voz:{" "}
              <span style={{ color: "#ffffff" }}>
                {textoVoz}
              </span>
            </div>
          )}

          {respuesta && (
            <div
              style={{
                marginTop: 12,
                padding: 15,
                background: "#10151c",
                border: "1px solid #252d38",
                borderRadius: 10,
                color: "#ffffff",
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {respuesta}
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <Tarjeta
            titulo="🔴 Stock crítico"
            valor={resumen.stockCritico}
            color="#ff7777"
          />

          <Tarjeta
            titulo="🟠 Compras"
            valor={resumen.compras}
            color="#ffb84d"
          />

          <Tarjeta
            titulo="🟢 Producciones"
            valor={resumen.producciones}
            color="#6ee7a0"
          />
        </div>

        <div
          style={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 8px 25px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 4,
            }}
          >
            🚨 Avisos
          </div>

          <div
            style={{
              color: "#8f9baa",
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            Alertas detectadas por SANCHO
          </div>

          {avisos.length === 0 ? (
            <div
              style={{
                padding: 15,
                background: "#10151c",
                border: "1px solid #252d38",
                borderRadius: 10,
                color: "#6ee7a0",
                fontSize: 13,
              }}
            >
              ✅ No hay avisos.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {avisos.map((a, i) => (
                <div
                  key={i}
                  style={{
                    background: "#10151c",
                    border: "1px solid #3a3030",
                    borderLeft: "4px solid #ff7777",
                    padding: 15,
                    borderRadius: 10,
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                >
                  {a.mensaje}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
