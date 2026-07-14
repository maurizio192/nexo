import { Routes, Route } from "react-router-dom";

import Elaboraciones from "./pages/Elaboraciones";

import Menu from "./components/Menu";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import Producciones from "./pages/Producciones";
import Sancho from "./pages/Sancho";

function App() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "100vh",
      }}
    >
      <Menu />

      <div
        style={{
          background: "#f3f4f6",
          padding: "30px",
        }}
      >
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/elaboraciones" element={<Elaboraciones />} />
          <Route path="/producciones" element={<Producciones />} />
          <Route path="/sancho" element={<Sancho />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;