# Fake News Detection Web Application

A full-stack web application for detecting fake news using machine learning models.

## Team Members
- Luke Heron - 104244899
- Robin Kim - 105258655
- Ned Tonks - 104468000

Session 26 - Group 1  
Tutor: Jianwen Liu

## Prerequisites
- Python 3.10+
- Node.js 16+
- npm

## Project Structure
```
project/
├── frontend/           # React.js application
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── backend/            # FastAPI server
│   ├── main.py
│   └── requirements.txt
├── models/             # Trained ML models (.pkl files)
└── README.md
```

## Tech Stack
- **Frontend**: React.js 18, Chart.js, Axios
- **Backend**: FastAPI, Python 3.10
- **AI Models**: Logistic Regression, Random Forest, KNN (from Assignment 2)
- **ML Libraries**: Scikit-learn 1.6.1, NumPy 2.0.2, Pandas 2.2.3

## Required Libraries

### Backend (Python)
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.4.2
scikit-learn==1.6.1
numpy==2.0.2
pandas==2.2.3
python-multipart==0.0.6
```

### Frontend (Node.js)
```
react==18.2.0
react-dom==18.2.0
axios==1.6.0
chart.js==4.4.0
react-chartjs-2==5.2.0
```

## AI Model Integration Setup

### Step 1: Place Model Files
Ensure these 5 pickle files are in the `models/` directory:
- `logistic_regression_model.pkl`
- `random_forest_model.pkl`
- `knn_model.pkl`
- `tfidf_vectorizer.pkl`
- `scaler.pkl`

### Step 2: Verify Model Path
The backend `main.py` loads models from `../models/` relative to the backend directory.

## Setup Instructions

### 1. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

Backend will run at: **http://localhost:8000**

### 2. Frontend Setup (New Terminal)
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run at: **http://localhost:3000**

## Running the Application

1. **Start Backend** (Terminal 1):
   - Navigate to `backend/`
   - Activate virtual environment
   - Run `uvicorn main:app --reload`

2. **Start Frontend** (Terminal 2):
   - Navigate to `frontend/`
   - Run `npm start`

3. **Access Application**:
   - Open browser to http://localhost:3000
   - Backend API docs available at http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check and model status |
| POST | `/predict` | Classify text as fake/real news |
| GET | `/stats` | Get prediction statistics |

### Example POST /predict Request
```json
{
  "text": "Your news article text here",
  "model_choice": "rf"
}
```

Model choices: `"lr"` (Logistic Regression), `"rf"` (Random Forest), `"knn"` (K-Nearest Neighbors)

## Features
- Real-time fake news classification
- Three ML model comparison
- Interactive visualizations (Pie, Bar, Dot Plot charts)
- Confidence score display
- Text feature analysis
- Responsive design

## Troubleshooting

**Issue: "Module not found" errors**
```bash
# Backend:
pip install -r requirements.txt

# Frontend:
npm install
```

**Issue: Port already in use**
```bash
# Windows - Kill process on port 8000:
netstat -ano | findstr :8000
taskkill /PID <number> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

**Issue: Models won't load**
- Verify all 5 .pkl files are in `models/` folder
- Check file paths in `main.py`

**Issue: CORS errors**
- Ensure backend is running on port 8000
- Ensure frontend is running on port 3000

## Project Report
For detailed system architecture, implementation details, and technical discussion, see `Assignment3_Report.pdf`