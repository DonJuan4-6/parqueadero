import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.vehiculos import vehiculo

app = FastAPI()


origenes = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origen.strip() for origen in origenes if origen.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def welcome():
    return {'message': 'Bienvenido a GetParking'}

app.include_router(vehiculo)
