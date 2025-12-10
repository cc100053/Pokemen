from datetime import datetime
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user, get_db_service
from app.services.db import DatabaseService


class ProfilePayload(BaseModel):
    name: str = Field("", max_length=200)
    email: str = Field("", max_length=320)
    status: str = Field("書類選考", max_length=100)
    role: str = Field("", max_length=200)
    notes: str = Field("", max_length=2000)
    avatarData: Optional[str] = None

    class Config:
        populate_by_name = True


router = APIRouter(prefix="/profile", tags=["profile"])


def _default_profile() -> Dict:
    return {
        "name": "",
        "email": "",
        "status": "書類選考",
        "role": "",
        "notes": "",
        "avatarData": None,
    }


def _merge_profile(payload: Optional[Dict]) -> Dict:
    base = _default_profile()
    if payload:
        base.update({k: ("" if v is None else v) for k, v in payload.items() if k in base})
        base["status"] = payload.get("status") or base["status"]
        if "avatarData" in payload:
            base["avatarData"] = payload.get("avatarData")
    return base


@router.get("", response_model=ProfilePayload)
async def get_profile(
    current_user=Depends(get_current_user),
    db: DatabaseService = Depends(get_db_service),
):
    user_id = current_user["user_id"]
    stored = db.get_profile(user_id) or {}
    profile = _merge_profile(stored)
    return profile


@router.put("", response_model=ProfilePayload, status_code=status.HTTP_200_OK)
async def update_profile(
    payload: ProfilePayload,
    current_user=Depends(get_current_user),
    db: DatabaseService = Depends(get_db_service),
):
    user_id = current_user["user_id"]
    profile = _merge_profile(payload.dict())
    profile["updated_at"] = datetime.utcnow().isoformat()
    try:
        db.upsert_profile(user_id, profile)
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save profile",
        ) from exc
    return profile
