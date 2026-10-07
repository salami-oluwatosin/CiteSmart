import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    biblography = relationship("Bibliography", back_populates="user")

class Bibliography(Base):
    __tablename__ = "bibliography"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, default="New Bibliography")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    user = relationship("User", back_populates="bibliography")
    citations = relationship("Citation", back_populates="bibliography", cascade="all, delete-orphan")

class Citation(Base):
    __tablename__ = "citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bibliography_id = Column(UUID(as_uuid=True), ForeignKey("bibliography.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    authors = Column(JSONB, nullable=False)
    year = Column(Integer)
    venue = Column(Text)
    doi = Column(String)
    url = Column(Text)
    source = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    bibliography = relationship("Bibliography", back_populates="citations")