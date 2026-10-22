import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import VehicleCard from "../components/VehicleCard.jsx";
import { getVehiculos, mensajeError, registrarSalida } from "../api/vehiculos.js";

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (location.state?.mensaje) {
      setMensaje(location.state.mensaje);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const cargarVehiculos = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setVehiculos(await getVehiculos());
    } catch (requestError) {
      setError(mensajeError(requestError));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarVehiculos();
  }, [cargarVehiculos]);

  const vehiculosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLocaleLowerCase("es");
    if (!query) return vehiculos;
    return vehiculos.filter(
      ({ placa, tipo_vehiculo }) =>
        placa.toLocaleLowerCase("es").includes(query) ||
        tipo_vehiculo.toLocaleLowerCase("es").includes(query),
    );
  }, [busqueda, vehiculos]);

  async function handleSalida(vehiculo) {
    const confirmacion = window.confirm(
      `¿Confirmas la salida del vehículo ${vehiculo.placa}? Este registro se retirará de la lista del parqueadero.`,
    );
    if (!confirmacion) return;

    setError("");
    setMensaje("");
    try {
      const resultado = await registrarSalida(vehiculo.placa);
      setVehiculos((actuales) =>
        actuales.filter((actual) => actual.placa !== vehiculo.placa),
      );
      setMensaje(resultado.message);
    } catch (requestError) {
      setError(mensajeError(requestError));
    }
  }

  const pagosPendientes = vehiculos.filter((vehiculo) => !vehiculo.pago_realizado).length;

  return (
    <section className="dashboard">
      <div className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow welcome-eyebrow">PANEL DE CONTROL</span>
          <h1>Tu parqueadero,<br />siempre en orden.</h1>
          <p>Administra los vehículos que están dentro y lleva el control de sus pagos.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-building">
            <span className="building-sign">P</span>
            <span className="building-window" />
            <span className="building-window" />
            <span className="building-window" />
            <span className="building-window" />
            <span className="building-door" />
          </div>
          <div className="art-car">
            <span className="car-window" />
            <span className="car-wheel car-wheel-left" />
            <span className="car-wheel car-wheel-right" />
          </div>
          <div className="art-road" />
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon stat-icon-green" aria-hidden="true">P</span>
          <div>
            <span className="stat-label">Vehículos dentro</span>
            <strong>{cargando || error ? "—" : vehiculos.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon stat-icon-amber" aria-hidden="true">$</span>
          <div>
            <span className="stat-label">Pagos pendientes</span>
            <strong>{cargando || error ? "—" : pagosPendientes}</strong>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow">OPERACIÓN</span>
          <h2>Vehículos en el parqueadero</h2>
          <p>Consulta y actualiza los registros de ingreso.</p>
        </div>
        <Link className="button button-primary" to="/vehiculos/nuevo">
          <span aria-hidden="true">+</span>
          Nuevo ingreso
        </Link>
      </div>

      <div className="list-toolbar">
        <label className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por placa o tipo de vehículo"
            aria-label="Buscar por placa o tipo de vehículo"
          />
        </label>
        <span className="vehicle-count">
          {error
            ? "No disponible"
            : cargando
              ? "Cargando…"
              : `${vehiculos.length} ${vehiculos.length === 1 ? "vehículo" : "vehículos"}`}
        </span>
      </div>

      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button className="text-button" onClick={cargarVehiculos}>Reintentar</button>
        </div>
      )}

      {cargando ? (
        <div className="empty-state">
          <span className="loading-indicator" aria-hidden="true" />
          <p>Cargando los vehículos del parqueadero…</p>
        </div>
      ) : !error && vehiculos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">P</span>
          <h3>El parqueadero está vacío</h3>
          <p>Registra el primer vehículo para comenzar a llevar el control de ingresos.</p>
          <Link className="button button-primary" to="/vehiculos/nuevo">Registrar vehículo</Link>
        </div>
      ) : !error && vehiculosFiltrados.length === 0 ? (
        <div className="empty-state compact-empty">
          <h3>No hay coincidencias</h3>
          <p>Prueba con otra placa o tipo de vehículo.</p>
        </div>
      ) : !error ? (
        <div className="vehicle-grid">
          {vehiculosFiltrados.map((vehiculo) => (
            <VehicleCard
              key={vehiculo.id || vehiculo.placa}
              vehiculo={vehiculo}
              onSalida={handleSalida}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
