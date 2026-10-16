from motor.motor_asyncio import AsyncIOMotorClient
from models import Vehiculos, UpdateVehiculos
from bson import ObjectId

cliente = AsyncIOMotorClient('mongodb://localhost')
database = cliente.parqueaderodatabase
coleccion = database.parqueadero

def _serializar_vehiculo(documento):
    vehiculo = dict(documento)
    vehiculo['id'] = str(vehiculo.pop('_id'))
    return vehiculo

async def get_vehiculo_placa(placa: str):
    vehiculo = await coleccion.find_one({'placa': placa})
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
        vehiculos.append(Vehiculos(**_serializar_vehiculo(document)))
    return vehiculos

async def actualizar_vehiculo(placa: str, vehiculo: Vehiculos):
    datos_vehiculo = vehiculo.model_dump(exclude={'id'})
    await coleccion.update_one({'placa': placa}, {'$set': datos_vehiculo})
    document = await coleccion.find_one({'placa': placa})

    if document:
        document['_id'] = str(document['_id'])
    return _serializar_vehiculo(document) if document else None

async def salida_vehiculo(placa:str):
    resultado = await coleccion.delete_one({'placa': placa})
    return resultado.deleted_count > 0
