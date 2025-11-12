from sqlalchemy.orm import Session
import models


def get_users(db: Session):
    return db.query(models.User).all()


def create_user(db: Session, name: str, region: str):
    user = models.User(name=name, region=region)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_missions(db: Session):
    return db.query(models.Mission).all()


def create_mission(db: Session, title: str, description: str, lat: str, lon: str, difficulty: str, date: str, tag: str):
    mission = models.Mission(
        title=title,
        description=description,
        category=tag,
        difficulty=difficulty,
        date=date,
        latitude=lat,
        longitude=lon,
        reward_points=10
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)
    return mission
