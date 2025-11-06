# Fake News Detection Web Application

A full-stack web application for detecting fake news using machine learning models.

## Project Structure
```
project/
├── frontend/           # React.js application
├── backend/            # FastAPI server
├── models/             # Trained ML models
└── README.md
```

## Tech Stack
- **Frontend**: React.js with Chart.js/D3.js for visualizations
- **Backend**: FastAPI (Python)
- **AI Model**: Logistic Regression, Random Forest, KNN (from Assignment 2)

## Setup Instructions

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints
- `POST /predict` - Predict if text is fake news
- `GET /stats` - Get model statistics
- `GET /health` - Health check

## Team Members
[Add your team member names here]