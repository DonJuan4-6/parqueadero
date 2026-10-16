from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database import (
    get_vehiculo_placa,
    hora_ingreso,
    get_parqueadero,
    actualizar_vehiculo,
    salida_vehiculo,
)
from models import Vehiculos, UpdateVehiculos

vehiculo = APIRouter()

#METODOS CRUD
@vehiculo.get('/api/parqueadero')
async def get_vehiculos():
    return await get_parqueadero()

@vehiculo.get('/api/parqueadero/{placa}', response_model=Vehiculos)
async def get_vehiculo(placa: str):
    vehiculo = await get_vehiculo_placa(placa)
    if vehiculo:
        return vehiculo
    raise HTTPException(404, f'El vehiculo con placa {placa} no fue encontrado')

@vehiculo.post('/api/parqueadero', response_model=Vehiculos)
async def hora_ingreso_vehiculo(vehiculos: Vehiculos):
    if vehiculos.placa is not None:
        vehiculo_ingresado = await get_vehiculo_placa(vehiculos.placa)
        if vehiculo_ingresado:
            raise HTTPException(status_code=400, detail="El vehiculo ya se encuentra en el parqueadero")

    dict_vehiculo = vehiculos.model_dump(exclude={'id'})
    responsive = await hora_ingreso(dict_vehiculo)
    return responsive

@vehiculo.put('/api/parqueadero/{placa}', response_model=Vehiculos)
async def actualizar_vehiculo_por_placa(placa: str, vehiculos: Vehiculos):
    response = await actualizar_vehiculo(placa, vehiculos)
    if response:
        return response
    raise HTTPException(404, f'Vehiculo de placa {placa} no fue encontrado')

@vehiculo.delete('/api/parqueadero/{placa}')
async def salida(placa: str):
    response = await salida_vehiculo(placa)
    if response:
        return {'message': f'El vehiculo con placa {placa} ha salido'}
    raise HTTPException(404, f'Vehiculo de placa {placa} no encontrado')
