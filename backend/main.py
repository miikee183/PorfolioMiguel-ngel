import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests

from backend.database import engine, get_db, Base
from backend.models import User, Comment
from backend.schemas import GoogleAuth, CommentCreate, CommentOut, UserOut

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

Base.metadata.create_all(bind=engine)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

app = FastAPI(title="Portfolio Feedback API")


@app.get("/")
def root():
    return {"status": "ok", "message": "Portfolio Feedback API running"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(db: Session, token: str):
    try:
        info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
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
    except ValueError:
        raise HTTPException(status_code=401, detail="Token inválido")


@app.post("/api/auth/google")
def google_auth(data: GoogleAuth, db: Session = Depends(get_db)):
    user = get_current_user(db, data.id_token)
    return {"user": UserOut.model_validate(user), "token": data.id_token}


@app.get("/api/comments")
def get_comments(sort: str = "recent", db: Session = Depends(get_db)):
    query = db.query(Comment).filter(Comment.parent_id == None)

    if sort == "top":
        comments = query.order_by(Comment.id.desc()).all()
        comments.sort(key=lambda c: c.likes, reverse=True)
    else:
        comments = query.order_by(Comment.created_at.desc()).all()

    result = []
    for c in comments:
        result.append(CommentOut(
            id=c.id,
            content=c.content,
            author=UserOut.model_validate(c.author),
            parent_id=c.parent_id,
            likes=c.likes,
            created_at=c.created_at,
            reply_count=c.replies.count(),
        ))
    return result


@app.post("/api/comments")
def create_comment(data: CommentCreate, token: str, db: Session = Depends(get_db)):
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

    return CommentOut(
        id=comment.id,
        content=comment.content,
        author=UserOut.model_validate(comment.author),
        parent_id=comment.parent_id,
        likes=0,
        created_at=comment.created_at,
        reply_count=0,
    )


@app.get("/api/comments/{comment_id}/replies")
def get_replies(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    replies = comment.replies.order_by(Comment.created_at.asc()).all()
    result = []
    for r in replies:
        result.append(CommentOut(
            id=r.id,
            content=r.content,
            author=UserOut.model_validate(r.author),
            parent_id=r.parent_id,
            likes=r.likes,
            created_at=r.created_at,
            reply_count=0,
        ))
    return result


@app.post("/api/comments/{comment_id}/like")
def toggle_like(comment_id: int, token: str, db: Session = Depends(get_db)):
    get_current_user(db, token)
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    comment.likes += 1
    db.commit()

    return {"liked": True, "likes": comment.likes}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
