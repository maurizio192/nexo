import Dashboard from "../components/Dashboard";
import BotonVoz from "../components/BotonVoz";
import Cartas from "./Cartas";

function Inicio() {
  return (
    <div>
      <Dashboard />

      <div style={{ padding: "0 30px 30px" }}>
        <BotonVoz />
      </div>

      <Cartas />
    </div>
  );
}

export default Inicio;
