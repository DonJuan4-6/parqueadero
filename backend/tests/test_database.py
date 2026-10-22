import re
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import database


class MemoryCollection:
    def __init__(self):
        self.document = {
            "_id": "legacy-id",
            "placa": "abc123",
            "tipo_vehiculo": "Carro",
            "hora_ingreso": "2026-10-20T08:00:00Z",
            "pago_realizado": False,
            "salida": "Pendiente",
        }

    async def find_one(self, query):
        if "_id" in query:
            return self.document if query["_id"] == self.document["_id"] else None
        if isinstance(query.get("placa"), str):
            return self.document if query["placa"] == self.document["placa"] else None

        filtro = query.get("placa", {})
        if re.fullmatch(filtro.get("$regex", ""), self.document["placa"], re.IGNORECASE):
            return self.document
        return None

    async def update_one(self, query, update):
        if query["_id"] == self.document["_id"]:
            self.document.update(update["$set"])

    async def delete_one(self, query):
        if query["_id"] == self.document["_id"]:
            self.document = None
            return SimpleNamespace(deleted_count=1)
        return SimpleNamespace(deleted_count=0)


class DatabaseLegacyPlateTest(unittest.IsolatedAsyncioTestCase):
    async def test_consulta_registro_legacy_sin_distinguir_mayusculas(self):
        coleccion = MemoryCollection()
        with patch.object(database, "coleccion", coleccion):
            resultado = await database.get_vehiculo_placa("ABC123")

        self.assertEqual(resultado["placa"], "ABC123")
        self.assertEqual(resultado["id"], "legacy-id")

    async def test_actualiza_y_elimina_registro_legacy_por_id(self):
        coleccion = MemoryCollection()
        with patch.object(database, "coleccion", coleccion):
            actualizado = await database.actualizar_vehiculo(
                "ABC123",
                {"placa": "XYZ789", "pago_realizado": True},
            )
            eliminado = await database.salida_vehiculo("XYZ789")

        self.assertEqual(actualizado["placa"], "XYZ789")
        self.assertTrue(actualizado["pago_realizado"])
        self.assertTrue(eliminado)
        self.assertIsNone(coleccion.document)


if __name__ == "__main__":
    unittest.main()
