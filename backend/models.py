from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    region = Column(String)
    water_drops = Column(Integer, default=20)
    level = Column(Integer, default=1)
    total_points = Column(Integer, default=0)

    completed_missions = relationship("CompletedMission", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    category = Column(String)
    difficulty = Column(String)
    date = Column(DateTime)
    latitude = Column(String)
    longitude = Column(String)
    reward_points = Column(Integer)


class CompletedMission(Base):
    __tablename__ = "completed_missions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mission_id = Column(Integer, ForeignKey("missions.id"))
    completed_at = Column(DateTime, default=datetime.utcnow)
    photo_url = Column(String, nullable=True)

    user = relationship("User", back_populates="completed_missions")
    mission = relationship("Mission")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    unlocked_at = Column(DateTime, nullable=True)
    icon_url = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="achievements")
