# 📚 Student Result Management System (SRMS)

A comprehensive web-based Student Result Management System built with modern technologies to efficiently manage student records, subjects, and examination results.

## 🎯 Project Overview

The **Student Result Management System (SRMS)** is a full-stack web application designed to help educational institutions manage student data, subject information, and examination results efficiently. The system features an intuitive admin dashboard with statistics, student search functionality, printable report cards, and CSV export capabilities.

## ✨ Key Features

### 🔐 Authentication
- **Secure Admin Login** - JWT-based authentication system
- **Session Management** - Persistent login with token validation
- **Default Admin Credentials**:
  - Username: `admin`
  - Password: `vikrant123`

### 👥 Student Management
- **Add New Students** - Create student records with roll number, name, class, email, and phone
- **Edit Student Details** - Update existing student information
- **Delete Students** - Remove students along with their results
- **Search Functionality** - Quick search by student name or roll number
- **View Report Cards** - Generate detailed student performance reports

### 📖 Subject Management
- **Add Subjects** - Create subjects with code, name, and maximum marks
- **Edit Subject Details** - Modify existing subject information
- **Delete Subjects** - Remove subjects and associated results
- **Flexible Marking System** - Support for different maximum marks per subject

### 📝 Results Management
- **Enter Marks** - Add or update marks for students across multiple subjects
- **Automatic Calculations** - Auto-compute percentage, grade, and pass/fail status
- **Subject-wise Performance** - Track individual subject marks
- **Printable Report Cards** - Professional, printer-friendly student reports

### 📊 Dashboard & Analytics
- **Statistics Overview** - Total students, subjects, pass/fail counts
- **Visual Charts** - Pie chart showing pass/fail distribution
- **Average Performance** - Class-wide percentage calculations
- **Pass/Fail Rates** - Percentage-based performance metrics

### 📥 Export Functionality
- **CSV Export** - Download all student results in CSV format
- **Bulk Data Export** - Export complete result data for analysis

### 🎓 Grading System
The system uses the following grading criteria:
- **90-100%** → A+ Grade → Distinction
- **75-89%** → A Grade → First Class
- **60-74%** → B Grade → Second Class
- **45-59%** → C Grade → Pass Class
- **Below 45%** → F Grade → Fail

### 🎨 UI/UX Features
- **Modern Glassmorphism Design** - Beautiful, translucent card-based UI
- **Purple/Indigo Theme** - Professional color scheme with dark sidebar
- **Responsive Layout** - Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations** - Hover effects and transitions for better UX
- **Color-Coded Badges** - Visual grade representation (Green, Blue, Yellow, Red)
- **Chart.js Integration** - Interactive charts and data visualizations

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (with Motor async driver)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Data Validation**: Pydantic
- **API Documentation**: Auto-generated with FastAPI

### Frontend
- **Framework**: React 19
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Chart.js + react-chartjs-2
- **Styling**: Vanilla CSS (no frameworks)
- **Fonts**: Google Fonts (Inter, Manrope)

### DevOps
- **Process Management**: Supervisor
- **Hot Reload**: Enabled for both frontend and backend
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Managed via .env files

## 📂 Project Structure

```
student-result-management/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── .env                   # Backend environment variables
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Login.js       # Admin login page
│   │   │   ├── Layout.js      # Main layout with sidebar
│   │   │   ├── Dashboard.js   # Dashboard with statistics
│   │   │   ├── Students.js    # Student management
│   │   │   ├── Subjects.js    # Subject management
│   │   │   ├── Results.js     # Marks entry system
│   │   │   └── StudentReport.js # Report card view
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # Global styles
│   │   └── index.js           # Entry point
│   ├── package.json           # Node.js dependencies
│   └── .env                   # Frontend environment variables
└── README.md                  # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- MongoDB (installed and running)
- Yarn package manager

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd student-result-management
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Verify .env file exists with correct MongoDB connection
# The .env file should contain:
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=student_result_db
# CORS_ORIGINS=*
```

### Step 3: Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install Node.js dependencies
yarn install

# Verify .env file exists with backend URL
# The .env file should contain:
# REACT_APP_BACKEND_URL=<your-backend-url>
```

### Step 4: Start MongoDB
```bash
# Make sure MongoDB is running on localhost:27017
# On Linux/Mac:
sudo systemctl start mongodb

# On Windows:
net start MongoDB
```

### Step 5: Run the Application

**Option 1: Using Supervisor (Recommended)**
```bash
# The application uses supervisor for process management
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Check status
sudo supervisorctl status
```

**Option 2: Manual Start (Development)**
```bash
# Terminal 1 - Start Backend
cd backend
python server.py

