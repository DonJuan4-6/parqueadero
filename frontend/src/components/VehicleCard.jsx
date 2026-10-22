import { Link } from "react-router-dom";

const tipoIcono = {
  moto: "M",
  carro: "C",
  camioneta: "C",
};

function formatHoraIngreso(value) {
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return value;
  return fecha.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function VehicleCard({ vehiculo, onSalida, onTogglePago, actualizandoPago }) {
  const icon = tipoIcono[vehiculo.tipo_vehiculo.toLowerCase()] || "V";

  return (
    <article className="vehicle-card">
      <Link
        className="vehicle-card-main"
        to={`/vehiculos/${encodeURIComponent(vehiculo.placa)}/editar`}
      >
        <div className="vehicle-card-top">
          <div className="vehicle-icon" aria-hidden="true">
            {icon}
          </div>
          <span className="vehicle-open-icon" aria-hidden="true">↗</span>
        </div>
        <div className="vehicle-identity">
          <p className="eyebrow">{vehiculo.tipo_vehiculo}</p>
          <h2>{vehiculo.placa}</h2>
        </div>
        <div className="vehicle-detail">
          <span className="detail-label">Hora de ingreso</span>
          <time dateTime={vehiculo.hora_ingreso}>{formatHoraIngreso(vehiculo.hora_ingreso)}</time>
        </div>
        <span className="vehicle-edit-hint">Editar registro <span aria-hidden="true">→</span></span>
      </Link>
      <div className="vehicle-card-status">
        <span className={`status-pill ${vehiculo.pago_realizado ? "status-paid" : "status-pending"}`}>
          <span className="status-dot" />
          {vehiculo.pago_realizado ? "Pago realizado" : "Pago pendiente"}
        </span>
        <button
          className={`payment-toggle ${vehiculo.pago_realizado ? "payment-toggle-paid" : ""}`}
          type="button"
          onClick={() => onTogglePago(vehiculo)}
          disabled={actualizandoPago}
          aria-label={vehiculo.pago_realizado ? "Marcar pago como pendiente" : "Marcar pago como realizado"}
          aria-pressed={vehiculo.pago_realizado}
          title={vehiculo.pago_realizado ? "Marcar como pendiente" : "Marcar como pagado"}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m8.5 12.5 2.3 2.3 4.8-5.1" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </button>
      </div>
      <div className="vehicle-card-actions">
        <button className="button button-exit" onClick={() => onSalida(vehiculo)}>
          Registrar salida
        </button>
      </div>
    </article>
  );
}
