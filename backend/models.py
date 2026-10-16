from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, Annotated

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if v is not None else v)]

class Vehiculos(BaseModel):
    id: Optional[str] = None
    placa: Optional[str] = None
    tipo_vehiculo: str
    hora_ingreso: str
    pago_realizado: bool
    salida: str

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "json_encoders": {object: str}
    }


class UpdateVehiculos(BaseModel):
    placa: Optional[str]= None
    tipo_vehiculo: Optional[str]= None
    hora_ingreso: Optional[str]= None

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
        "json_encoders": {object: str}
    }

