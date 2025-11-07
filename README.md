# GG howto

## Stack technique

front : Next 15 avec TypeScript - react-three-fiber & d3-force-3d - zustand pour le stage management - tailwind - Redis ? (caching et màj en temps réel)  
back : Python 3.14 avec FastAPI + SQLAlchemy (+ Alembic migrations) et Pydantic -> DB Postgre  
auth : Next Auth.js + session cookie FastAPI - OAuth Genius  
roles : admin - operator - mentor - mentee - guest \[role request via email sent to all operators+]  
data models: users (id=Genius,highest\_role,region'FK'regions.name,mentor\_id'FK'users.id,joined\_gg), regions (id,name,xyz), mentorships (mentor\_id,mentee\_id,status,start\_date,end\_date,result,notes)  
status = statut du mentorat \[discussion, reconnaissance, phase 1-2-3, validation, succès, abandon] ; result = état à date \[a le rôle, a été démis rapidement, a été démis, a demandé sa démission, n'a jamais eu rôle]  
deployment: Vercel (Next.js) + Railway (FastAPI + PostgreSQL), Supabase, Cloudflare + domain

## features

* 3D visualization (mentor nodes + mentee orbits)  
* Pan/zoom/rotate interactions  
* Click a mentor node → open side panel with profile, mentoring stats, etc.  
* Smooth transitions between communities (e.g. click “France” → fly camera to the French cluster)  
* Update on demand with "Refresh" button → no need for real-time

## routes

GET /graph → returns all mentors/mentees grouped by region  
POST /user → create a new user  
PATCH /user/:id → update mentorship relation  
GET /user/:id → detailed info  
GET /regions → list of all regions  

---

## MVP

### 1️⃣ Core data + admin

Build FastAPI + PostgreSQL models for users & mentorships  
Add simple Next.js dashboard (admin-only) to add mentors/mentees

### 2️⃣ 3D visualization

Use react-three-fiber to render mentors as glowing points  
Position mentees orbiting their mentors  
Use d3-force-3d to cluster by region

### 3️⃣ Authentication & roles

Add NextAuth  
Different dashboards for mentors/mentees

### 4️⃣ Polish & deployment

TBD

---

## 🧩 SQLAlchemy Data Model Sketch

```py
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Float,
    Enum,
    Text,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column, declarative_base

Base = declarative_base()

# Optional: define mentorship status/result enums for clarity
from enum import Enum as PyEnum

class MentorshipStatus(PyEnum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    PENDING = "pending"

class MentorshipResult(PyEnum):
    SUCCESS = "success"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"
    UNKNOWN = "unknown"


# ========================
# REGION MODEL
# ========================
class Region(Base):
    __tablename__ = "regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    z: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="region_rel")

    def __repr__(self):
        return f"<Region(name={self.name})>"


# ========================
# USER MODEL
# ========================
class User(Base):
    __tablename__ = "users"

    # OAuth ID from Genius.com
    id: Mapped[str] = mapped_column(String(100), primary_key=True)

    higher_role: Mapped[str] = mapped_column(String(50), nullable=False)
    date_joined: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Region relationship
    region_name: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("regions.name", ondelete="SET NULL"),
        nullable=True,
    )

    region_rel: Mapped[Optional["Region"]] = relationship("Region", back_populates="users")

    # Self-referential mentor relationship
    mentor_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    mentor: Mapped[Optional["User"]] = relationship(
        "User",
        remote_side=[id],
        back_populates="mentees",
    )

    mentees: Mapped[list["User"]] = relationship(
        "User",
        back_populates="mentor",
        cascade="all, delete-orphan",
    )

    # Mentorship relationships (see below)
    mentor_links: Mapped[list["Mentorship"]] = relationship(
        "Mentorship",
        back_populates="mentor",
        foreign_keys="[Mentorship.mentor_id]",
    )
    mentee_links: Mapped[list["Mentorship"]] = relationship(
        "Mentorship",
        back_populates="mentee",
        foreign_keys="[Mentorship.mentee_id]",
    )

    def __repr__(self):
        return f"<User(id={self.id}, role={self.higher_role}, region={self.region_name})>"


# ========================
# MENTORSHIP MODEL
# ========================
class Mentorship(Base):
    __tablename__ = "mentorships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    mentor_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    mentee_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    status: Mapped[MentorshipStatus] = mapped_column(
        Enum(MentorshipStatus), default=MentorshipStatus.PENDING, nullable=False
    )

    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    result: Mapped[Optional[MentorshipResult]] = mapped_column(
        Enum(MentorshipResult), default=MentorshipResult.UNKNOWN, nullable=True
    )

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    mentor: Mapped["User"] = relationship(
        "User", foreign_keys=[mentor_id], back_populates="mentor_links"
    )
    mentee: Mapped["User"] = relationship(
        "User", foreign_keys=[mentee_id], back_populates="mentee_links"
    )

    def __repr__(self):
        return f"<Mentorship(mentor={self.mentor_id}, mentee={self.mentee_id}, status={self.status})>"
```

### ✅ Example usage

```py
# Create a region
france = Region(name="France", x=1.0, y=2.0, z=3.0)

# Create mentor and mentee
mentor = User(id="genius_123", higher_role="mentor", region_rel=france)
mentee = User(id="genius_456", higher_role="mentee", region_rel=france, mentor=mentor)

# Create mentorship link
mentorship = Mentorship(
    mentor=mentor,
    mentee=mentee,
    status=MentorshipStatus.ACTIVE,
    start_date=datetime.utcnow(),
)

session.add_all([france, mentor, mentee, mentorship])
session.commit()
```

---

## 🧱 Pydantic Models (for FastAPI)

```py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ENUM SYNC
class MentorshipStatusEnum(str, Enum):
    active = "active"
    completed = "completed"
    abandoned = "abandoned"


# ---- REGION SCHEMAS ----
class RegionBase(BaseModel):
    name: str
    x: float
    y: float
    z: float


class RegionCreate(RegionBase):
    pass


class RegionRead(RegionBase):
    id: int

    class Config:
        orm_mode = True


# ---- USER SCHEMAS ----
class UserBase(BaseModel):
    id: str
    higher_role: Optional[str] = None
    region: Optional[int] = None
    mentor_id: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    date_joined: datetime
    region_rel: Optional[RegionRead] = None

    class Config:
        orm_mode = True


# ---- MENTORSHIP SCHEMAS ----
class MentorshipBase(BaseModel):
    mentor_id: str
    mentee_id: str
    status: MentorshipStatusEnum
    start_date: datetime
    end_date: Optional[datetime] = None
    result: Optional[str] = None
    notes: Optional[str] = None


class MentorshipCreate(BaseModel):
    mentor_id: str
    mentee_id: str
    status: Optional[MentorshipStatusEnum] = MentorshipStatusEnum.active
    start_date: Optional[datetime] = None
    notes: Optional[str] = None


class MentorshipRead(MentorshipBase):
    id: int
    mentor: Optional[UserRead] = None
    mentee: Optional[UserRead] = None

    class Config:
        orm_mode = True
```

## ✅ Example: /graph Endpoint Output

```py
{
  "regions": [
    {
      "id": 1,
      "name": "France",
      "x": 0.23,
      "y": -0.18,
      "z": 0.95,
      "users": [
        {"id": "12345", "higher_role": "mentor", "region": 1, "mentor_id": None},
        {"id": "67890", "higher_role": "mentee", "region": 1, "mentor_id": "12345"}
      ]
    }
  ],
  "mentorships": [
    {
      "id": 12,
      "mentor_id": "12345",
      "mentee_id": "67890",
      "status": "active",
      "start_date": "2025-10-10T12:00:00Z",
      "notes": "Meeting monthly to review progress."
    }
  ]
}
```

### `routers/graph.py`

```py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any
from app.database import SessionLocal
from app.models import User, Region, Mentorship
from app.schemas import RegionRead, UserRead, MentorshipRead

router = APIRouter()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/graph")
def get_graph(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns a structured snapshot of the mentorship network:
    {
        "regions": [...],
        "users": [...],
        "mentorships": [...]
    }
    """

    # Preload relationships to avoid lazy-loading
    regions = db.query(Region).options(joinedload(Region.users)).all()
    users = db.query(User).options(
        joinedload(User.region_rel),
        joinedload(User.mentor),
        joinedload(User.mentees)
    ).all()
    mentorships = db.query(Mentorship).options(
        joinedload(Mentorship.mentor),
        joinedload(Mentorship.mentee)
    ).all()

    # Serialize using Pydantic
    region_data = [RegionRead.from_orm(r).dict() for r in regions]
    user_data = [UserRead.from_orm(u).dict() for u in users]
    mentorship_data = [MentorshipRead.from_orm(m).dict() for m in mentorships]

    return {
        "regions": region_data,
        "users": user_data,
        "mentorships": mentorship_data
    }
```

### ✅ Example API response

```json
{
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
      "id": "oauth_123",
      "higher_role": "mentor",
      "region": 1,
      "mentor_id": null,
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
      "mentor_id": "oauth_123",
      "mentee_id": "oauth_456",
      "status": "active",
      "start_date": "2025-10-12T00:00:00",
      "end_date": null,
      "result": null,
      "notes": "Monthly meetings",
      "mentor": { "id": "oauth_123", "region": 1, "higher_role": "mentor", "mentor_id": null, "date_joined": "2025-10-10T12:00:00" },
      "mentee": { "id": "oauth_456", "region": 1, "higher_role": "mentee", "mentor_id": "oauth_123", "date_joined": "2025-10-11T12:00:00" }
    }
  ]
}
```
