// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import CategoriaIndex from "./pages/categorias/Index";
import AveIndex from "./pages/aves/Index";
import LoginPage from "./pages/auth/LoginPage";
import Register from "./pages/auth/Register";
import EstatusIndex from "./pages/estatus/Index";
import FamiliumIndex from "./pages/familias/Index";
import HabitatIndex from "./pages/habitats/Index";
import DetalleAve from "./pages/aves/DetalleAve";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Redireccionar de / a /aves */}
        <Route path="/" element={<Navigate to="/aves" />} />
        <Route path="/aves/:id" element={<DetalleAve />} />
        {/* Rutas normales */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aves" element={<AveIndex />} />
        <Route path="/categorias" element={<CategoriaIndex />} />
        <Route path="/estatus" element={<EstatusIndex />} />
        <Route path="/familias" element={<FamiliumIndex />} />
        <Route path="/habitats" element={<HabitatIndex />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
