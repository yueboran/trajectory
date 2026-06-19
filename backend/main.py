from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import models, schemas, crud
from database import engine, get_db

# 创建数据库表
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="璀璨星图 (迹向) - Backend API", description="由 FastAPI 提供的高性能接口", version="1.0.0")

os.makedirs("data/avatars", exist_ok=True)
os.makedirs("data/images/uploads", exist_ok=True)
app.mount("/api/static", StaticFiles(directory="data"), name="static")

# 配置CORS跨域请求
cors_origins_str = os.getenv("CORS_ORIGINS", "*")
cors_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def make_response(data: any = None, message: str = "success", code: int = 200) -> schemas.ApiResponse:
    return schemas.ApiResponse(code=code, message=message, data=data)

from datetime import datetime, timedelta
import jwt
from jwt.exceptions import PyJWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import smtplib
from email.mime.text import MIMEText
import random
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-please-change")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30 # 30 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.qq.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

VERIFICATION_CODES = {}

@app.post("/api/auth/send-code", response_model=schemas.ApiResponse)
def send_verification_code(request: schemas.SendCodeRequest, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=request.email)
    if db_user:
        raise HTTPException(status_code=400, detail="邮箱已被注册")
        
    code = f"{random.randint(0, 999999):06d}"
    
    VERIFICATION_CODES[request.email] = {
        "code": code,
        "expires_at": datetime.utcnow() + timedelta(minutes=5)
    }
    
    msg = MIMEText(f"【迹向】您的注册验证码是：{code}。该验证码 5 分钟内有效。请勿泄露给他人。", 'plain', 'utf-8')
    msg['Subject'] = "迹向 - 注册验证码"
    msg['From'] = SMTP_USER
    msg['To'] = request.email
    
    try:
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="发送邮件失败，请检查服务器配置")
        
    return make_response({"status": "success", "message": "验证码已发送"})

