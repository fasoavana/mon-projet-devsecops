from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.db import models
from app.schemas.reservation import Reservation, ReservationCreate, ReservationUpdate

router = APIRouter()

@router.get("/", response_model=List[Reservation])
def read_reservations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
    date: Optional[str] = Query(None, description="Filtrer par date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filtrer par statut"),
) -> Any:
    query = db.query(models.Reservation)
    
    # RBAC: Les utilisateurs ne voient que les leurs, les admins voient tout
    if current_user.role != "admin":
        query = query.filter(models.Reservation.user_id == current_user.id)
    
    # Filtrage
    if date:
        query = query.filter(models.Reservation.date == date)
    if status:
        query = query.filter(models.Reservation.status == status)
        
    return query.order_by(models.Reservation.date.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=Reservation)
def create_reservation(
    *,
    db: Session = Depends(deps.get_db),
    reservation_in: ReservationCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    reservation = models.Reservation(
        **reservation_in.model_dump(),
        user_id=current_user.id
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation

@router.put("/{id}", response_model=Reservation)
def update_reservation(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    reservation_in: ReservationUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    reservation = db.query(models.Reservation).filter(models.Reservation.id == id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if current_user.role != "admin" and reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    update_data = reservation_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reservation, field, value)
        
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation

@router.delete("/{id}", response_model=Any)
def delete_reservation(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    reservation = db.query(models.Reservation).filter(models.Reservation.id == id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if current_user.role != "admin" and reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough privileges")
        
    db.delete(reservation)
    db.commit()
    return {"msg": "Reservation deleted"}
