import { Routes, Route } from "react-router-dom";
import Servicio from "./pages/Servicio";
import Menu from "./components/Menu";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import Proveedores from "./pages/Proveedores";
import Elaboraciones from "./pages/Elaboraciones";
import Producciones from "./pages/Producciones";
import Sancho from "./pages/Sancho";
import FichasTecnicas from "./pages/FichasTecnicas";
import FichaDeliciaPollo from "./pages/FichaDeliciaPollo";
import TestVoz from "./pages/TestVoz";
import Pedidos from "./pages/Pedidos";
import Cartas from "./pages/Cartas";

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

          <Route path="/testvoz" element={<TestVoz />} />

          <Route path="/proveedores" element={<Proveedores />} />

          <Route path="/productos" element={<Productos />} />
          
          <Route path="/cartas" element={<Cartas />} />
          
          <Route path="/pedidos" element={<Pedidos />} />

          <Route path="/elaboraciones" element={<Elaboraciones />} />

          <Route path="/producciones" element={<Producciones />} />

          <Route path="/servicio" element={<Servicio />} />

          <Route path="/sancho" element={<Sancho />} />

          <Route
            path="/fichas-tecnicas"
            element={<FichasTecnicas />}
          />

          <Route
            path="/ficha/delicia-pollo"
            element={<FichaDeliciaPollo />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;