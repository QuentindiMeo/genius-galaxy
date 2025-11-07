from fastapi import FastAPI
from uvicorn import run
from sqlalchemy import __version__ as sqlalchemy_version

from typing import Any

app = FastAPI()

Json = dict[str, Any]

@app.get("/")
async def root() -> Json:
    return {"message": "Hello World"}

if __name__ == "__main__":
    print(f"Running with SQLAlchemy version: {sqlalchemy_version}")
    run(app, host="0.0.0.0", port=8000)