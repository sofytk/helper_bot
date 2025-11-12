from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserSchema(BaseModel):
    id: int
    name: str
    region: Optional[str] = None
    total_points: int = 0
    water_drops: int = 0
    level: int = 1

    class Config:
        orm_mode = True


class MissionSchema(BaseModel):
    id: int
    title: str
    description: str
    category: str
    difficulty: str
    date: datetime
    latitude: float
    longitude: float
    reward_points: int

    class Config:
        orm_mode = True


class AchievementSchema(BaseModel):
    id: int
    name: str
    description: str
    unlocked_at: Optional[datetime] = None
    icon_url: Optional[str] = None

    class Config:
        orm_mode = True


class ProfileSchema(BaseModel):
    user: UserSchema
    completed_missions: List[MissionSchema]
    upcoming_missions: List[MissionSchema]
    achievements: List[AchievementSchema]

    class Config:
        orm_mode = True
