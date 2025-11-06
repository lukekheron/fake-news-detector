from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
import re
from sklearn.feature_extraction.text import TfidfVectorizer

app = FastAPI(title="Fake News Detection API")

# needed for react
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ML integration
models = {}
vectorizer = None
scaler = None
prediction_history = []

# Change which model is selected
class PredictionRequest(BaseModel):
    text: str
    model_choice: Optional[str] = "rf"  # 'lr', 'rf', or 'knn'


# use these when displaying output
class PredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    prediction: str
    confidence: float
    model_used: str
    timestamp: str
    features: dict

# load models on startup
@app.on_event("startup")
async def load_models():
    global models, vectorizer, scaler
    try:
        # Load all three models
        with open('../models/logistic_regression_model.pkl', 'rb') as f:
            models['lr'] = pickle.load(f)
        
        with open('../models/random_forest_model.pkl', 'rb') as f:
            models['rf'] = pickle.load(f)
        
        with open('../models/knn_model.pkl', 'rb') as f:
            models['knn'] = pickle.load(f)
        
        # Load vectorizer and scaler
        with open('../models/tfidf_vectorizer.pkl', 'rb') as f:
            vectorizer = pickle.load(f)
        
        with open('../models/scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        
        print("All models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {e}")
        raise

# text preprocessing function (from Assignment 2), OUR MODELS ARE TRAINED ON PRE PROCESSED TEXT
def preprocess_text(text):
    """Clean and preprocess text"""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\@\w+|\#', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = ' '.join(text.split())
    return text

def extract_features(text):
    """Extract basic features from text"""
    words = text.split()
    return {
        'word_count': len(words),
        'char_count': len(text),
        'avg_word_length': np.mean([len(word) for word in words]) if words else 0,
        'exclamation_count': text.count('!'),
        'question_count': text.count('?'),
        'uppercase_ratio': sum(1 for c in text if c.isupper()) / len(text) if text else 0,
        'digit_count': sum(c.isdigit() for c in text),
        'unique_word_ratio': len(set(words)) / len(words) if words else 0,
        'sentence_count': text.count('.') + text.count('!') + text.count('?'),
        'avg_sentence_length': len(words) / max(1, text.count('.') + text.count('!') + text.count('?'))
    }


# BASIC FASTAPI REQUIRED FOR ASSIGNMENT (see sheet)
@app.get("/")
async def root():
    return {
        "message": "Fake News Detection API",
        "version": "1.0.0",
        "endpoints": {
            "/predict": "POST - Predict if text is fake news",
            "/stats": "GET - Get prediction statistics",
            "/health": "GET - Health check"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try: # processing input from website
        if request.model_choice not in models:
            raise HTTPException(status_code=400, detail=f"Invalid model choice. Choose from: {list(models.keys())}")
        
        # preprocess text
        clean_text = preprocess_text(request.text)
        
        # extract features
        # Extract basic features
        basic_features = extract_features(clean_text)
        feature_array = np.array(list(basic_features.values())).reshape(1, -1)

        # TF-IDF features
        tfidf_features = vectorizer.transform([clean_text])

        # Combine features FIRST (before scaling)
        X_combined = np.hstack([feature_array, tfidf_features.toarray()])

        # Then scale the combined features (if your scaler was fitted on combined features)
        # OR skip scaling entirely for tree-based models
        try:
            X = scaler.transform(X_combined)
        except:
            # If scaler fails, use unscaled features (Random Forest doesn't need scaling)
            X = X_combined
        
        # get model
        model = models[request.model_choice]
        
        # predict
        prediction = model.predict(X)[0]
        probability = model.predict_proba(X)[0]
        
        # format response
        result = PredictionResponse(
            prediction="Fake News" if prediction == 1 else "Real News",
            confidence=float(max(probability)),
            model_used=request.model_choice.upper(),
            timestamp=datetime.now().isoformat(),
            features=basic_features
        )
        
        # Store in history (for HD graphs etc)
        prediction_history.append({
            "prediction": result.prediction,
            "confidence": result.confidence,
            "timestamp": result.timestamp
        })
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    if not prediction_history:
        return {
            "total_predictions": 0,
            "fake_count": 0,
            "real_count": 0,
            "average_confidence": 0
        }
    
    fake_count = sum(1 for p in prediction_history if p["prediction"] == "Fake News")
    real_count = len(prediction_history) - fake_count
    avg_confidence = np.mean([p["confidence"] for p in prediction_history])
    
    return {
        "total_predictions": len(prediction_history),
        "fake_count": fake_count,
        "real_count": real_count,
        "average_confidence": float(avg_confidence),
        "recent_predictions": prediction_history[-10:]  # Last 10 predictions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)