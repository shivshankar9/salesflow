from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Optional[str] = "sales_rep"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str

class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = "active"
    created_by: str
    created_at: str
    updated_at: str

class ContactCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    status: Optional[str] = "active"

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    value: Optional[float] = 0
    stage: str
    source: Optional[str] = None
    created_by: str
    created_at: str
    updated_at: str

class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    value: Optional[float] = 0
    stage: str = "new"
    source: Optional[str] = None

class Deal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    value: float
    stage: str
    contact_id: Optional[str] = None
    expected_close_date: Optional[str] = None
    probability: Optional[int] = 50
    created_by: str
    created_at: str
    updated_at: str

class DealCreate(BaseModel):
    name: str
    value: float
    stage: str = "qualification"
    contact_id: Optional[str] = None
    expected_close_date: Optional[str] = None
    probability: Optional[int] = 50

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: Optional[str] = None
    activity_type: str
    related_to: Optional[str] = None
    related_id: Optional[str] = None
    due_date: Optional[str] = None
    completed: bool = False
    created_by: str
    created_at: str
    updated_at: str

class ActivityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    activity_type: str
    related_to: Optional[str] = None
    related_id: Optional[str] = None
    due_date: Optional[str] = None
    completed: bool = False

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": user_data.role,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user_id})
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"]})
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"]
    }

@api_router.post("/contacts", response_model=Contact)
async def create_contact(contact_data: ContactCreate, current_user: dict = Depends(get_current_user)):
    contact_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    contact_doc = {
        "id": contact_id,
        **contact_data.model_dump(),
        "created_by": current_user["id"],
        "created_at": now,
        "updated_at": now
    }
    
    await db.contacts.insert_one(contact_doc)
    return Contact(**contact_doc)

@api_router.get("/contacts", response_model=List[Contact])
async def get_contacts(current_user: dict = Depends(get_current_user)):
    contacts = await db.contacts.find({"created_by": current_user["id"]}, {"_id": 0}).to_list(1000)
    return [Contact(**c) for c in contacts]

@api_router.get("/contacts/{contact_id}", response_model=Contact)
async def get_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    contact = await db.contacts.find_one({"id": contact_id, "created_by": current_user["id"]}, {"_id": 0})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return Contact(**contact)

@api_router.put("/contacts/{contact_id}", response_model=Contact)
async def update_contact(contact_id: str, contact_data: ContactCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    update_data = {**contact_data.model_dump(), "updated_at": now}
    
    result = await db.contacts.update_one(
        {"id": contact_id, "created_by": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact = await db.contacts.find_one({"id": contact_id}, {"_id": 0})
    return Contact(**contact)

@api_router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.contacts.delete_one({"id": contact_id, "created_by": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted"}

@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate, current_user: dict = Depends(get_current_user)):
    lead_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    lead_doc = {
        "id": lead_id,
        **lead_data.model_dump(),
        "created_by": current_user["id"],
        "created_at": now,
        "updated_at": now
    }
    
    await db.leads.insert_one(lead_doc)
    return Lead(**lead_doc)

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(current_user: dict = Depends(get_current_user)):
    leads = await db.leads.find({"created_by": current_user["id"]}, {"_id": 0}).to_list(1000)
    return [Lead(**l) for l in leads]

@api_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id, "created_by": current_user["id"]}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return Lead(**lead)

@api_router.put("/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, lead_data: LeadCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    update_data = {**lead_data.model_dump(), "updated_at": now}
    
    result = await db.leads.update_one(
        {"id": lead_id, "created_by": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return Lead(**lead)

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.leads.delete_one({"id": lead_id, "created_by": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}

@api_router.post("/deals", response_model=Deal)
async def create_deal(deal_data: DealCreate, current_user: dict = Depends(get_current_user)):
    deal_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    deal_doc = {
        "id": deal_id,
        **deal_data.model_dump(),
        "created_by": current_user["id"],
        "created_at": now,
        "updated_at": now
    }
    
    await db.deals.insert_one(deal_doc)
    return Deal(**deal_doc)

@api_router.get("/deals", response_model=List[Deal])
async def get_deals(current_user: dict = Depends(get_current_user)):
    deals = await db.deals.find({"created_by": current_user["id"]}, {"_id": 0}).to_list(1000)
    return [Deal(**d) for d in deals]

@api_router.get("/deals/{deal_id}", response_model=Deal)
async def get_deal(deal_id: str, current_user: dict = Depends(get_current_user)):
    deal = await db.deals.find_one({"id": deal_id, "created_by": current_user["id"]}, {"_id": 0})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return Deal(**deal)

@api_router.put("/deals/{deal_id}", response_model=Deal)
async def update_deal(deal_id: str, deal_data: DealCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    update_data = {**deal_data.model_dump(), "updated_at": now}
    
    result = await db.deals.update_one(
        {"id": deal_id, "created_by": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    deal = await db.deals.find_one({"id": deal_id}, {"_id": 0})
    return Deal(**deal)

@api_router.delete("/deals/{deal_id}")
async def delete_deal(deal_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.deals.delete_one({"id": deal_id, "created_by": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"message": "Deal deleted"}

@api_router.post("/activities", response_model=Activity)
async def create_activity(activity_data: ActivityCreate, current_user: dict = Depends(get_current_user)):
    activity_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    activity_doc = {
        "id": activity_id,
        **activity_data.model_dump(),
        "created_by": current_user["id"],
        "created_at": now,
        "updated_at": now
    }
    
    await db.activities.insert_one(activity_doc)
    return Activity(**activity_doc)

@api_router.get("/activities", response_model=List[Activity])
async def get_activities(current_user: dict = Depends(get_current_user)):
    activities = await db.activities.find({"created_by": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Activity(**a) for a in activities]

@api_router.put("/activities/{activity_id}", response_model=Activity)
async def update_activity(activity_id: str, activity_data: ActivityCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    update_data = {**activity_data.model_dump(), "updated_at": now}
    
    result = await db.activities.update_one(
        {"id": activity_id, "created_by": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity = await db.activities.find_one({"id": activity_id}, {"_id": 0})
    return Activity(**activity)

@api_router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.activities.delete_one({"id": activity_id, "created_by": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted"}

@api_router.get("/dashboard/metrics")
async def get_dashboard_metrics(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    total_contacts = await db.contacts.count_documents({"created_by": user_id})
    total_leads = await db.leads.count_documents({"created_by": user_id})
    total_deals = await db.deals.count_documents({"created_by": user_id})
    
    deals = await db.deals.find({"created_by": user_id}, {"_id": 0}).to_list(1000)
    total_value = sum(d.get("value", 0) for d in deals)
    
    leads_by_stage = {}
    all_leads = await db.leads.find({"created_by": user_id}, {"_id": 0}).to_list(1000)
    for lead in all_leads:
        stage = lead.get("stage", "unknown")
        leads_by_stage[stage] = leads_by_stage.get(stage, 0) + 1
    
    return {
        "total_contacts": total_contacts,
        "total_leads": total_leads,
        "total_deals": total_deals,
        "total_value": total_value,
        "leads_by_stage": leads_by_stage
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()