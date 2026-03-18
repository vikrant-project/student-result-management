from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext
import jwt
from jwt.exceptions import InvalidTokenError
import io
import csv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'vikrant-secret-key-2024-srms')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ===================== MODELS =====================

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    username: str
    password_hash: str

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    roll_no: str
    name: str
    class_name: str
    email: str
    phone: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class StudentCreate(BaseModel):
    roll_no: str
    name: str
    class_name: str
    email: str
    phone: str

class Subject(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    max_marks: int

class SubjectCreate(BaseModel):
    name: str
    code: str
    max_marks: int

class ResultEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    subject_id: str
    marks: float
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None

class ResultEntryCreate(BaseModel):
    student_id: str
    subject_id: str
    marks: float

class StudentResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student: Student
    results: List[dict]
    total_marks: float
    max_total_marks: float
    percentage: float
    grade: str
    result: str
    grade_description: str

class DashboardStats(BaseModel):
    total_students: int
    total_subjects: int
    passed_students: int
    failed_students: int
    average_percentage: float

# ===================== HELPER FUNCTIONS =====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username}
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_grade(percentage: float) -> tuple:
    """Returns (grade, result, description)"""
    if percentage >= 90:
        return ("A+", "Pass", "Distinction")
    elif percentage >= 75:
        return ("A", "Pass", "First Class")
    elif percentage >= 60:
        return ("B", "Pass", "Second Class")
    elif percentage >= 45:
        return ("C", "Pass", "Pass Class")
    else:
        return ("F", "Fail", "Fail")

# ===================== STARTUP EVENT - SEED DATA =====================

@app.on_event("startup")
async def startup_event():
    """Initialize database with default admin and sample data"""
    
    # Create default admin if not exists
    admin_exists = await db.admins.find_one({"username": "admin"})
    if not admin_exists:
        default_admin = {
            "username": "admin",
            "password_hash": hash_password("vikrant123")
        }
        await db.admins.insert_one(default_admin)
        logger.info("Default admin created: username=admin, password=vikrant123")
    
    # Create sample subjects if collection is empty
    subjects_count = await db.subjects.count_documents({})
    if subjects_count == 0:
        sample_subjects = [
            {"id": str(uuid.uuid4()), "name": "Mathematics", "code": "MATH101", "max_marks": 100},
            {"id": str(uuid.uuid4()), "name": "Physics", "code": "PHY101", "max_marks": 100},
            {"id": str(uuid.uuid4()), "name": "Chemistry", "code": "CHEM101", "max_marks": 100},
            {"id": str(uuid.uuid4()), "name": "English", "code": "ENG101", "max_marks": 100},
            {"id": str(uuid.uuid4()), "name": "Computer Science", "code": "CS101", "max_marks": 100},
        ]
        await db.subjects.insert_many(sample_subjects)
        logger.info("Sample subjects created")
    
    # Create sample students if collection is empty
    students_count = await db.students.count_documents({})
    if students_count == 0:
        sample_students = [
            {"id": str(uuid.uuid4()), "roll_no": "2024001", "name": "Rahul Sharma", "class_name": "BCA 1st Year", "email": "rahul@example.com", "phone": "9876543210", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "roll_no": "2024002", "name": "Priya Singh", "class_name": "BCA 1st Year", "email": "priya@example.com", "phone": "9876543211", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "roll_no": "2024003", "name": "Amit Kumar", "class_name": "BCA 2nd Year", "email": "amit@example.com", "phone": "9876543212", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "roll_no": "2024004", "name": "Sneha Verma", "class_name": "BCA 2nd Year", "email": "sneha@example.com", "phone": "9876543213", "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.students.insert_many(sample_students)
        logger.info("Sample students created")
        
        # Create sample results for these students
        subjects = await db.subjects.find({}, {"_id": 0}).to_list(100)
        students = await db.students.find({}, {"_id": 0}).to_list(100)
        
        sample_results = []
        import random
        for student in students:
            for subject in subjects:
                marks = random.randint(35, 98)
                result_entry = {
                    "id": str(uuid.uuid4()),
                    "student_id": student["id"],
                    "subject_id": subject["id"],
                    "marks": marks,
                    "subject_name": subject["name"],
                    "subject_code": subject["code"]
                }
                sample_results.append(result_entry)
        
        if sample_results:
            await db.results.insert_many(sample_results)
            logger.info("Sample results created")

# ===================== AUTH ROUTES =====================

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: AdminLogin):
    """Admin login endpoint"""
    admin = await db.admins.find_one({"username": credentials.username}, {"_id": 0})
    if not admin or not verify_password(credentials.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": credentials.username})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        username=credentials.username
    )

@api_router.get("/auth/verify")
async def verify_token(token: str):
    """Verify if token is valid"""
    user = await get_current_user(token)
    return {"valid": True, "username": user["username"]}

# ===================== STUDENT ROUTES =====================

@api_router.get("/students", response_model=List[Student])
async def get_students(search: Optional[str] = None):
    """Get all students with optional search by name or roll number"""
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"roll_no": {"$regex": search, "$options": "i"}}
            ]
        }
    students = await db.students.find(query, {"_id": 0}).to_list(1000)
    return students

