from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
import uuid

from models import User, Bibliography, Citation
from schemas import UserCreate, BibliographyCreate, CitationCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# USERS
async def create_user(db: AsyncSession, data: UserCreate) -> User:
    password_hash = pwd_context.hash(data.password)
    user = User(email=data.email, password_hash=password_hash)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

# BIBLIOGRAPHIES
async def create_bibliography(db: AsyncSession, user_id: uuid.UUID, data: BibliographyCreate) -> Bibliography:
    bib = Bibliography(id=user_id, name=data.name)
    db.add(bib)
    await db.commit()
    await db.refresh(bib)
    return bib

async def get_bibliographies(db: AsyncSession, user_id: uuid.UUID) -> list[Bibliography]:
    result = await db.execute(select(Bibliography).where(Bibliography.user_id == user_id))
    return list(result.scalars().all())

async def get_bibliography(db: AsyncSession, bib_id: uuid.UUID, user_id: uuid.UUID) -> Bibliography | None:
    result = await db.execute(
        select(Bibliography).where(Bibliography.id == bib_id, Bibliography.user_id == user_id)
    )
    return result.scalar_one_or_none()

async def delete_bibliography(db: AsyncSession, bib_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    bib = await get_bibliography(db, bib_id, user_id)
    if not bib:
        return False
    await db.delete(bib)
    await db.commit()
    return True

# CITATIONS
async def create_citation(db: AsyncSession, data: CitationCreate) -> Citation:
    citation = Citation(
        bibliography_id=data.bibliography_id,
        title=data.title,
        authors=data.authors,
        year=data.year,
        venue=data.venue,
        doi=data.doi,
        url=data.url,
        source=data.source,
    )
    db.add(citation)
    await db.commit()
    await db.refresh(citation)
    return citation

async def get_citations(db: AsyncSession, bib_id: uuid.UUID) -> list[Citation]:
    result = await db.execute(select(Citation).where(Citation.bibliography_id == bib_id))
    return list(result.scalars().all())

async def delete_citation(db: AsyncSession, citation_id: uuid.UUID) -> bool:
    result = await db.execute(select(Citation).where(Citation.id == citation_id))
    citation = result.scalar_one_or_none()
    if not citation:
        return False
    await db.delete(citation)
    await db.commit()
    return True

async def move_citation(db: AsyncSession, citation_id: uuid.UUID, new_bib_id: uuid.UUID) -> Citation | None:
    result = await db.execute(select(Citation).where(Citation.id == citation_id))
    citation = result.scalar_one_or_none()
    if not citation:
        return None
    citation.bibliography_id = new_bib_id
    await db.commit()
    await db.refresh(citation)
    return citation

async def copy_citation(db: AsyncSession, citation_id: uuid.UUID, new_bib_id: uuid.UUID) -> Citation | None:
    result = await db.execute(select(Citation).where(Citation.id == citation_id))
    original = result.scalar_one_or_none()
    if not original:
        return None
    new_citation = Citation(
        bibliography_id=new_bib_id,
        title=original.title,
        authors=original.authors,
        year=original.year,
        venue=original.venue,
        doi=original.doi,
        url=original.url,
        source=original.source,
    )
    db.add(new_citation)
    await db.commit()
    await db.refresh(new_citation)
    return new_citation