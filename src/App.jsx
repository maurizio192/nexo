import { Routes, Route } from "react-router-dom";

import Menu from "./components/Menu";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import Elaboraciones from "./pages/Elaboraciones";
import Producciones from "./pages/Producciones";
import Sancho from "./pages/Sancho";
import FichasTecnicas from "./pages/FichasTecnicas";
import FichaDeliciaPollo from "./pages/FichaDeliciaPollo";
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
          <Route
  path="/ficha/delicia-pollo"
  element={<FichaDeliciaPollo />}
/>
          <Route path="/ficha/delicia-pollo" element={<FichaDeliciaPollo />} />
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/elaboraciones" element={<Elaboraciones />} />
          <Route path="/producciones" element={<Producciones />} />
          <Route path="/sancho" element={<Sancho />} />
          <Route path="/fichas-tecnicas" element={<FichasTecnicas />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;