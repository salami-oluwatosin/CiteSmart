from pydantic import EmailStr, BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List


# USER API SCHEMA(S)
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


#BIBLIOGRPAHY API SCHEMA(S)
class BibliographyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)

class BibliographyResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

# CITATION API SCHEMA(S)
class CitationCreate(BaseModel):
    bibliography_id: UUID
    title: str
    authors: List[str]
    year: Optional[int] = None
    venue: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    source: Optional[str] = None

class CitationResponse(BaseModel):
    id: UUID
    bibliography_id: UUID
    title: str
    authors: List[str]
    year: Optional[int]
    venue: Optional[str]
    doi: Optional[str]
    url: Optional[str]
    source: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
