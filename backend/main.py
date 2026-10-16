from fastapi import FastAPI
from router.vehiculos import vehiculo

app = FastAPI()

@app.get('/')
def welcome():
    return { 'message' : 'Bienvenido a GetParking' }

app.include_router(vehiculo)