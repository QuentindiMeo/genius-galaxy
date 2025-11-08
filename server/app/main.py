from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy import __version__ as sqlalchemy_version
from uvicorn import run

from typing import Any

app = FastAPI()

Json = dict[str, Any]

class Region(BaseModel):
    id: int
    name: str
    x: float
    y: float
    z: float

class GGUser(BaseModel):
    id: str
    higher_role: str
    region: int
    mentor_id: str | None
    date_joined: str
    region_rel: Region

class Mentorship(BaseModel):
    id: int
    mentor_id: str
    mentee_id: str
    status: str
    start_date: str
    end_date: str | None
    result: str | None
    notes: str | None

class Galaxy(BaseModel):
    regions: list[Region]
    users: list[GGUser]
    mentorships: list[Mentorship]

example_data: Json = {
  "regions": [
    {
      "id": 1,
      "name": "France",
      "x": 0.1,
      "y": -0.2,
      "z": 0.9
    }
  ],
  "users": [
    {
      "id": "019a5e02-3d4a-7d37-b42b-5a1bd879ba9f",
      "higher_role": "mentor",
      "region": 1,
      "mentor_id": None,
      "date_joined": "2025-10-10T12:00:00",
      "region_rel": {
        "id": 1,
        "name": "France",
        "x": 0.1,
        "y": -0.2,
        "z": 0.9
      }
    }
  ],
  "mentorships": [
    {
      "id": 1,
      "mentor_id": "019a5e02-3d4a-7d37-b42b-5a1bd879ba9f",
      "mentee_id": "019a5e02-5d37-7472-8f29-6a86d40c9774",
      "status": "active",
      "start_date": "2025-10-12T00:00:00",
      "end_date": None,
      "result": None,
      "notes": "Monthly meetings",
    }
  ]
}
galaxy = Galaxy(**example_data)

@app.get("/galaxy")
async def get_galaxy() -> Json:
    return galaxy.dict()

@app.get("/health")
async def health_check() -> Json:
    return {"status": "ok"}

@app.get("/")
async def root() -> Json:
    return {"message": "Hello World"}

if __name__ == "__main__":
    print(f"Running with SQLAlchemy version: {sqlalchemy_version}")
    run(app, host="0.0.0.0", port=8000)