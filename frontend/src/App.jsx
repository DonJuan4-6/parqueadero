import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import VehicleForm from "./pages/VehicleForm.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vehiculos/nuevo" element={<VehicleForm />} />
          <Route path="/vehiculos/:placa/editar" element={<VehicleForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>GetParking</span>
        <span>Control sencillo para cada espacio.</span>
      </footer>
    </div>
  );
}
