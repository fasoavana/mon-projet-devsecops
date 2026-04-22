from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, auth

router = APIRouter()

@router.post("/", response_model=schemas.Reservation)
def create_reservation(
    reservation: schemas.ReservationCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_reservation = models.Reservation(
        **reservation.model_dump(),
        user_id=current_user.id
    )
    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)
    return new_reservation

@router.get("/", response_model=List[schemas.Reservation])
def get_reservations(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == "admin":
        return db.query(models.Reservation).all()
    return db.query(models.Reservation).filter(models.Reservation.user_id == current_user.id).all()

@router.put("/{reservation_id}", response_model=schemas.Reservation)
def update_reservation(
    reservation_id: int,
    reservation_update: schemas.ReservationCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_reservation = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if db_reservation.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this reservation")
    
    for key, value in reservation_update.model_dump().items():
        setattr(db_reservation, key, value)
    
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

@router.delete("/{reservation_id}")
def delete_reservation(
    reservation_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_reservation = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if db_reservation.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this reservation")
    
    db.delete(db_reservation)
    db.commit()
    return {"message": "Reservation deleted successfully"}
