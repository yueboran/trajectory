from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import models, schemas, crud
from database import engine, get_db

# 创建数据库表
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="璀璨星图 (迹向) - Backend API", description="由 FastAPI 提供的高性能接口", version="1.0.0")

# 配置CORS跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def make_response(data: any = None, message: str = "success", code: int = 200) -> schemas.ApiResponse:
    return schemas.ApiResponse(code=code, message=message, data=data)

@app.get("/api/projects", response_model=schemas.ApiResponse)
def read_projects(
    category: Optional[str] = Query(None),
    sortBy: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    projects, total = crud.get_projects(db, category=category, skip=skip, limit=limit)
    
    # 将 SQLAlchemy 实体转换为 Pydantic Schema，防止 Any 序列化失败
    pydantic_projects = [schemas.Project.model_validate(p) for p in projects]
    paginated = schemas.PaginatedResponse(list=pydantic_projects, total=total, page=page, limit=limit)
    return make_response(paginated)

@app.get("/api/projects/{project_id}", response_model=schemas.ApiResponse)
def read_project(project_id: str, db: Session = Depends(get_db)):
    db_project = crud.get_project_by_id(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return make_response(schemas.Project.model_validate(db_project))

@app.post("/api/projects", response_model=schemas.ApiResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = crud.create_project(db=db, project=project)
    return make_response(schemas.Project.model_validate(db_project))

@app.put("/api/projects/{project_id}", response_model=schemas.ApiResponse)
def update_project(project_id: str, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    db_project = crud.update_project(db, project_id, project_update)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return make_response(schemas.Project.model_validate(db_project))

@app.post("/api/projects/{project_id}/comments", response_model=schemas.ApiResponse)
def create_comment_for_project(
    project_id: str, comment: schemas.CommentCreate, db: Session = Depends(get_db)
):
    db_comment = crud.create_project_comment(db=db, project_id=project_id, comment=comment)
    return make_response(schemas.Comment.model_validate(db_comment))

@app.get("/api/projects/{project_id}/comments", response_model=schemas.ApiResponse)
def read_project_comments(
    project_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    comments, total = crud.get_project_comments(db, project_id=project_id, skip=skip, limit=limit)
    pydantic_comments = [schemas.Comment.model_validate(c) for c in comments]
    paginated = schemas.PaginatedResponse(list=pydantic_comments, total=total, page=page, limit=limit)
    return make_response(paginated)

@app.post("/api/projects/{project_id}/like")
def toggle_like_project(project_id: str, db: Session = Depends(get_db)):
    db_project = crud.get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_project.likes += 1
    db.commit()
    return make_response({"status": "success", "currentCount": db_project.likes})

@app.post("/api/projects/{project_id}/bookmark")
def toggle_bookmark_project(project_id: str, db: Session = Depends(get_db)):
    db_project = crud.get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_project.bookmarked = not db_project.bookmarked
    db.commit()
    return make_response({"status": "success", "bookmarked": db_project.bookmarked})

@app.post("/api/projects/{project_id}/comments/{comment_id}/bookmark")
def toggle_bookmark_comment(project_id: str, comment_id: str, db: Session = Depends(get_db)):
    db_comment = crud.toggle_bookmark_comment(db, comment_id)
    if not db_comment or db_comment.project_id != project_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    return make_response({"status": "success", "bookmarked": db_comment.bookmarked})

@app.put("/api/projects/{project_id}/comments/{comment_id}", response_model=schemas.ApiResponse)
def update_project_comment(
    project_id: str, comment_id: str, comment_update: schemas.CommentUpdate, db: Session = Depends(get_db)
):
    db_comment = crud.update_project_comment(db, comment_id, comment_update)
    if not db_comment or db_comment.project_id != project_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    return make_response(schemas.Comment.model_validate(db_comment))

@app.delete("/api/projects/{project_id}/comments/{comment_id}", response_model=schemas.ApiResponse)
def delete_project_comment(
    project_id: str, comment_id: str, db: Session = Depends(get_db)
):
    success = crud.delete_project_comment(db, project_id, comment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    return make_response({"status": "success", "id": comment_id})

@app.delete("/api/projects/{project_id}", response_model=schemas.ApiResponse)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    success = crud.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return make_response({"status": "success", "id": project_id})

@app.get("/api/timeline", response_model=schemas.ApiResponse)
def get_timeline():
    # 临时返回空列表或Mock数据，防止前端报错
    return make_response([])
