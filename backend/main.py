from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from routes import user, reservation

# Création des tables dans la base de données
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Secure Reservation App API")

# Configuration CORS pour permettre au frontend d'appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En production, spécifier l'URL du frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(user.router, tags=["Users"])
app.include_router(reservation.router, prefix="/reservations", tags=["Reservations"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Secure Reservation App API"}
