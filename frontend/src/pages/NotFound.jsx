import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="empty-state not-found">
      <span className="eyebrow">404</span>
      <h1>No encontramos esta página</h1>
      <p>El enlace puede haber cambiado o no estar disponible.</p>
      <Link className="button button-primary" to="/">Volver al parqueadero</Link>
    </section>
  );
}
