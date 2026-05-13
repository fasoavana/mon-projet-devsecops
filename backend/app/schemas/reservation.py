from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.user import UserBase

class ReservationBase(BaseModel):
    date: str
    time: str
    description: str
    status: Optional[str] = "confirmed"

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class Reservation(ReservationBase):
    id: int
    user_id: int
    owner: Optional[UserBase] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
