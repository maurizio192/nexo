import { useEffect, useRef, useState } from "react";

export default function TestVoz() {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("Preparado");
  const [soportado, setSoportado] = useState(true);
  const [escuchando, setEscuchando] = useState(false);
  const [error, setError] = useState("");

  const [microEstado, setMicroEstado] = useState("No probado");
  const [microActivo, setMicroActivo] = useState(false);

  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSoportado(false);
      setEstado("No compatible");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setEscuchando(true);
      setEstado("Escuchando...");
      setError("");
    };

    recognition.onresult = (event) => {
      let resultado = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        resultado += event.results[i][0].transcript;
      }

      setTexto(resultado);
    };

    recognition.onend = () => {
      setEscuchando(false);
      setEstado("Finalizado");
    };

    recognition.onerror = (event) => {
      setEscuchando(false);
      setEstado("Error");
      setError(event.error || "Error desconocido");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // No hacer nada si ya estaba detenido.
      }
    };
  }, []);

  async function probarMicrofono() {
    setError("");
    setMicroEstado("Solicitando permiso...");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicroEstado("No compatible");
      setMicroActivo(false);
      setError(
        "Este navegador no permite acceder al micrófono mediante getUserMedia."
      );
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const pistas = stream.getAudioTracks();

      if (pistas.length > 0) {
        setMicroEstado("Micrófono funcionando");
        setMicroActivo(true);
      } else {
        setMicroEstado("Sin micrófono");
        setMicroActivo(false);
      }
    } catch (err) {
      console.error(err);
      setMicroActivo(false);

      if (err.name === "NotAllowedError") {
        setMicroEstado("Permiso denegado");
        setError("El navegador no tiene permiso para utilizar el micrófono.");
      } else if (err.name === "NotFoundError") {
        setMicroEstado("Micrófono no encontrado");
        setError("No se encontró ningún micrófono disponible.");
      } else {
        setMicroEstado("Error");
        setError(err.message || "No se pudo acceder al micrófono.");
      }
    }
  }

  function detenerMicrofono() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setMicroActivo(false);
    setMicroEstado("Detenido");
  }

  function escuchar() {
    setError("");
    setTexto("");

    if (!recognitionRef.current) {
      setSoportado(false);
      setEstado("No compatible");
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar el reconocimiento.");
      setEstado("Error");
    }
  }

  function detener() {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error(err);
    }
  }

  function borrar() {
    setTexto("");
    setError("");
    setEstado("Preparado");
  }

  const estadoColor = escuchando ? "#00d9ff" : "#aeb8c4";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        background: "#0b0f14",
        color: "#ffffff",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "26px" }}>
          <div
            style={{
              color: "#00d9ff",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              marginBottom: "7px",
            }}
          >
            NEXO · DIAGNÓSTICO
          </div>

          <h1
            style={{
              margin: 0,
              color: "#d7f7ff",
              fontSize: "32px",
              fontWeight: "700",
              lineHeight: "1.1",
            }}
          >
            🎙️ Prueba de voz
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#8f9baa",
              fontSize: "15px",
              lineHeight: "1.5",
            }}
          >
            Diagnóstico independiente del micrófono y del reconocimiento de
            voz.
          </p>
        </div>

        {/* PRUEBA FÍSICA DEL MICRÓFONO */}

        <div
          style={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              color: "#8f9baa",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              marginBottom: "7px",
            }}
          >
            Prueba 1 · Micrófono físico
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <div
                style={{
                  color: microActivo ? "#00d9ff" : "#d7f7ff",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                {microActivo ? "● " : "○ "}
                {microEstado}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  color: "#8f9baa",
                  fontSize: "14px",
                }}
              >
                Comprueba si el navegador puede acceder al micrófono.
              </div>
            </div>

            <div
              style={{
                minWidth: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: microActivo
                  ? "rgba(0,217,255,0.14)"
                  : "#202731",
                fontSize: "23px",
              }}
            >
              🎙️
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <button
              onClick={probarMicrofono}
              style={{
                minHeight: "54px",
                border: "none",
                borderRadius: "12px",
                background: "#00d9ff",
                color: "#071016",
                fontSize: "17px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              🎙️ Probar micrófono
            </button>

            <button
              onClick={detenerMicrofono}
              disabled={!microActivo}
              style={{
                minHeight: "54px",
                border: "1px solid #303945",
                borderRadius: "12px",
                background: microActivo ? "#202731" : "#151a21",
                color: microActivo ? "#ffffff" : "#596572",
                fontSize: "17px",
                fontWeight: "700",
                cursor: microActivo ? "pointer" : "default",
              }}
            >
              ⏹️ Detener
            </button>
          </div>
        </div>

        {/* PRUEBA SPEECH RECOGNITION */}

        <div
          style={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              color: "#8f9baa",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              marginBottom: "7px",
            }}
          >
            Prueba 2 · Reconocimiento de voz
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            <div>
              <div
                style={{
                  color: estadoColor,
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                {escuchando ? "● " : "○ "}
                {estado}
              </div>
            </div>

            <div
              style={{
                minWidth: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: escuchando
                  ? "rgba(0,217,255,0.14)"
                  : "#202731",
                fontSize: "22px",
              }}
            >
              🗣️
            </div>
          </div>

          {!soportado && (
            <div
              style={{
                background: "#2a1c1c",
                border: "1px solid #613333",
                color: "#ffb4b4",
                borderRadius: "10px",
                padding: "14px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              Este navegador no dispone de reconocimiento de voz mediante
              SpeechRecognition.
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#2a1c1c",
                border: "1px solid #613333",
                color: "#ffb4b4",
                borderRadius: "10px",
                padding: "14px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <button
              onClick={escuchar}
              disabled={escuchando || !soportado}
              style={{
                minHeight: "54px",
                border: "none",
                borderRadius: "12px",
                background:
                  escuchando || !soportado ? "#28313b" : "#00d9ff",
                color:
                  escuchando || !soportado ? "#65717e" : "#071016",
                fontSize: "17px",
                fontWeight: "800",
                cursor:
                  escuchando || !soportado ? "default" : "pointer",
              }}
            >
              🗣️ Empezar
            </button>

            <button
              onClick={detener}
              disabled={!escuchando}
              style={{
                minHeight: "54px",
                border: "1px solid #303945",
                borderRadius: "12px",
                background: escuchando ? "#202731" : "#151a21",
                color: escuchando ? "#ffffff" : "#596572",
                fontSize: "17px",
                fontWeight: "700",
                cursor: escuchando ? "pointer" : "default",
              }}
            >
              ⏹️ Detener
            </button>
          </div>
        </div>

        {/* TEXTO */}

        <div
          style={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              color: "#8f9baa",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              marginBottom: "10px",
            }}
          >
            Texto reconocido
          </div>

          <div
            style={{
              minHeight: "130px",
              boxSizing: "border-box",
              background: "#0f141a",
              border: "1px solid #303945",
              borderRadius: "12px",
              padding: "16px",
              color: texto ? "#ffffff" : "#65717e",
              fontSize: "18px",
              lineHeight: "1.55",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {texto || "Aquí aparecerá lo que diga el usuario..."}
          </div>

          <button
            onClick={borrar}
            style={{
              width: "100%",
              minHeight: "48px",
              marginTop: "12px",
              border: "1px solid #303945",
              borderRadius: "10px",
              background: "#202731",
              color: "#d7dee6",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🗑️ Borrar texto
          </button>
        </div>

        {/* INSTRUCCIONES */}

        <div
          style={{
            background: "#11171d",
            border: "1px solid #202731",
            borderRadius: "12px",
            padding: "16px",
            color: "#8f9baa",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: "#d7f7ff" }}>
            Orden de la prueba:
          </strong>
          <br />
          1. Pulsa <strong style={{ color: "#ffffff" }}>Probar micrófono</strong>.
          <br />
          2. Acepta el permiso del navegador.
          <br />
          3. Comprueba si aparece{" "}
          <strong style={{ color: "#00d9ff" }}>
            Micrófono funcionando
          </strong>
          .
          <br />
          4. Después prueba el reconocimiento de voz.
          <br />
          <br />
          <strong style={{ color: "#d7f7ff" }}>
            Frase de prueba:
          </strong>
          <br />
          <span style={{ color: "#00d9ff" }}>
            “Comanda Sala 1: un primero de ensalada, tres segundos de
            croquetas y tres terceros de lubina.”
          </span>
        </div>
      </div>
    </div>
  );
}
