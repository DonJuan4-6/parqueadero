from typing import Optional
from pydantic import BaseModel, Field, field_validator


class Vehiculos(BaseModel):
    id: Optional[str] = None
    placa: str = Field(min_length=3, max_length=10, pattern=r"^[A-Z0-9-]+$")
    tipo_vehiculo: str = Field(min_length=1)
    hora_ingreso: str = Field(min_length=1)
    pago_realizado: bool = False
    salida: str = "Pendiente"

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }

    @field_validator("placa", mode="before")
    @classmethod
    def normalize_placa(cls, value: str) -> str:
        return value.strip().upper() if isinstance(value, str) else value


class UpdateVehiculos(BaseModel):
    placa: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=10,
        pattern=r"^[A-Z0-9-]+$",
    )
    tipo_vehiculo: Optional[str] = Field(default=None, min_length=1)
    hora_ingreso: Optional[str] = Field(default=None, min_length=1)
    pago_realizado: Optional[bool] = None
    salida: Optional[str] = None

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }

    @field_validator("placa", mode="before")
    @classmethod
    def normalize_placa(cls, value: Optional[str]) -> Optional[str]:
        return value.strip().upper() if isinstance(value, str) else value
