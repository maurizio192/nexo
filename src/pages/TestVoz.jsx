import { useState } from "react";

export default function TestVoz() {
  const [texto, setTexto] = useState("");

  function escuchar() {
    alert("Botón pulsado");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("SpeechRecognition no existe");
      return;
    }

    const rec = new SpeechRecognition();

    rec.lang = "es-ES";

    rec.onstart = () => {
      alert("Escuchando...");
    };

    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setTexto(t);
      alert(t);
    };

    rec.onerror = (e) => {
      alert("ERROR: " + e.error);
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

