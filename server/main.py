from fastapi import FastAPI
from uvicorn import run

from typing import Any

app = FastAPI()

Json = dict[str, Any]

@app.get("/")
async def root() -> Json:
    return {"message": "Hello World"}

if __name__ == "__main__":
    run(app, host="0.0.0.0", port=8000)