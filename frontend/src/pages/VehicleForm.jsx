import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  actualizarVehiculo,
  crearVehiculo,
  getVehiculo,
  mensajeError,
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

  if (cargando) {
    return <div className="form-loading"><span className="loading-indicator" />Cargando el registro…</div>;
  }

  if (esEdicion && error && !formulario.placa) {
    return (
      <section className="form-page">
        <Link className="back-link" to="/">← Volver al parqueadero</Link>
        <div className="alert alert-error" role="alert">{error}</div>
        <Link className="button button-secondary" to="/">Volver a la lista</Link>
      </section>
    );
  }

  return (
    <section className="form-page">
      <Link className="back-link" to="/">← Volver al parqueadero</Link>
      <div className="form-heading">
        <span className="eyebrow">REGISTRO DE VEHÍCULO</span>
        <h1>{esEdicion ? "Editar ingreso" : "Registrar ingreso"}</h1>
        <p>
          {esEdicion
            ? "Actualiza los datos del vehículo y el estado del pago."
            : "Ingresa los datos del vehículo que acaba de llegar."}
        </p>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="form-section-title">
          <span className="form-section-number">01</span>
          <div>
            <h2>Datos del vehículo</h2>
            <p>La placa identifica este registro en el parqueadero.</p>
          </div>
        </div>

        <div className="form-fields">
          <label className="field">
            <span>Placa <span className="required-mark">*</span></span>
            <input
              name="placa"
              value={formulario.placa}
              onChange={handleChange}
              placeholder="Ej. ABC123"
              minLength={3}
              maxLength={10}
              pattern="[A-Za-z0-9-]+"
              title="Usa letras, números o guiones."
              autoComplete="off"
              required
              disabled={esEdicion}
            />
            <small>Entre 3 y 10 caracteres, sin espacios.</small>
          </label>

          <label className="field">
            <span>Tipo de vehículo <span className="required-mark">*</span></span>
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
            <span>Hora de ingreso <span className="required-mark">*</span></span>
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
              <small>Marca esta opción si el servicio ya fue pagado.</small>
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
            {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Registrar vehículo"}
          </button>
        </div>
      </form>
    </section>
  );
}
