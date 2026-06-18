from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import uuid
import datetime

def generate_uuid():
    return str(uuid.uuid4())

def get_time_ago():
    return "刚刚"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    hashed_password = Column(String)
    avatarUrl = Column(String, nullable=True)
    created_at = Column(String, default=get_time_ago)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String, index=True)
    coverImage = Column(String, nullable=True)
    icon = Column(String)
    intro = Column(String)
    description = Column(String)
    auroraScore = Column(Float, default=0.0)
    radar = Column(JSON) # {concept, research, planning, extension, evaluation}
    radarContributors = Column(JSON, nullable=True)
    ratingFields = Column(JSON, nullable=True) # List[str]
    customInputs = Column(JSON, nullable=True) # List[Dict]
    tags = Column(JSON) # List[str]
    commentsCount = Column(Integer, default=0)
    timeAgo = Column(String, default=get_time_ago)
    hotness = Column(String, default="0k")
    likes = Column(Integer, default=0)
    bookmarked = Column(Boolean, default=False)
    
    # 痛点共鸣与共创轨迹
    painPointCount = Column(Integer, default=0)
    inspirationSource = Column(String, nullable=True)
    inspirationAuthor = Column(String, nullable=True)
    inspirationAuthorRole = Column(String, nullable=True)
    coCreationTimeline = Column(JSON, nullable=True) # List of events
    
    comments = relationship("Comment", back_populates="project", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"))
    author = Column(String)
    avatarUrl = Column(String, nullable=True)
    timeAgo = Column(String, default=get_time_ago)
    title = Column(String, nullable=True)
    content = Column(String)
    imageUrl = Column(String, nullable=True)
    images = Column(JSON, nullable=True) # List[str]
    type = Column(String, default="comment") # 'comment' or 'expansion'
    projectName = Column(String, nullable=True)
    category = Column(String, nullable=True)
    ratings = Column(JSON, nullable=True) # Record<string, number>
    customData = Column(JSON, nullable=True) # Record<string, string>
    bookmarked = Column(Boolean, default=False)

    project = relationship("Project", back_populates="comments")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_name = Column(String)
    content = Column(String)
    created_at = Column(String, default=get_time_ago)
