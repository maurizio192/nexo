import React, { useState } from "react";

export default function BotonVoz() {
  const [escuchando, setEscuchando] = useState(false);
  const [texto, setTexto] = useState("");

  const iniciarVoz = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Este navegador no soporta reconocimiento de voz.");
      return;
    }

    const reconocimiento = new SpeechRecognition();

    reconocimiento.lang = "es-ES";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    reconocimiento.onstart = () => {
      setEscuchando(true);
      setTexto("");
    };

    reconocimiento.onresult = (event) => {
      const resultado = event.results[0][0].transcript;
      setTexto(resultado);
    };

    reconocimiento.onerror = () => {
      setEscuchando(false);
    };

    reconocimiento.onend = () => {
      setEscuchando(false);
    };

    reconocimiento.start();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "20px 0",
      }}
    >
      <button
        onClick={iniciarVoz}
        style={{
          width: escuchando ? 190 : 150,
          height: escuchando ? 190 : 150,
          borderRadius: "50%",
          border: escuchando
            ? "4px solid #00e5ff"
            : "2px solid #444",
          background: escuchando
            ? "#071820"
            : "#111827",
          color: "#fff",
          cursor: "pointer",
          fontSize: "22px",
          boxShadow: escuchando
            ? "0 0 35px rgba(0,229,255,0.45)"
            : "0 8px 25px rgba(0,0,0,0.35)",
          transition: "all 0.25s ease",
        }}
      >
        {escuchando ? "🎙️" : "🎤"}
      </button>

      <div
        style={{
          marginTop: 14,
          textAlign: "center",
          color: "#fff",
        }}
      >
        {escuchando ? (
          <>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#00e5ff",
              }}
            >
              Hola, soy SANCHO
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 15,
                color: "#bbb",
              }}
            >
              Ya estoy escuchando. Dime qué necesitas.
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: 16,
              color: "#bbb",
            }}
          >
            🎤 Hablar con SANCHO
          </div>
        )}
      </div>

      {texto && (
        <div
          style={{
            marginTop: 15,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#1b2430",
            color: "#fff",
            maxWidth: 500,
            textAlign: "center",
          }}
        >
          {texto}
        </div>
      )}
    </div>
  );
}
