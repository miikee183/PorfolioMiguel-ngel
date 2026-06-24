# modelos de usuario, comentario y like

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base


class User(Base):
    # usuario autenticado con google
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    picture = Column(String(500), nullable=True)

    comments = relationship("Comment", back_populates="author")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")


class Comment(Base):
    # comentario o respuesta a otro comentario
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent")
    like_entries = relationship("Like", back_populates="comment", cascade="all, delete-orphan")


class Like(Base):
    # registro de like de un usuario en un comentario
    __tablename__ = "likes"
    __table_args__ = (UniqueConstraint("user_id", "comment_id"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)

    user = relationship("User", back_populates="likes")
    comment = relationship("Comment", back_populates="like_entries")
