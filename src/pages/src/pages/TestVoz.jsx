import { useState } from "react";

export default function TestVoz() {
  const [texto, setTexto] = useState("");

  function escuchar() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("SpeechRecognition no disponible");
      return;
    }

    const rec = new SpeechRecognition();

    rec.lang = "es-ES";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      console.log("START");
      alert("Escuchando...");
    };

    rec.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      console.log(texto);
      setTexto(texto);
      alert(texto);
    };

    rec.onerror = (e) => {
      console.log("ERROR:", e);

      alert(
        JSON.stringify(
          {
            error: e.error,
            type: e.type,
          },
          null,
          2
        )
      );
    };

    rec.onend = () => {
      console.log("END");
    };

    rec.start();
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Prueba de voz</h1>

      <button onClick={escuchar}>
        🎤 Escuchar
      </button>

      <h2>{texto}</h2>
    </div>
  );
}