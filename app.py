from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
from bs4 import BeautifulSoup
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle

app = Flask(__name__)
CORS(app)

# Placeholder for collected data storage (you can replace with a database later)
collected_data = []

# Initialize Sentiment Analyzers
vader_analyzer = SentimentIntensityAnalyzer()

# Initialize Dummy Prediction Model (Naive Bayes Classifier)
vectorizer = CountVectorizer()
model = MultinomialNB()

# Dummy training data for demonstration
dummy_texts = ['This is great!', 'I hate this', 'It is okay', 'I love it', 'This is bad']
dummy_labels = [1, 0, 1, 1, 0]

# Train the model on dummy data
X_train = vectorizer.fit_transform(dummy_texts)
model.fit(X_train, dummy_labels)

# Save the model (if needed)
with open('sentiment_model.pkl', 'wb') as f:
    pickle.dump((vectorizer, model), f)


@app.route('/collect', methods=['POST'])
def collect_data():
    data = request.json
    if not data or 'url' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    url = data['url']
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        text_content = soup.get_text(separator=' ')
        collected_data.append(text_content)
        return jsonify({'message': 'Data collected successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/analyze', methods=['POST'])
def analyze_data():
    data = request.json
    if not data or 'content' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    content = data['content']

    # VADER Sentiment Analysis
    vader_scores = vader_analyzer.polarity_scores(content)
    vader_sentiment = 'Positive' if vader_scores['compound'] >= 0.05 else 'Negative' if vader_scores[
                                                                                            'compound'] <= -0.05 else 'Neutral'

    # TextBlob Sentiment Analysis
    textblob_analysis = TextBlob(content)
    textblob_sentiment = 'Positive' if textblob_analysis.sentiment.polarity > 0 else 'Negative' if textblob_analysis.sentiment.polarity < 0 else 'Neutral'

    # Combine Results
    combined_sentiment = {
        'vader': vader_sentiment,
        'vader_scores': vader_scores,
        'textblob': textblob_sentiment,
        'textblob_polarity': textblob_analysis.sentiment.polarity
    }

    return jsonify(combined_sentiment)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data or 'content' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    content = data['content']

    # Prepare content for prediction
    X_new = vectorizer.transform([content])
    prediction = model.predict(X_new)[0]

    prediction_result = 'Positive' if prediction == 1 else 'Negative'

    return jsonify({'prediction': prediction_result})


if __name__ == '__main__':
    app.run(debug=True)
