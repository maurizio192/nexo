export default function BotonVoz() {
  const escuchar = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Este navegador no soporta reconocimiento de voz.");
      return;
    }

    const reconocimiento = new SpeechRecognition();

    reconocimiento.lang = "es-ES";
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.onstart = () => {
      console.log("🎤 Escuchando...");
    };

    reconocimiento.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      alert("Has dicho: " + texto);
      console.log(texto);
    };

    reconocimiento.onerror = (e) => {
      alert("Error: " + e.error);
      console.log(e.error);
    };

    reconocimiento.start();
  };

  return (
    <button
      onClick={escuchar}
      style={{
        padding: "12px 20px",
        fontSize: "18px",
        borderRadius: "10px",
        cursor: "pointer",
      }}
    >
      🎤 Escuchar
    </button>
  );
}