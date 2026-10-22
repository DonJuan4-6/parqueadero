import axios from "axios";

const api = axios.create({
  baseURL: (
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/parqueadero"
  ).replace(/\/+$/, ""),
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

export const getVehiculos = async () => (await api.get("")).data;
export const getVehiculo = async (placa) =>
  (await api.get(`/${encodeURIComponent(placa)}`)).data;
export const crearVehiculo = async (vehiculo) =>
  (await api.post("", vehiculo)).data;
export const actualizarVehiculo = async (placa, vehiculo) =>
  (await api.put(`/${encodeURIComponent(placa)}`, vehiculo)).data;
export const registrarSalida = async (placa) =>
  (await api.delete(`/${encodeURIComponent(placa)}`)).data;

export function mensajeError(error) {
  if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
    return "El servidor tardó demasiado en responder. Verifica que FastAPI y MongoDB estén activos e inténtalo de nuevo.";
  }
  if (axios.isAxiosError(error) && error.response?.data?.detail) {
    const { detail } = error.response.data;
    return Array.isArray(detail)
      ? detail.map((item) => item.msg).join(". ")
      : detail;
  }
  if (axios.isAxiosError(error) && !error.response) {
    return "No fue posible conectar con el servidor. Verifica que el backend esté activo.";
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
