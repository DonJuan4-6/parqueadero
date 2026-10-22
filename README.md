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

Abre `http://localhost:5173`. El frontend consume `http://localhost:8000/api/parqueadero`; para cambiar esa dirección, copia `frontend/.env.example` a `frontend/.env` y ajusta `VITE_API_URL`.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/api/parqueadero` | Lista los vehículos dentro del parqueadero |
| `GET` | `/api/parqueadero/{placa}` | Consulta un vehículo por placa |
| `POST` | `/api/parqueadero` | Registra un ingreso |
| `PUT` | `/api/parqueadero/{placa}` | Actualiza un registro |
| `DELETE` | `/api/parqueadero/{placa}` | Registra la salida y retira el vehículo de la lista |

Los datos de un ingreso usan los campos `placa`, `tipo_vehiculo`, `hora_ingreso`, `pago_realizado` y `salida`. Las placas se almacenan en mayúscula y no se admiten duplicados entre los vehículos que están actualmente en el parqueadero.