@api_router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str):
    """Get a single student by ID"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@api_router.post("/students", response_model=Student)
async def create_student(student: StudentCreate):
    """Create a new student"""
    # Check if roll number already exists
    existing = await db.students.find_one({"roll_no": student.roll_no})
    if existing:
        raise HTTPException(status_code=400, detail="Roll number already exists")
    
    new_student = Student(**student.model_dump())
    await db.students.insert_one(new_student.model_dump())
    return new_student

@api_router.put("/students/{student_id}", response_model=Student)
async def update_student(student_id: str, student_update: StudentCreate):
    """Update a student"""
    existing = await db.students.find_one({"id": student_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if new roll number conflicts with another student
    roll_conflict = await db.students.find_one({
        "roll_no": student_update.roll_no,
        "id": {"$ne": student_id}
    })
    if roll_conflict:
        raise HTTPException(status_code=400, detail="Roll number already exists")
    
    updated_data = student_update.model_dump()
    await db.students.update_one({"id": student_id}, {"$set": updated_data})
    
    updated_student = await db.students.find_one({"id": student_id}, {"_id": 0})
    return updated_student

@api_router.delete("/students/{student_id}")
async def delete_student(student_id: str):
    """Delete a student and their results"""
    result = await db.students.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Also delete all results for this student
    await db.results.delete_many({"student_id": student_id})
    
    return {"message": "Student deleted successfully"}

# ===================== SUBJECT ROUTES =====================

@api_router.get("/subjects", response_model=List[Subject])
async def get_subjects():
    """Get all subjects"""
    subjects = await db.subjects.find({}, {"_id": 0}).to_list(1000)
    return subjects

@api_router.get("/subjects/{subject_id}", response_model=Subject)
async def get_subject(subject_id: str):
    """Get a single subject by ID"""
    subject = await db.subjects.find_one({"id": subject_id}, {"_id": 0})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@api_router.post("/subjects", response_model=Subject)
async def create_subject(subject: SubjectCreate):
    """Create a new subject"""
    # Check if subject code already exists
    existing = await db.subjects.find_one({"code": subject.code})
    if existing:
        raise HTTPException(status_code=400, detail="Subject code already exists")
    
    new_subject = Subject(**subject.model_dump())
    await db.subjects.insert_one(new_subject.model_dump())
    return new_subject

@api_router.put("/subjects/{subject_id}", response_model=Subject)
async def update_subject(subject_id: str, subject_update: SubjectCreate):
    """Update a subject"""
    existing = await db.subjects.find_one({"id": subject_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check if new code conflicts with another subject
    code_conflict = await db.subjects.find_one({
        "code": subject_update.code,
        "id": {"$ne": subject_id}
    })
    if code_conflict:
        raise HTTPException(status_code=400, detail="Subject code already exists")
    
    updated_data = subject_update.model_dump()
    await db.subjects.update_one({"id": subject_id}, {"$set": updated_data})
    
    updated_subject = await db.subjects.find_one({"id": subject_id}, {"_id": 0})
    return updated_subject

@api_router.delete("/subjects/{subject_id}")
async def delete_subject(subject_id: str):
    """Delete a subject and its related results"""
    result = await db.subjects.delete_one({"id": subject_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Also delete all results for this subject
    await db.results.delete_many({"subject_id": subject_id})
    
    return {"message": "Subject deleted successfully"}

# ===================== RESULTS ROUTES =====================

@api_router.get("/results/student/{student_id}", response_model=StudentResult)
async def get_student_results(student_id: str):
    """Get complete results for a student with calculated grade"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    results = await db.results.find({"student_id": student_id}, {"_id": 0}).to_list(1000)
    
    # Fetch subject details for each result
    enriched_results = []
    total_marks = 0
    max_total_marks = 0
    
    for result in results:
        subject = await db.subjects.find_one({"id": result["subject_id"]}, {"_id": 0})
        if subject:
            enriched_results.append({
                "id": result["id"],
                "subject_name": subject["name"],
                "subject_code": subject["code"],
                "marks": result["marks"],
                "max_marks": subject["max_marks"]
            })
            total_marks += result["marks"]
            max_total_marks += subject["max_marks"]
    
    percentage = (total_marks / max_total_marks * 100) if max_total_marks > 0 else 0
    grade, result_status, grade_description = calculate_grade(percentage)
    
    return StudentResult(
        student=Student(**student),
        results=enriched_results,
        total_marks=total_marks,
        max_total_marks=max_total_marks,
        percentage=round(percentage, 2),
        grade=grade,
        result=result_status,
        grade_description=grade_description
    )

