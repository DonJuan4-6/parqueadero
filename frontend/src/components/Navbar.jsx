import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="GetParking, inicio">
          GetParking
        </Link>
        <Link className="button button-primary header-action" to="/vehiculos/nuevo">
          Registrar vehículo
        </Link>
      </div>
    </header>
  );
}