@app.post("/api/auth/register", response_model=schemas.ApiResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="邮箱已被注册")
        
    cached_code_data = VERIFICATION_CODES.get(user.email)
    if not cached_code_data:
        raise HTTPException(status_code=400, detail="请先获取验证码")
        
    if datetime.utcnow() > cached_code_data["expires_at"]:
        raise HTTPException(status_code=400, detail="验证码已过期，请重新获取")
        
    if cached_code_data["code"] != user.verificationCode:
        raise HTTPException(status_code=400, detail="验证码错误")
        
    if user.email in VERIFICATION_CODES:
        del VERIFICATION_CODES[user.email]
        
    new_user = crud.create_user(db=db, user=user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return make_response({
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.UserResponse.model_validate(new_user).model_dump()
    })

@app.post("/api/auth/login", response_model=schemas.ApiResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if not db_user or not crud.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="邮箱或密码错误")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return make_response({
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.UserResponse.model_validate(db_user).model_dump()
    })

@app.get("/api/auth/me", response_model=schemas.ApiResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return make_response(schemas.UserResponse.model_validate(current_user).model_dump())

@app.post("/api/auth/me/avatar", response_model=schemas.ApiResponse)
async def upload_avatar(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    filename = f"{current_user.id}.webp"
    file_path = f"data/avatars/{filename}"
    
    try:
        with Image.open(file.file) as img:
            img.save(file_path, 'webp', quality=85)
    except Exception as e:
        raise HTTPException(status_code=400, detail="图片格式不支持或损坏")
        
    avatar_url = f"/api/static/avatars/{filename}"
    current_user.avatarUrl = avatar_url
    db.commit()
    
    return make_response({"avatarUrl": avatar_url})

@app.post("/api/upload/image", response_model=schemas.ApiResponse)
async def upload_image(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    filename = f"{uuid.uuid4().hex}.webp"
    file_path = f"data/images/uploads/{filename}"
    
    try:
        with Image.open(file.file) as img:
            img.save(file_path, 'webp', quality=85)
    except Exception as e:
        raise HTTPException(status_code=400, detail="图片格式不支持或损坏")
        
    url = f"/api/static/images/uploads/{filename}"
    return make_response({"url": url})

@app.get("/api/projects", response_model=schemas.ApiResponse)
def read_projects(
    category: Optional[str] = Query(None),
    sortBy: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    skip = (page - 1) * limit
    projects, total = crud.get_projects(db, user_id=current_user.id, category=category, skip=skip, limit=limit)
    
    # 将 SQLAlchemy 实体转换为 Pydantic Schema，防止 Any 序列化失败
    pydantic_projects = [schemas.Project.model_validate(p) for p in projects]
    paginated = schemas.PaginatedResponse(list=pydantic_projects, total=total, page=page, limit=limit)
    return make_response(paginated)

@app.get("/api/projects/{project_id}", response_model=schemas.ApiResponse)
def read_project(project_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_project = crud.get_project_by_id(db, project_id=project_id, user_id=current_user.id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return make_response(schemas.Project.model_validate(db_project))

@app.post("/api/projects", response_model=schemas.ApiResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_project = crud.create_project(db=db, project=project, user_id=current_user.id)
    return make_response(schemas.Project.model_validate(db_project))

@app.put("/api/projects/{project_id}", response_model=schemas.ApiResponse)
def update_project(project_id: str, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_project = crud.update_project(db, project_id, project_update, user_id=current_user.id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return make_response(schemas.Project.model_validate(db_project))

@app.post("/api/projects/{project_id}/comments", response_model=schemas.ApiResponse)
def create_comment_for_project(
    project_id: str, comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    # 验证项目归属权
    db_project = crud.get_project_by_id(db, project_id=project_id, user_id=current_user.id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db_comment = crud.create_project_comment(db=db, project_id=project_id, comment=comment)
    return make_response(schemas.Comment.model_validate(db_comment))

@app.get("/api/projects/{project_id}/comments", response_model=schemas.ApiResponse)
def read_project_comments(
    project_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 验证项目是否属于当前用户
    db_project = crud.get_project_by_id(db, project_id=project_id, user_id=current_user.id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    skip = (page - 1) * limit
    comments, total = crud.get_project_comments(db, project_id=project_id, skip=skip, limit=limit)
    pydantic_comments = [schemas.Comment.model_validate(c) for c in comments]
    paginated = schemas.PaginatedResponse(list=pydantic_comments, total=total, page=page, limit=limit)
    return make_response(paginated)

@app.post("/api/projects/{project_id}/like")
def toggle_like_project(project_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_project = crud.get_project_by_id(db, project_id, current_user.id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_project.likes += 1
    db.commit()
    return make_response({"status": "success", "currentCount": db_project.likes})

@app.post("/api/projects/{project_id}/bookmark")
def toggle_bookmark_project(project_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_project = crud.get_project_by_id(db, project_id, current_user.id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_project.bookmarked = not db_project.bookmarked
    db.commit()
    return make_response({"status": "success", "bookmarked": db_project.bookmarked})

@app.post("/api/projects/{project_id}/comments/{comment_id}/bookmark")
def toggle_bookmark_comment(project_id: str, comment_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 验证项目归属权
    db_project = crud.get_project_by_id(db, project_id=project_id, user_id=current_user.id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db_comment = crud.toggle_bookmark_comment(db, comment_id)
    if not db_comment or db_comment.project_id != project_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    return make_response({"status": "success", "bookmarked": db_comment.bookmarked})

@app.put("/api/projects/{project_id}/comments/{comment_id}", response_model=schemas.ApiResponse)
def update_project_comment(
    project_id: str, comment_id: str, comment_update: schemas.CommentUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    # 验证项目归属权
    db_project = crud.get_project_by_id(db, project_id=project_id, user_id=current_user.id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_comment = crud.update_project_comment(db, comment_id, comment_update)
    if not db_comment or db_comment.project_id != project_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    return make_response(schemas.Comment.model_validate(db_comment))

@app.delete("/api/projects/{project_id}/comments/{comment_id}", response_model=schemas.ApiResponse)
def delete_project_comment(
    project_id: str, comment_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    # 验证项目归属权
    db_project = crud.get_project_by_id(db, project_id=project_id, user_id=current_user.id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    success = crud.delete_project_comment(db, project_id, comment_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    return make_response({"status": "success", "id": comment_id})

@app.delete("/api/projects/{project_id}", response_model=schemas.ApiResponse)
def delete_project(project_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    success = crud.delete_project(db, project_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return make_response({"status": "success", "id": project_id})

@app.get("/api/timeline", response_model=schemas.ApiResponse)
def get_timeline():
    # 临时返回空列表或Mock数据，防止前端报错
    return make_response([])

@app.post("/api/feedback", response_model=schemas.ApiResponse)
def create_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    db_feedback = crud.create_feedback(db=db, feedback=feedback)
    return make_response(schemas.FeedbackResponse.model_validate(db_feedback))
