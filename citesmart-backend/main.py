from fastapi.responses import PlainTextResponse
import formatters
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

from database import engine, Base, get_session
from models import User
from schemas import UserCreate, UserResponse, BibliographyCreate, BibliographyResponse, CitationCreate, CitationResponse
import crud
from pydantic import BaseModel
import search as search_engine

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(title="CiteSmart API")

# STARTUP: create tables
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# AUTH SUB-FUNCTIONS
def create_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_session),
) -> User:
    creds_error = HTTPException(status_code=401, detail="Invalid credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise creds_error
    except JWTError:
        raise creds_error
    result = await db.execute(__import__("sqlalchemy").select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise creds_error
    return user

# AUTH ROUTES
@app.post("/auth/signup", response_model=UserResponse)
async def signup(data: UserCreate, db: AsyncSession = Depends(get_session)):
    existing = await crud.get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await crud.create_user(db, data)
    return user

@app.post("/auth/login")
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_session)):
    user = await crud.get_user_by_email(db, form.username)
    if not user or not __import__("passlib.context", fromlist=["CryptContext"]).CryptContext(schemes=["bcrypt"]).verify(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    token = create_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def me(current: User = Depends(get_current_user)):
    return current

# BIBLIOGRAPHY ROUTES
@app.post("/bibliographies", response_model=BibliographyResponse)
async def create_bib(
    data: BibliographyCreate,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    return await crud.create_bibliography(db, current.id, data)

@app.get("/bibliographies", response_model=list[BibliographyResponse])
async def list_bibs(
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    return await crud.get_bibliographies(db, current.id)

@app.delete("/bibliographies/{bib_id}")
async def delete_bib(
    bib_id: str,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    ok = await crud.delete_bibliography(db, bib_id, current.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

# CITATION ROUTES 
@app.post("/citations", response_model=CitationResponse)
async def add_citation(
    data: CitationCreate,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    bib = await crud.get_bibliography(db, data.bibliography_id, current.id)
    if not bib:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    return await crud.create_citation(db, data)

@app.get("/bibliographies/{bib_id}/citations", response_model=list[CitationResponse])
async def list_citations(
    bib_id: str,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    bib = await crud.get_bibliography(db, bib_id, current.id)
    if not bib:
        raise HTTPException(status_code=404, detail="Bibliography not found")
    return await crud.get_citations(db, bib_id)

@app.delete("/citations/{citation_id}")
async def delete_citation(
    citation_id: str,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    ok = await crud.delete_citation(db, citation_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}

@app.post("/citations/{citation_id}/move/{bib_id}", response_model=CitationResponse)
async def move_citation(
    citation_id: str,
    bib_id: str,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    bib = await crud.get_bibliography(db, bib_id, current.id)
    if not bib:
        raise HTTPException(status_code=404, detail="Target bibliography not found")
    result = await crud.move_citation(db, citation_id, bib_id)
    if not result:
        raise HTTPException(status_code=404, detail="Citation not found")
    return result

@app.post("/citations/{citation_id}/copy/{bib_id}", response_model=CitationResponse)
async def copy_citation(
    citation_id: str,
    bib_id: str,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    bib = await crud.get_bibliography(db, bib_id, current.id)
    if not bib:
        raise HTTPException(status_code=404, detail="Target bibliography not found")
    result = await crud.copy_citation(db, citation_id, bib_id)
    if not result:
        raise HTTPException(status_code=404, detail="Citation not found")
    return result

# SEARCH ROUTE
class SearchRequest(BaseModel):
    query: str
    mode: str = "auto"

@app.post("/search")
async def search_papers(
    data: SearchRequest,
    current: User = Depends(get_current_user),
):
    results = await search_engine.search(data.query, data.mode)
    return {"results": results}


# FORMATTING ROUTE
class ExportRequest(BaseModel):
    bibliography_id: str
    style: str = "apa"  # apa | mla | chicago | bibtex

@app.post("/export")
async def export_bibliography(
    data: ExportRequest,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    bib = await crud.get_bibliography(db, data.bibliography_id, current.id)
    if not bib:
        raise HTTPException(status_code=404, detail="Bibliography not found")

    citations = await crud.get_citations(db, data.bibliography_id)
    if not citations:
        raise HTTPException(status_code=400, detail="Bibliography is empty")

    as_dicts = [
        {
            "title": c.title,
            "authors": c.authors,
            "year": c.year,
            "venue": c.venue,
            "doi": c.doi,
            "url": c.url,
        }
        for c in citations
    ]

    text = formatters.format_all(as_dicts, data.style)

    ext = "bib" if data.style == "bibtex" else "txt"
    filename = f"{bib.name.replace(' ', '_')}_{data.style}.{ext}"

    return PlainTextResponse(
        content=text,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )