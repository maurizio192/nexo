import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import BotonVoz from "../components/BotonVoz";
function Inicio() {
  const [stato, setStato] = useState("Connessione in corso...");

  useEffect(() => {
    fetch("http://192.168.1.67:3001")
      .then((res) => res.json())
      .then((data) => {
        setStato("🟢 " + data.message);
      })
      .catch(() => {
        setStato("🔴 Backend non raggiungibile");
      });
  }, []);

  return (
    <div>
      <Dashboard />
      <BotonVoz />
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "white",
          borderRadius: "10px",
        }}
      >
        <h3>Stato del server</h3>
        <p>{stato}</p>
      </div>
    </div>
  );
}

export default Inicio;