from sqlalchemy.orm import Session
from sqlalchemy import or_
import models, schemas
import uuid

def get_projects(db: Session, category: str = None, search: str = None, skip: int = 0, limit: int = 10):
    query = db.query(models.Project)
    if category and category != "all":
        # 简化版：只需检查tags中包含该分类字眼即可
        # 针对JSON字段中的列表搜索在SQLite比较受限，这是一种简化的LIKE查询或Python层过滤
        pass
    
    total = query.count()
    projects = query.offset(skip).limit(limit).all()
    return projects, total

def get_project_by_id(db: Session, project_id: str):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(
        name=project.name,
        coverImage=project.coverImage,
        icon=project.icon,
        intro=project.intro,
        description=project.description,
        auroraScore=project.auroraScore,
        radar=project.radar.model_dump(),
        radarContributors=project.radarContributors,
        tags=project.tags,
        painPointCount=project.painPointCount,
        inspirationSource=project.inspirationSource,
        inspirationAuthor=project.inspirationAuthor,
        inspirationAuthorRole=project.inspirationAuthorRole,
        coCreationTimeline=project.coCreationTimeline,
        commentsCount=0,
        likes=0,
        bookmarked=False
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: str, project_update: schemas.ProjectUpdate):
    db_project = get_project_by_id(db, project_id)
    if db_project:
        update_data = project_update.model_dump(exclude_unset=True)
        if "radar" in update_data:
            update_data["radar"] = update_data["radar"].model_dump() if hasattr(update_data["radar"], "model_dump") else update_data["radar"]
            
        for key, value in update_data.items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def create_project_comment(db: Session, project_id: str, comment: schemas.CommentCreate):
    db_comment = models.Comment(
        project_id=project_id,
        author=comment.author,
        avatarUrl=comment.avatarUrl,
        title=comment.title,
        content=comment.content,
        imageUrl=comment.imageUrl,
        images=comment.images,
        type=comment.type,
        projectName=comment.projectName,
        category=comment.category,
        ratings=comment.ratings
    )
    db.add(db_comment)
    
    # 增加项目评论数
    db_project = get_project_by_id(db, project_id)
    if db_project:
        db_project.commentsCount += 1
        
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_project_comments(db: Session, project_id: str, skip: int = 0, limit: int = 10):
    query = db.query(models.Comment).filter(models.Comment.project_id == project_id)
    total = query.count()
    comments = query.offset(skip).limit(limit).all()
    return comments, total

def toggle_bookmark_comment(db: Session, comment_id: str):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment:
        db_comment.bookmarked = not db_comment.bookmarked
        db.commit()
    return db_comment

def update_project_comment(db: Session, comment_id: str, comment_update: schemas.CommentUpdate):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment:
        update_data = comment_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_comment, key, value)
        db.commit()
        db.refresh(db_comment)
    return db_comment

def delete_project_comment(db: Session, project_id: str, comment_id: str):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment:
        db.delete(db_comment)
        
        # 减少项目评论数
        db_project = get_project_by_id(db, project_id)
        if db_project and db_project.commentsCount > 0:
            db_project.commentsCount -= 1
            
        db.commit()
        return True
    return False

def delete_project(db: Session, project_id: str):
    db_project = get_project_by_id(db, project_id)
    if db_project:
        # 关联的 comments 也要删除，但由于模型上没有显式 cascade，手动删或依赖外键 cascade
        # 我们这里先手动把相关的 comments 删掉
        db.query(models.Comment).filter(models.Comment.project_id == project_id).delete(synchronize_session=False)
        db.delete(db_project)
        db.commit()
        return True
    return False
