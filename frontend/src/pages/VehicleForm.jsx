import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  actualizarVehiculo,
  crearVehiculo,
  getVehiculo,
  mensajeError,
  registrarSalida,
} from "../api/vehiculos.js";

const fechaLocal = () => {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

const fechaParaInput = (fecha) => {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "";
  return new Date(valor.getTime() - valor.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

const formularioInicial = () => ({
  placa: "",
  tipo_vehiculo: "Carro",
  hora_ingreso: fechaLocal(),
  pago_realizado: false,
  salida: "Pendiente",
});

export default function VehicleForm() {
  const { placa } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(placa);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [registrandoSalida, setRegistrandoSalida] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!esEdicion) return undefined;
    let vigente = true;

    getVehiculo(placa)
      .then((vehiculo) => {
        if (vigente) {
          setFormulario({
            ...vehiculo,
            hora_ingreso: fechaParaInput(vehiculo.hora_ingreso),
          });
        }
      })
      .catch((requestError) => {
        if (vigente) setError(mensajeError(requestError));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [esEdicion, placa]);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;
    setFormulario((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setGuardando(true);

    const datos = {
      ...formulario,
      placa: formulario.placa.trim().toUpperCase(),
      hora_ingreso: new Date(formulario.hora_ingreso).toISOString(),
    };

    try {
      if (esEdicion) {
        await actualizarVehiculo(placa, datos);
      } else {
        await crearVehiculo(datos);
      }
      navigate("/", {
        state: {
          mensaje: esEdicion
            ? `Se actualizó el registro de ${datos.placa}.`
            : `Se registró el ingreso de ${datos.placa}.`,
        },
      });
    } catch (requestError) {
      setError(mensajeError(requestError));
    } finally {
      setGuardando(false);
    }
  }

  async function handleSalida() {
    const confirmacion = window.confirm(
      `¿Confirmas la salida del vehículo ${formulario.placa}? El registro se retirará del parqueadero.`,
    );
    if (!confirmacion) return;

    setError("");
    setRegistrandoSalida(true);
    try {
      await registrarSalida(formulario.placa);
      navigate("/", {
        state: { mensaje: `Se registró la salida de ${formulario.placa}.` },
      });
    } catch (requestError) {
      setError(mensajeError(requestError));
    } finally {
      setRegistrandoSalida(false);
    }
  }

  if (cargando) {
    return <div className="form-loading"><span className="loading-indicator" />Cargando el registro…</div>;
  }

  if (esEdicion && error && !formulario.placa) {
    return (
      <section className="form-page">
        <Link className="back-link" to="/">← Volver al parqueadero</Link>
        <div className="vehicle-form">
          <div className="form-heading">
            <h1>No se pudo cargar el vehículo</h1>
          </div>
          <div className="alert alert-error" role="alert">{error}</div>
          <Link className="button button-secondary" to="/">Volver a la lista</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="form-page">
      <Link className="back-link" to="/">← Volver al parqueadero</Link>
      <div className="form-content">
        <form className="vehicle-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h1>{esEdicion ? "Actualizar vehículo" : "Registrar vehículo"}</h1>
            <p>
              {esEdicion
                ? "Actualiza los datos del ingreso y del pago."
                : "Ingresa los datos del vehículo que acaba de llegar."}
            </p>
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <div className="form-fields">
            <label className="field">
              <span className="sr-only">Placa</span>
              <input
                name="placa"
                value={formulario.placa}
                onChange={handleChange}
                placeholder="Placa (ej. ABC123)"
                minLength={3}
                maxLength={10}
                pattern="[A-Za-z0-9-]+"
                title="Usa letras, números o guiones."
                autoComplete="off"
                required
                disabled={esEdicion}
              />
            </label>

            <label className="field">
              <span className="sr-only">Tipo de vehículo</span>
              <select
                name="tipo_vehiculo"
                value={formulario.tipo_vehiculo}
                onChange={handleChange}
                required
              >
                {!["Carro", "Moto", "Camioneta", "Otro"].includes(formulario.tipo_vehiculo) && (
                  <option>{formulario.tipo_vehiculo}</option>
                )}
                <option>Carro</option>
                <option>Moto</option>
                <option>Camioneta</option>
                <option>Otro</option>
              </select>
            </label>

            <label className="field">
              <span className="sr-only">Hora de ingreso</span>
              <input
                type="datetime-local"
                name="hora_ingreso"
                value={formulario.hora_ingreso}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="payment-control">
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="pago_realizado"
                checked={formulario.pago_realizado}
                onChange={handleChange}
              />
              <span className="custom-checkbox" aria-hidden="true" />
              <span>
                <strong>Pago realizado</strong>
              </span>
            </label>
            <span className={`status-pill ${formulario.pago_realizado ? "status-paid" : "status-pending"}`}>
              <span className="status-dot" />
              {formulario.pago_realizado ? "Al día" : "Pendiente"}
            </span>
          </div>

          <div className="form-actions">
            <Link className="button button-secondary" to="/">Cancelar</Link>
            <button className="button button-primary" type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : esEdicion ? "Actualizar vehículo" : "Crear ingreso"}
            </button>
          </div>
        </form>
        {esEdicion && (
          <button
            className="button button-exit exit-form-button"
            type="button"
            onClick={handleSalida}
            disabled={registrandoSalida}
          >
            {registrandoSalida ? "Registrando salida…" : "Registrar salida"}
          </button>
        )}
      </div>
    </section>
  );
}
