from fastapi import APIRouter, HTTPException
from database import (
    get_vehiculo_placa,
    hora_ingreso,
    get_parqueadero,
    actualizar_vehiculo,
    salida_vehiculo,
)
from models import Vehiculos, UpdateVehiculos

vehiculo = APIRouter()


@vehiculo.get('/api/parqueadero', response_model=list[Vehiculos])
async def get_vehiculos():
    return await get_parqueadero()


@vehiculo.get('/api/parqueadero/{placa}', response_model=Vehiculos)
async def get_vehiculo(placa: str):
    resultado = await get_vehiculo_placa(placa.strip().upper())
    if resultado:
        return resultado
    raise HTTPException(404, f'El vehículo con placa {placa} no fue encontrado')


@vehiculo.post('/api/parqueadero', response_model=Vehiculos, status_code=201)
async def hora_ingreso_vehiculo(datos: Vehiculos):
    vehiculo_ingresado = await get_vehiculo_placa(datos.placa)
    if vehiculo_ingresado:
        raise HTTPException(
            status_code=409,
            detail=f'El vehículo con placa {datos.placa} ya se encuentra en el parqueadero',
        )

    datos_vehiculo = datos.model_dump(exclude={'id'})
    return await hora_ingreso(datos_vehiculo)


@vehiculo.put('/api/parqueadero/{placa}', response_model=Vehiculos)
async def actualizar_vehiculo_por_placa(placa: str, datos: UpdateVehiculos):
    placa = placa.strip().upper()
    cambios = datos.model_dump(exclude_unset=True, exclude={'id'})
    if not cambios:
        raise HTTPException(status_code=422, detail='Debes enviar al menos un campo para actualizar')

    if 'placa' in cambios and cambios['placa'] != placa:
        vehiculo_existente = await get_vehiculo_placa(cambios['placa'])
        if vehiculo_existente:
            raise HTTPException(
                status_code=409,
                detail=f'El vehículo con placa {cambios["placa"]} ya se encuentra en el parqueadero',
            )

    resultado = await actualizar_vehiculo(placa, cambios)
    if resultado:
        return resultado
    raise HTTPException(404, f'El vehículo con placa {placa} no fue encontrado')


@vehiculo.delete('/api/parqueadero/{placa}')
async def salida(placa: str):
    placa = placa.strip().upper()
    resultado = await salida_vehiculo(placa)
    if resultado:
        return {'message': f'El vehículo con placa {placa} ha salido'}
    raise HTTPException(404, f'El vehículo con placa {placa} no fue encontrado')
