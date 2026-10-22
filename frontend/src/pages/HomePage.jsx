import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VehicleList from "../components/VehicleList.jsx";
import {
  actualizarVehiculo,
  getVehiculos,
  mensajeError,
  registrarSalida,
} from "../api/vehiculos.js";

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [placaActualizandoPago, setPlacaActualizandoPago] = useState("");

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
    return vehiculos.filter(({ placa, tipo_vehiculo, pago_realizado }) => {
      const coincideBusqueda =
        !query ||
        placa.toLocaleLowerCase("es").includes(query) ||
        tipo_vehiculo.toLocaleLowerCase("es").includes(query);
      return coincideBusqueda && (!soloPendientes || !pago_realizado);
    });
  }, [busqueda, soloPendientes, vehiculos]);

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

  async function handleTogglePago(vehiculo) {
    setError("");
    setMensaje("");
    setPlacaActualizandoPago(vehiculo.placa);
    try {
      const actualizado = await actualizarVehiculo(vehiculo.placa, {
        pago_realizado: !vehiculo.pago_realizado,
      });
      setVehiculos((actuales) =>
        actuales.map((actual) =>
          actual.placa === actualizado.placa ? actualizado : actual,
        ),
      );
    } catch (requestError) {
      setError(mensajeError(requestError));
    } finally {
      setPlacaActualizandoPago("");
    }
  }

  const pagosPendientes = vehiculos.filter((vehiculo) => !vehiculo.pago_realizado).length;

  return (
    <section className="dashboard">
      <div className="list-toolbar">
        <label className="checkbox-field pending-filter">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(event) => setSoloPendientes(event.target.checked)}
            aria-label="Mostrar pagos pendientes"
          />
          <span className="custom-checkbox" aria-hidden="true" />
          <span>Pagos pendientes ({cargando || error ? "—" : pagosPendientes})</span>
        </label>
        <label className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar vehículo..."
            aria-label="Buscar vehículo por placa o tipo"
          />
        </label>
        <span className="vehicle-count">
          {error
            ? "No disponible"
            : cargando
              ? "Cargando…"
              : `${vehiculos.length} ${vehiculos.length === 1 ? "vehículo" : "vehículos"} dentro`}
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
          <p>Cargando vehículos…</p>
        </div>
      ) : !error && vehiculos.length === 0 ? (
        <div className="empty-state">
          <h2>No hay vehículos registrados</h2>
          <p>Registra el ingreso del primer vehículo al parqueadero.</p>
          <span className="empty-state-hint">Usa “Registrar vehículo” para comenzar.</span>
        </div>
      ) : !error && vehiculosFiltrados.length === 0 ? (
        <div className="empty-state compact-empty">
          <h2>No se encontraron vehículos</h2>
          <p>Cambia el texto de búsqueda o revisa los filtros.</p>
        </div>
      ) : !error ? (
        <VehicleList
          vehiculos={vehiculosFiltrados}
          onSalida={handleSalida}
          onTogglePago={handleTogglePago}
          placaActualizandoPago={placaActualizandoPago}
        />
      ) : null}
    </section>
  );
}
