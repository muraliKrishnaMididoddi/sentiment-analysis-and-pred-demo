
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const App = () => {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState([]);
  const [predictionResult, setPredictionResult] = useState('');

  const handleCollect = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error collecting data.');
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));

      // Prepare data for visualization
      const analysisResult = [
        { name: 'Positive', value: data.vader_scores.pos },
        { name: 'Negative', value: data.vader_scores.neg },
        { name: 'Neutral', value: data.vader_scores.neu }
      ];
      setAnalysisData(analysisResult);
    } catch (error) {
      setResult('Error analyzing data.');
    }
    setLoading(false);
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      setPredictionResult(data.prediction);
    } catch (error) {
      setResult('Error making prediction.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Web Data Collector */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Web Data Collector</h2>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter URL to scrape"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
            onClick={handleCollect}
            disabled={loading}
          >
            {loading ? 'Collecting...' : 'Collect Data'}
          </button>
        </div>

        {/* Sentiment Analysis & Prediction */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Sentiment Analysis & Prediction</h2>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows={5}
            placeholder="Enter content for analysis"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="space-x-4 mb-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? 'Predicting...' : 'Make Prediction'}
            </button>
          </div>
          <div className="text-lg mb-2">Prediction Result: {predictionResult}</div>
        </div>

        {/* Visualization Section */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Visualization</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analysisData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Displaying Results */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <pre className="p-4 bg-gray-50 border rounded whitespace-pre-wrap break-words">
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default App;
