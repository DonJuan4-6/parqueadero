import unittest
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from models import UpdateVehiculos, Vehiculos
from router import vehiculos as rutas


class VehiculosModelTest(unittest.TestCase):
    def test_normaliza_placa_y_aplica_valores_iniciales(self):
        vehiculo = Vehiculos(
            placa=" abc123 ",
            tipo_vehiculo="Carro",
            hora_ingreso="2026-10-20T08:00:00Z",
        )

        self.assertEqual(vehiculo.placa, "ABC123")
        self.assertFalse(vehiculo.pago_realizado)
        self.assertEqual(vehiculo.salida, "Pendiente")

    def test_rechaza_placa_invalida(self):
        with self.assertRaises(ValueError):
            Vehiculos(
                placa="AB 123",
                tipo_vehiculo="Carro",
                hora_ingreso="2026-10-20T08:00:00Z",
            )

    def test_normaliza_placa_en_actualizacion(self):
        self.assertEqual(UpdateVehiculos(placa=" xy9 ").placa, "XY9")


class VehiculosRoutesTest(unittest.IsolatedAsyncioTestCase):
    async def test_registra_vehiculo_con_placa_normalizada(self):
        datos = Vehiculos(
            placa=" abc123 ",
            tipo_vehiculo="Carro",
            hora_ingreso="2026-10-20T08:00:00Z",
        )
        with (
            patch.object(rutas, "get_vehiculo_placa", new=AsyncMock(return_value=None)),
            patch.object(
                rutas,
                "hora_ingreso",
                new=AsyncMock(return_value={"id": "1", **datos.model_dump(exclude={"id"})}),
            ) as insertar,
        ):
            resultado = await rutas.hora_ingreso_vehiculo(datos)

        self.assertEqual(resultado["placa"], "ABC123")
        insertar.assert_awaited_once()
        self.assertEqual(insertar.await_args.args[0]["placa"], "ABC123")

    async def test_rechaza_placa_ya_en_parqueadero(self):
        datos = Vehiculos(
            placa="ABC123",
            tipo_vehiculo="Carro",
            hora_ingreso="2026-10-20T08:00:00Z",
        )
        with patch.object(
            rutas,
            "get_vehiculo_placa",
            new=AsyncMock(return_value={"placa": "ABC123"}),
        ):
            with self.assertRaises(HTTPException) as error:
                await rutas.hora_ingreso_vehiculo(datos)

        self.assertEqual(error.exception.status_code, 400)

    async def test_actualiza_solo_los_campos_enviados(self):
        cambio = UpdateVehiculos(tipo_vehiculo="Moto")
        esperado = {
            "id": "1",
            "placa": "ABC123",
            "tipo_vehiculo": "Moto",
            "hora_ingreso": "2026-10-20T08:00:00Z",
            "pago_realizado": False,
            "salida": "Pendiente",
        }
        with patch.object(
            rutas,
            "actualizar_vehiculo",
            new=AsyncMock(return_value=esperado),
        ) as actualizar:
            resultado = await rutas.actualizar_vehiculo_por_placa("abc123", cambio)

        self.assertEqual(resultado, esperado)
        actualizar.assert_awaited_once_with("ABC123", {"tipo_vehiculo": "Moto"})

    async def test_registra_salida_eliminando_vehiculo_activo(self):
        with patch.object(
            rutas, "salida_vehiculo", new=AsyncMock(return_value=True)
        ) as salida:
            resultado = await rutas.salida(" abc123 ")

        self.assertEqual(resultado["message"], "El vehículo con placa ABC123 ha salido")
        salida.assert_awaited_once_with("ABC123")


if __name__ == "__main__":
    unittest.main()
