# api de comentarios con autenticacion google

import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import requests as http_requests
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.database import engine, get_db, Base
from backend.models import User, Comment, Like
from backend.schemas import GoogleAuth, CommentCreate, CommentOut, LikeResponse, UserOut

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Portfolio Feedback API")


@app.get("/")
def root():
    # endpoint de salud para comprobar que la api funciona
    return {"status": "ok", "message": "Portfolio Feedback API running"}


# permite peticiones desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(db: Session, token: str):
    # verifica el token con google y crea el usuario si no existe
    resp = http_requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {token}"},
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Token invalido")

    info = resp.json()
    user = db.query(User).filter(User.google_id == info["sub"]).first()
    if not user:
        user = User(
            google_id=info["sub"],
            email=info["email"],
            name=info["name"],
            picture=info.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def build_comment_out(comment: Comment, user_id: int = None):
    # construye la respuesta de un comentario con datos del autor
    user_liked = False
    if user_id:
        user_liked = any(like.user_id == user_id for like in comment.like_entries)
    return CommentOut(
        id=comment.id,
        content=comment.content,
        author=UserOut.model_validate(comment.author),
        parent_id=comment.parent_id,
        likes=comment.likes,
        user_liked=user_liked,
        created_at=comment.created_at,
        reply_count=len(comment.replies),
    )


@app.post("/api/auth/google")
def google_auth(data: GoogleAuth, db: Session = Depends(get_db)):
    # inicia sesion con token de google
    user = get_current_user(db, data.id_token)
    return {"user": UserOut.model_validate(user), "token": data.id_token}


@app.get("/api/comments")
def get_comments(sort: str = "recent", token: str = Header(None), db: Session = Depends(get_db)):
    # devuelve comentarios ordenados por reciente o por likes
    query = db.query(Comment).filter(Comment.parent_id == None)

    if sort == "top":
        comments = query.order_by(Comment.id.desc()).all()
        comments.sort(key=lambda c: c.likes, reverse=True)
    else:
        comments = query.order_by(Comment.created_at.desc()).all()

    current_user = None
    if token:
        try:
            current_user = get_current_user(db, token)
        except HTTPException:
            pass

    user_id = current_user.id if current_user else None
    return [build_comment_out(c, user_id) for c in comments]


@app.post("/api/comments")
def create_comment(data: CommentCreate, token: str = Header(...), db: Session = Depends(get_db)):
    # crea un comentario o respuesta
    user = get_current_user(db, token)

    if data.parent_id:
        parent = db.query(Comment).filter(Comment.id == data.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Comentario padre no encontrado")

    comment = Comment(
        content=data.content,
        author_id=user.id,
        parent_id=data.parent_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return build_comment_out(comment, user.id)


@app.get("/api/comments/{comment_id}/replies")
def get_replies(comment_id: int, token: str = Header(None), db: Session = Depends(get_db)):
    # devuelve las respuestas de un comentario
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    current_user = None
    if token:
        try:
            current_user = get_current_user(db, token)
        except HTTPException:
            pass

    user_id = current_user.id if current_user else None
    replies = sorted(comment.replies, key=lambda r: r.created_at)
    return [build_comment_out(r, user_id) for r in replies]


@app.post("/api/comments/{comment_id}/like")
def toggle_like(comment_id: int, token: str = Header(...), db: Session = Depends(get_db)):
    # activa o desactiva un like en un comentario
    user = get_current_user(db, token)
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    existing = db.query(Like).filter(Like.user_id == user.id, Like.comment_id == comment_id).first()

    if existing:
        db.delete(existing)
        comment.likes -= 1
        liked = False
    else:
        db.add(Like(user_id=user.id, comment_id=comment_id))
        comment.likes += 1
        liked = True

    db.commit()
    return LikeResponse(liked=liked, likes=comment.likes)


if __name__ == "__main__":
    # ejecuta el servidor en modo local
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
