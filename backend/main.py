from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models, crud
from schemas import ProfileSchema, UserSchema, MissionSchema

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Max bot backend")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Max bot backend API is running!"}


@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    return crud.get_users(db)


@app.post("/users")
def add_user(name: str, region: str, db: Session = Depends(get_db)):
    return crud.create_user(db, name, region)


@app.get("/missions")
def list_missions(db: Session = Depends(get_db)):
    return crud.get_missions(db)


@app.post("/missions")
def add_mission(title: str, description: str, lat: str, lon: str, difficulty: str, date: str, tag: str, db: Session = Depends(get_db)):
    return crud.create_mission(db, title, description, lat, lon, difficulty, date, tag)


@app.post("/users/{user_id}/add_water")
def add_water(user_id: int, amount: int, db: Session = Depends(get_db)):
    user = db.query(models.User).get(user_id)
    if not user:
        return {"error": "User not found"}
    user.water_drops += amount
    if user.water_drops >= 100:
        user.level += 1
        user.water_drops = 0
    db.commit()
    return {"id": user.id, "level": user.level, "water_drops": user.water_drops}


@app.get("/api/profile/{user_id}", response_model=ProfileSchema)
def get_profile(user_id: int):
    user = UserSchema(
        id=user_id,
        name="Alice",
        region="Москва",
        total_points=120,
        water_drops=45,
        level=3
    )

    completed = [
        MissionSchema(
            id=1,
            title="Посади дерево",
            description="Помоги в парке",
            category="Экология",
            difficulty="Средняя",
            date="2025-11-20T10:00:00",
            latitude=55.75,
            longitude=37.61,
            reward_points=10
        )
    ]

    return {
        "user": user,
        "completed_missions": completed,
        "upcoming_missions": [],
        "achievements": []
    }

@app.get("/users/{user_id}/profile", response_model=ProfileSchema)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    profile_data = crud.get_user_profile(db, user_id)
    if not profile_data:
        return {"error": "User not found"}

    return profile_data