@api_router.post("/results", response_model=ResultEntry)
async def create_or_update_result(result: ResultEntryCreate):
    """Create or update a result entry"""
    # Verify student exists
    student = await db.students.find_one({"id": result.student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Verify subject exists
    subject = await db.subjects.find_one({"id": result.subject_id}, {"_id": 0})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Validate marks
    if result.marks < 0 or result.marks > subject["max_marks"]:
        raise HTTPException(
            status_code=400,
            detail=f"Marks must be between 0 and {subject['max_marks']}"
        )
    
    # Check if result already exists
    existing = await db.results.find_one({
        "student_id": result.student_id,
        "subject_id": result.subject_id
    })
    
    if existing:
        # Update existing result
        await db.results.update_one(
            {"student_id": result.student_id, "subject_id": result.subject_id},
            {"$set": {"marks": result.marks, "subject_name": subject["name"], "subject_code": subject["code"]}}
        )
        updated = await db.results.find_one(
            {"student_id": result.student_id, "subject_id": result.subject_id},
            {"_id": 0}
        )
        return updated
    else:
        # Create new result
        new_result = ResultEntry(
            **result.model_dump(),
            subject_name=subject["name"],
            subject_code=subject["code"]
        )
        await db.results.insert_one(new_result.model_dump())
        return new_result

@api_router.get("/results/all")
async def get_all_results():
    """Get all students with their results"""
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    all_results = []
    
    for student in students:
        try:
            result = await get_student_results(student["id"])
            all_results.append(result.model_dump())
        except:
            continue
    
    return all_results

# ===================== DASHBOARD ROUTES =====================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_students = await db.students.count_documents({})
    total_subjects = await db.subjects.count_documents({})
    
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    
    passed_students = 0
    failed_students = 0
    total_percentage = 0
    students_with_results = 0
    
    for student in students:
        results = await db.results.find({"student_id": student["id"]}, {"_id": 0}).to_list(1000)
        
        if results:
            students_with_results += 1
            total_marks = sum(r["marks"] for r in results)
            
            # Calculate max marks
            max_total = 0
            for result in results:
                subject = await db.subjects.find_one({"id": result["subject_id"]}, {"_id": 0})
                if subject:
                    max_total += subject["max_marks"]
            
            if max_total > 0:
                percentage = (total_marks / max_total * 100)
                total_percentage += percentage
                
                _, result_status, _ = calculate_grade(percentage)
                if result_status == "Pass":
                    passed_students += 1
                else:
                    failed_students += 1
    
    average_percentage = (total_percentage / students_with_results) if students_with_results > 0 else 0
    
    return DashboardStats(
        total_students=total_students,
        total_subjects=total_subjects,
        passed_students=passed_students,
        failed_students=failed_students,
        average_percentage=round(average_percentage, 2)
    )

# ===================== EXPORT ROUTES =====================

@api_router.get("/export/csv")
async def export_results_csv():
    """Export all results to CSV"""
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Roll No", "Student Name", "Class", "Email", "Phone", "Total Marks", "Max Marks", "Percentage", "Grade", "Result"])
    
    for student in students:
        results = await db.results.find({"student_id": student["id"]}, {"_id": 0}).to_list(1000)
        
        if results:
            total_marks = sum(r["marks"] for r in results)
            max_total = 0
            
            for result in results:
                subject = await db.subjects.find_one({"id": result["subject_id"]}, {"_id": 0})
                if subject:
                    max_total += subject["max_marks"]
            
            percentage = (total_marks / max_total * 100) if max_total > 0 else 0
            grade, result_status, _ = calculate_grade(percentage)
            
            writer.writerow([
                student["roll_no"],
                student["name"],
                student["class_name"],
                student["email"],
                student["phone"],
                total_marks,
                max_total,
                f"{percentage:.2f}%",
                grade,
                result_status
            ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_results.csv"}
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
