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

export default function VehicleCard({ vehiculo, onSalida }) {
  const icon = tipoIcono[vehiculo.tipo_vehiculo.toLowerCase()] || "V";

  return (
    <article className="vehicle-card">
      <div className="vehicle-card-top">
        <div className="vehicle-icon" aria-hidden="true">
          {icon}
        </div>
        <span className={`status-pill ${vehiculo.pago_realizado ? "status-paid" : "status-pending"}`}>
          <span className="status-dot" />
          {vehiculo.pago_realizado ? "Pago realizado" : "Pago pendiente"}
        </span>
      </div>
      <div className="vehicle-identity">
        <p className="eyebrow">{vehiculo.tipo_vehiculo}</p>
        <h2>{vehiculo.placa}</h2>
      </div>
      <div className="vehicle-detail">
        <span className="detail-label">Hora de ingreso</span>
        <time dateTime={vehiculo.hora_ingreso}>{formatHoraIngreso(vehiculo.hora_ingreso)}</time>
      </div>
      <div className="vehicle-card-actions">
        <Link
          className="button button-secondary"
          to={`/vehiculos/${encodeURIComponent(vehiculo.placa)}/editar`}
        >
          Editar registro
        </Link>
        <button className="button button-exit" onClick={() => onSalida(vehiculo)}>
          Registrar salida
        </button>
      </div>
    </article>
  );
}
