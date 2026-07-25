import { Routes, Route } from "react-router-dom";

import Menu from "./components/Menu";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import Proveedores from "./pages/Proveedores";
import Pedidos from "./pages/Pedidos";
import Cartas from "./pages/Cartas";

import LibroRecetas from "./pages/LibroRecetas";
import CategoriaRecetas from "./pages/CategoriaRecetas";
import RecetaDetalle from "./pages/RecetaDetalle";

import Elaboraciones from "./pages/Elaboraciones";
import Producciones from "./pages/Producciones";

import Servicio from "./pages/Servicio";
import Sancho from "./pages/Sancho";


import TestVoz from "./pages/TestVoz";

function App() {

  return (

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "100vh"
      }}
    >

      <Menu />

      <div
        style={{
          background: "#f3f4f6",
          padding: "30px"
        }}
      >

        <Routes>

          <Route path="/" element={<Inicio />} />

          <Route path="/testvoz" element={<TestVoz />} />

          <Route path="/productos" element={<Productos />} />

          <Route path="/proveedores" element={<Proveedores />} />

          <Route path="/cartas" element={<Cartas />} />

          <Route path="/pedidos" element={<Pedidos />} />

          <Route path="/libro-recetas" element={<LibroRecetas />} />

          <Route
            path="/categoria/:categoria"
            element={<CategoriaRecetas />}
          />

          <Route
            path="/recetas/:id"
            element={<RecetaDetalle />}
          />

          <Route
            path="/elaboraciones"
            element={<Elaboraciones />}
          />

          <Route
            path="/producciones"
            element={<Producciones />}
          />

          <Route
            path="/servicio"
            element={<Servicio />}
          />

          <Route
            path="/sancho"
            element={<Sancho />}
          />

          
        </Routes>

      </div>

    </div>

  );

}

export default App;