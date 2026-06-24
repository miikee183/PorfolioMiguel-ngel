from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GoogleAuth(BaseModel):
    id_token: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    picture: Optional[str] = None

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentOut(BaseModel):
    id: int
    content: str
    author: UserOut
    parent_id: Optional[int] = None
    likes: int = 0
    user_liked: bool = False
    created_at: datetime
    reply_count: int = 0

    class Config:
        from_attributes = True


class LikeResponse(BaseModel):
    liked: bool
    likes: int
