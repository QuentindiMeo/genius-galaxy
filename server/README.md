server/
├── pyproject.toml
├── alembic.ini
├── .env
├── README.md
│
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── <timestamp>_init_db.py
│
└── app/
    ├── __init__.py
    ├── main.py
    │
    ├── core/               # Configuration and setup
    │   ├── __init__.py
    │   ├── config.py       # Settings (reads from .env)
    │   ├── db.py           # SQLAlchemy engine/session setup
    │   └── security.py     # Password hashing, JWT utils (optional)
    │
    ├── models/             # SQLAlchemy models
    │   ├── __init__.py
    │   └── user.py
    │
    ├── schemas/            # Pydantic schemas
    │   ├── __init__.py
    │   └── user.py
    │
    ├── crud/               # CRUD operations using SQLAlchemy ORM
    │   ├── __init__.py
    │   └── user.py
    │
    ├── api/                # FastAPI routes
    │   ├── __init__.py
    │   ├── deps.py         # Common dependencies (e.g. DB session)
    │   ├── v1/
    │   │   ├── __init__.py
    │   │   └── user.py
    │   └── router.py       # Combines all sub-routers
    │
    ├── tests/
    │   └── test_user.py
    │
    └── utils/
        └── __init__.py
