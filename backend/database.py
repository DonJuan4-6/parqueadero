from motor.motor_asyncio import AsyncIOMotorClient
import os
import re

cliente = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
database = cliente[os.getenv("MONGODB_DATABASE", "parqueaderodatabase")]
coleccion = database[os.getenv("MONGODB_COLLECTION", "parqueadero")]


def _serializar_vehiculo(documento: dict) -> dict:
    vehiculo = dict(documento)
    vehiculo['id'] = str(vehiculo.pop('_id'))
    vehiculo['placa'] = vehiculo['placa'].strip().upper()
    return vehiculo


async def _buscar_documento_por_placa(placa: str):
    documento = await coleccion.find_one({'placa': placa})
    if documento:
        return documento
    return await coleccion.find_one({
        'placa': {
            '$regex': f'^{re.escape(placa)}$',
            '$options': 'i',
        }
    })


async def get_vehiculo_placa(placa: str):
    vehiculo = await _buscar_documento_por_placa(placa)
    return _serializar_vehiculo(vehiculo) if vehiculo else None


async def hora_ingreso(vehiculo):
    datos_vehiculo = dict(vehiculo)
    datos_vehiculo.pop('id', None)
    resultado = await coleccion.insert_one(datos_vehiculo)
    return {**datos_vehiculo, 'id': str(resultado.inserted_id)}


async def get_parqueadero():
    vehiculos = []
    cursor = coleccion.find({})
    async for document in cursor:
        vehiculos.append(_serializar_vehiculo(document))
    return vehiculos


async def actualizar_vehiculo(placa: str, datos_vehiculo: dict):
    documento = await _buscar_documento_por_placa(placa)
    if not documento:
        return None

    await coleccion.update_one({'_id': documento['_id']}, {'$set': datos_vehiculo})
    document = await coleccion.find_one({'_id': documento['_id']})
    return _serializar_vehiculo(document) if document else None


async def salida_vehiculo(placa: str):
    documento = await _buscar_documento_por_placa(placa)
    if not documento:
        return False
    resultado = await coleccion.delete_one({'_id': documento['_id']})
    return resultado.deleted_count > 0
