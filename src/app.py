from fastapi import FastAPI
from src.utils import get_version

app = FastAPI(title="DevSecOps Demo API")

@app.get("/")
def root():
    return {"message": "Hello DevSecOps", "version": get_version()}

@app.get("/health")
def health():
    return {"status": "ok"}
