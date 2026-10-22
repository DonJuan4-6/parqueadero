import VehicleCard from "./VehicleCard.jsx";

export default function VehicleList({
  vehiculos,
  onSalida,
  onTogglePago,
  placaActualizandoPago,
}) {
  return (
    <div className="vehicle-grid">
      {vehiculos.map((vehiculo) => (
        <VehicleCard
          key={vehiculo.id || vehiculo.placa}
          vehiculo={vehiculo}
          onSalida={onSalida}
          onTogglePago={onTogglePago}
          actualizandoPago={placaActualizandoPago === vehiculo.placa}
        />
      ))}
    </div>
  );
}
