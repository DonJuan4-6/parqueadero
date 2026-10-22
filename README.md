# GetParking

Aplicación de gestión de parqueadero basada en la pila FARM: FastAPI, React y MongoDB. Permite registrar ingresos, consultar vehículos, actualizar su tipo y estado de pago, y registrar su salida.

## Requisitos

- Python 3.10 o superior
- Node.js y npm
- MongoDB en ejecución, de forma local o accesible por URL

## Backend

Desde la raíz del proyecto, crea y activa un entorno virtual e instala las dependencias:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Opcionalmente, define las variables de conexión y CORS del archivo `backend/.env.example` en el entorno del sistema. Los valores predeterminados apuntan a MongoDB local en `mongodb://localhost:27017`, a la base `parqueaderodatabase` y a la colección `parqueadero`.

Inicia la API desde la carpeta `backend`:

```powershell
uvicorn main:app --reload
```

La API y su documentación interactiva estarán disponibles en `http://localhost:8000` y `http://localhost:8000/docs`.

## Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. El frontend consume `http://127.0.0.1:8000/api/parqueadero`; para cambiar esa dirección, copia `frontend/.env.example` a `frontend/.env` y ajusta `VITE_API_URL`.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/api/parqueadero` | Lista los vehículos dentro del parqueadero |
| `GET` | `/api/parqueadero/{placa}` | Consulta un vehículo por placa |
| `POST` | `/api/parqueadero` | Registra un ingreso |
| `PUT` | `/api/parqueadero/{placa}` | Actualiza un registro |
| `DELETE` | `/api/parqueadero/{placa}` | Registra la salida y retira el vehículo de la lista |

Los datos de un ingreso usan los campos `placa`, `tipo_vehiculo`, `hora_ingreso`, `pago_realizado` y `salida`. Las placas se almacenan en mayúscula y no se admiten duplicados entre los vehículos que están actualmente en el parqueadero.

Para registrar un vehículo en Thunder Client, selecciona el método `POST`, utiliza la URL `http://127.0.0.1:8000/api/parqueadero` (sin agregar la placa a la ruta) y envía un cuerpo JSON:

```json
{
  "placa": "KMD-445",
  "tipo_vehiculo": "Carro",
  "hora_ingreso": "2026-10-22T11:20:00",
  "pago_realizado": true,
  "salida": "El vehículo puede salir"
}
```

Si esa placa ya está registrada dentro del parqueadero, la API responde `400 Bad Request`. La ruta `/api/parqueadero/{placa}` se utiliza para consultar (`GET`), actualizar (`PUT`) o registrar la salida (`DELETE`); no para crear (`POST`) un ingreso.
