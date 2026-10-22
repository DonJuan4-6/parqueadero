import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="GetParking, inicio">
          <span className="brand-mark" aria-hidden="true">
            G
          </span>
          <span>
            <strong>GetParking</strong>
            <small>ADMINISTRACIÓN</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Parqueadero
          </NavLink>
          <Link className="button button-primary header-action" to="/vehiculos/nuevo">
            <span aria-hidden="true">+</span>
            Registrar vehículo
          </Link>
        </nav>
      </div>
    </header>
  );
}