# Terminal 2 - Start Frontend
cd frontend
yarn start
```

### Step 6: Access the Application
- **Frontend**: Open your browser and navigate to the URL shown in terminal
- **Backend API**: Available at `<BACKEND_URL>/api`
- **API Documentation**: Visit `<BACKEND_URL>/docs` for interactive API docs

## 🔑 Default Login Credentials

When you run the application for the first time, it automatically creates:
- **Username**: `admin`
- **Password**: `vikrant123`

## 📊 Sample Data

The application automatically seeds the database with sample data on first run:
- **4 Sample Students** (BCA 1st & 2nd Year)
- **Sample Subjects** (Mathematics, Physics, Chemistry, English, Computer Science)
- **Sample Results** for all students across all subjects

You can delete this data and add your own once the application is running.

## 🎯 Usage Guide

### 1. Login
- Navigate to the login page
- Enter credentials (admin / vikrant123)
- Click "Sign In"

### 2. Dashboard
- View total students, subjects, pass/fail counts
- Analyze pass/fail distribution via pie chart
- Check average class percentage
- Export all results to CSV

### 3. Managing Students
- Click "Students" in sidebar
- **Add**: Click "+ Add Student" button
- **Edit**: Click edit icon (✏️) on student row
- **Delete**: Click delete icon (🗑️) on student row
- **Search**: Use search bar to find students quickly
- **View Report**: Click report icon (📄) to view student report card

### 4. Managing Subjects
- Click "Subjects" in sidebar
- **Add**: Click "+ Add Subject" button
- **Edit**: Click edit icon (✏️) on subject row
- **Delete**: Click delete icon (🗑️) on subject row

### 5. Entering Results
- Click "Results" in sidebar
- Select a student from dropdown
- Enter marks for each subject
- Click "Save Results"

### 6. Viewing Report Cards
- Navigate to Students page
- Click report icon (📄) next to student name
- View complete report with grades and percentage
- Click "Print Report" to print or save as PDF

## 🖨️ Printing Report Cards

The report cards are printer-friendly:
1. Click "Print Report" button on report page
2. Browser print dialog will open
3. Adjust settings (paper size, orientation)
4. Print or Save as PDF

## 📤 Exporting Data

To export all student results:
1. Go to Dashboard
2. Click "Export Results to CSV"
3. CSV file will download automatically
4. Open in Excel, Google Sheets, or any CSV viewer

## 🎨 Design Highlights

- **Glassmorphism UI** - Modern, translucent cards with backdrop blur
- **Purple/Indigo Theme** - Professional color palette
- **Dark Sidebar** - Clean navigation with active state indicators
- **Responsive Design** - Mobile-friendly layout
- **Smooth Animations** - Hover effects on buttons and cards
- **Color-Coded Grades** - Visual feedback (Green=A+, Blue=A, Yellow=B, Red=F)
- **Chart Visualizations** - Interactive pie and bar charts

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=student_result_db
CORS_ORIGINS=*
JWT_SECRET=vikrant-secret-key-2024-srms
```

### Frontend Environment Variables (.env)
```env
REACT_APP_BACKEND_URL=<your-backend-url>
```

## 🐛 Troubleshooting

### Backend Issues
**Problem**: Database connection error
```bash
# Solution: Make sure MongoDB is running
sudo systemctl status mongodb
```

**Problem**: Module not found
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues
**Problem**: API connection failed
```bash
# Solution: Verify REACT_APP_BACKEND_URL in .env file
# Make sure backend server is running
```

**Problem**: Blank screen
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
yarn install
yarn start
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token

### Students
- `GET /api/students` - Get all students (with optional search)
- `GET /api/students/{id}` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/{id}` - Get subject by ID
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/{id}` - Update subject
- `DELETE /api/subjects/{id}` - Delete subject

### Results
- `GET /api/results/student/{id}` - Get student results
- `POST /api/results` - Create/update result
- `GET /api/results/all` - Get all results

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Export
- `GET /api/export/csv` - Export results to CSV

## 🚀 Future Enhancements

- Multi-admin support with role-based access
- Student portal for viewing own results
- Email notifications for result publication
- Bulk student import via CSV
- Advanced analytics and reports
- Attendance management
- Fee management integration
- Parent login and notifications

## 👨‍💻 About the Developer

**Vikrant Rana**
- 🎓 BCA Aspirant
- 📍 Location: Delhi, India
- 💼 Role: Full Stack Developer
- 🎯 Passion: Building educational technology solutions

This project was developed as part of academic learning and to showcase full-stack development skills using modern web technologies.

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- FastAPI community for excellent documentation
- React team for the amazing framework
- Chart.js for beautiful visualizations
- MongoDB for the robust database solution

---

## 📞 Support

For any issues, questions, or suggestions, please:
1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Create an issue in the repository

---

**Built with ❤️ by Vikrant Rana | © 2024 Student Result Management System**
