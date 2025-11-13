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
def get_user_profile(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    completed_missions = [
        cm.mission for cm in user.completed_missions
    ]

    upcoming_missions = db.query(models.Mission).filter(
        ~models.Mission.id.in_([cm.mission_id for cm in user.completed_missions])
    ).all()

    achievements = user.achievements

    return {
        "user": user,
        "completed_missions": completed_missions,
        "upcoming_missions": upcoming_missions,
        "achievements": achievements
    }


