import { Routes, Route } from "react-router-dom";

import Menu from "./components/Menu";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";

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
        </Routes>
      </div>
    </div>
  );
}

export default App;