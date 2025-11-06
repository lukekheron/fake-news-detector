import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './app.css';

// (for charting)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = 'http://localhost:8000';

function App() {
  const [text, setText] = useState('');
  const [modelChoice, setModelChoice] = useState('rf');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [result]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // input validation
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }
    
    if (text.length < 10) {
      setError('Text must be at least 10 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/predict`, {
        text: text,
        model_choice: modelChoice
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError('');
  };

  // chart 1: Prediction Distribution (Pie Chart)
  const pieChartData = stats ? {
    labels: ['Fake News', 'Real News'],
    datasets: [
      {
        label: 'Predictions',
        data: [stats.fake_count, stats.real_count],
        backgroundColor: ['#e74c3c', '#2ecc71'],
        borderColor: ['#c0392b', '#27ae60'],
        borderWidth: 2,
      },
    ],
  } : null;

  // Chart 2: recent Predictions Confidence (Bar Chart)
  const barChartData = stats?.recent_predictions ? {
    labels: stats.recent_predictions.map((_, idx) => `Pred ${idx + 1}`),
    datasets: [
      {
        label: 'Confidence Level',
        data: stats.recent_predictions.map(p => (p.confidence * 100).toFixed(1)),
        backgroundColor: stats.recent_predictions.map(p => 
          p.prediction === 'Fake News' ? '#e74c3c' : '#2ecc71'
        ),
        borderColor: stats.recent_predictions.map(p => 
          p.prediction === 'Fake News' ? '#c0392b' : '#27ae60'
        ),
        borderWidth: 2,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fake News Detector</h1>
        <p>Analyze news articles using AI-powered detection</p>
      </header>

      <div className="container">
        {/* Input Form */}
        <div className="card">
          <h2>Enter Text to Analyze</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="text-input">News Text:</label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste news article or text here..."
                rows="8"
                className="text-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="model-select">Select Model:</label>
              <select
                id="model-select"
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="model-select"
              >
                <option value="lr">Logistic Regression</option>
                <option value="rf">Random Forest</option>
                <option value="knn">K-Nearest Neighbors</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </button>
              <button type="button" onClick={handleClear} className="btn btn-secondary">
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Results Display */}
        {result && (
          <div className="card results-card">
            <h2>Analysis Results</h2>
            <div className={`result-box ${result.prediction === 'Fake News' ? 'fake' : 'real'}`}>
              <div className="prediction-label">{result.prediction}</div>
              <div className="confidence">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </div>
              <div className="model-used">Model: {result.model_used}</div>
            </div>

            <div className="features-box">
              <h3>Text Features</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-label">Word Count:</span>
                  <span className="feature-value">{result.features.word_count}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Character Count:</span>
                  <span className="feature-value">{result.features.char_count}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Avg Word Length:</span>
                  <span className="feature-value">{result.features.avg_word_length.toFixed(2)}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Exclamations:</span>
                  <span className="feature-value">{result.features.exclamation_count}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* visualizations */}
        {stats && stats.total_predictions > 0 && (
          <div className="charts-container">
            <div className="card chart-card">
              <h3>Prediction Distribution</h3>
              <div className="chart-wrapper">
                {pieChartData && <Pie data={pieChartData} options={chartOptions} />}
              </div>
              <div className="stats-summary">
                <p>Total Predictions: <strong>{stats.total_predictions}</strong></p>
                <p>Average Confidence: <strong>{(stats.average_confidence * 100).toFixed(1)}%</strong></p>
              </div>
            </div>

            <div className="card chart-card">
              <h3>Recent Predictions Confidence</h3>
              <div className="chart-wrapper">
                {barChartData && <Bar data={barChartData} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Confidence %'
                      }
                    }
                  }
                }} />}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="App-footer">
        <p>Built with React.js & FastAPI | AI Model from Assignment 2</p>
      </footer>
    </div>
  );
}

export default App;