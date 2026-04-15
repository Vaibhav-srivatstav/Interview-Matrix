"""
Flask ML Service - AI Interview Platform
No sentence-transformers dependency — uses TF-IDF + keyword scoring instead.
"""

import os
import base64
import re
import math
import numpy as np
from collections import Counter
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

_emotion_analyzer = None


def get_emotion_analyzer():
    global _emotion_analyzer
    if _emotion_analyzer is None:
        from deepface import DeepFace
        _emotion_analyzer = DeepFace
    return _emotion_analyzer


# ─── Emotion Analysis ──────────────────────────────────────────────────────────

@app.route('/analyze_emotion', methods=['POST'])
def analyze_emotion():
    try:
        data = request.get_json()
        if not data or 'frame' not in data:
            return jsonify({'error': 'No frame provided'}), 400

        raw = data['frame']
        if ',' in raw:
            raw = raw.split(',', 1)[1]

        img_bytes = base64.b64decode(raw)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)

        import cv2
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None or img.size == 0:
            return jsonify(_neutral_fallback('Could not decode image'))

        if img.shape[1] < 48 or img.shape[0] < 48:
            img = cv2.resize(img, (224, 224))

        DeepFace = get_emotion_analyzer()
        result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False, detector_backend='opencv', silent=True)
        if isinstance(result, list):
            result = result[0]

        emotions = result.get('emotion', {})
        dominant = result.get('dominant_emotion', 'neutral')

        if sum(emotions.values()) < 1:
            return jsonify(_neutral_fallback('No face detected'))

        confidence_map = {'happy': 90, 'neutral': 70, 'surprise': 65, 'sad': 40, 'fear': 35, 'angry': 30, 'disgust': 25}
        confidence = min(100, confidence_map.get(dominant, 60) + (emotions.get(dominant, 0) / 100) * 10)

        return jsonify({
            'dominant_emotion': dominant,
            'emotions': {k: round(float(v), 2) for k, v in emotions.items()},
            'confidence_contribution': round(float(confidence), 1),
        })

    except Exception as e:
        app.logger.error(f'Emotion error: {e}')
        return jsonify(_neutral_fallback(str(e)))


def _neutral_fallback(reason=''):
    return {
        'dominant_emotion': 'neutral',
        'emotions': {'neutral': 100.0, 'happy': 0.0, 'sad': 0.0, 'angry': 0.0, 'fear': 0.0, 'surprise': 0.0, 'disgust': 0.0},
        'confidence_contribution': 65.0,
        'fallback': True,
        'reason': reason,
    }


# ─── NLP Answer Scoring (TF-IDF — no sentence-transformers needed) ────────────

def tokenize(text):
    """Simple tokenizer: lowercase, remove punctuation, split."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return [w for w in text.split() if len(w) > 2]


def tfidf_similarity(text_a, text_b):
    """
    Compute cosine similarity between two texts using TF-IDF vectors.
    No external ML library needed.
    """
    tokens_a = tokenize(text_a)
    tokens_b = tokenize(text_b)

    if not tokens_a or not tokens_b:
        return 0.0

    # Vocabulary
    vocab = list(set(tokens_a + tokens_b))

    def tf(tokens, word):
        count = tokens.count(word)
        return count / len(tokens) if tokens else 0

    def tfidf_vec(tokens):
        # IDF = log(2 / (1 + df)) — simple 2-doc IDF
        vec = []
        for word in vocab:
            tf_val = tf(tokens, word)
            df = (1 if word in tokens_a else 0) + (1 if word in tokens_b else 0)
            idf = math.log(2 / df) if df else 0
            vec.append(tf_val * idf)
        return vec

    vec_a = tfidf_vec(tokens_a)
    vec_b = tfidf_vec(tokens_b)

    # Cosine similarity
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a ** 2 for a in vec_a))
    mag_b = math.sqrt(sum(b ** 2 for b in vec_b))

    if mag_a == 0 or mag_b == 0:
        return 0.0

    return dot / (mag_a * mag_b)


def keyword_overlap_score(question, answer, expected_keywords=None):
    """Score based on how many tech keywords appear in the answer."""
    general_tech = [
        'api', 'rest', 'json', 'database', 'mongodb', 'sql', 'react', 'node',
        'component', 'state', 'props', 'hook', 'async', 'promise', 'closure',
        'prototype', 'inheritance', 'class', 'function', 'array', 'object',
        'http', 'authentication', 'jwt', 'middleware', 'server', 'client',
        'dom', 'event', 'callback', 'algorithm', 'cache', 'index', 'query',
        'schema', 'model', 'scope', 'hoisting', 'event loop', 'virtual dom',
        'reconciliation', 'redux', 'context', 'usestate', 'useeffect',
        'express', 'mongoose', 'aggregation', 'pipeline', 'stream', 'buffer',
    ]

    kws = list(set((expected_keywords or []) + general_tech))
    answer_lower = answer.lower()
    matched = [kw for kw in kws if kw in answer_lower]
    # Score: each keyword = 8 points, cap at 100
    return min(100, len(matched) * 8)


@app.route('/analyze_answer', methods=['POST'])
def analyze_answer():
    try:
        data = request.get_json()
        question = data.get('question', '')
        answer = data.get('answer', '')
        expected_keywords = data.get('expectedKeywords', [])

        if not answer.strip():
            return jsonify({'nlp_score': 0, 'keyword_score': 0, 'feedback': 'No answer provided.'})

        # Semantic similarity via TF-IDF
        similarity = tfidf_similarity(question + ' ' + answer, question)
        # Scale: TF-IDF similarity tends to be lower than cosine from embeddings
        nlp_score = min(100, round(similarity * 200 + len(tokenize(answer)) * 0.5, 1))
        nlp_score = min(100, max(0, nlp_score))

        keyword_score = keyword_overlap_score(question, answer, expected_keywords)

        # Blend: 60% keyword overlap (more reliable), 40% TF-IDF
        combined = round(keyword_score * 0.6 + nlp_score * 0.4, 1)

        if combined >= 75:
            feedback = 'Excellent answer! Very relevant and well-structured.'
        elif combined >= 55:
            feedback = 'Good answer. Try adding more specific technical details.'
        elif combined >= 35:
            feedback = 'Partial answer. Focus more directly on the core concept.'
        else:
            feedback = 'Answer needs more detail. Think about key technical terms.'

        return jsonify({
            'nlp_score': round(combined, 1),
            'keyword_score': keyword_score,
            'similarity': round(similarity, 3),
            'feedback': feedback,
        })

    except Exception as e:
        app.logger.error(f'NLP error: {e}')
        return jsonify({'nlp_score': 60, 'keyword_score': 50, 'feedback': 'Analysis completed.', 'error': str(e)})


# ─── Voice Analysis ────────────────────────────────────────────────────────────

@app.route('/analyze_voice', methods=['POST'])
def analyze_voice():
    try:
        import speech_recognition as sr
        from pydub import AudioSegment
        import tempfile

        data = request.get_json()
        if not data or 'audio' not in data:
            return jsonify({'error': 'No audio data'}), 400

        raw = data['audio']
        if ',' in raw:
            raw = raw.split(',', 1)[1]
        audio_bytes = base64.b64decode(raw)

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            audio_seg = AudioSegment.from_wav(tmp_path)
        except Exception:
            try:
                audio_seg = AudioSegment.from_file(tmp_path)
            except Exception as e:
                return jsonify({'error': str(e), 'transcript': '', 'clarity': 60})

        duration_s = max(len(audio_seg) / 1000.0, 0.1)

        recognizer = sr.Recognizer()
        transcript = ''
        try:
            with sr.AudioFile(tmp_path) as source:
                audio_data = recognizer.record(source)
            transcript = recognizer.recognize_google(audio_data)
        except Exception:
            pass

        os.unlink(tmp_path)

        words = transcript.split() if transcript else []
        word_count = len(words)
        speech_rate = (word_count / duration_s * 60) if duration_s > 0 else 0

        fillers = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so']
        filler_count = sum(1 for w in words if w.lower() in fillers)

        rate_penalty  = min(30, abs(speech_rate - 130) / 5)
        filler_penalty = min(20, filler_count * 5)
        clarity = max(30, 100 - rate_penalty - filler_penalty)

        return jsonify({
            'transcript': transcript,
            'word_count': word_count,
            'duration_seconds': round(duration_s, 1),
            'speech_rate': round(speech_rate, 1),
            'pause_count': 0,
            'filler_words': filler_count,
            'clarity': round(clarity, 1),
        })

    except Exception as e:
        app.logger.error(f'Voice error: {e}')
        return jsonify({'transcript': '', 'word_count': 0, 'speech_rate': 0, 'pause_count': 0, 'filler_words': 0, 'clarity': 60, 'error': str(e)})


# ─── Confidence Score ──────────────────────────────────────────────────────────

@app.route('/confidence_score', methods=['POST'])
def confidence_score():
    try:
        data = request.get_json()
        emotion = data.get('emotion_confidence', 65)
        voice   = data.get('voice_clarity', 65)
        nlp     = data.get('nlp_score', 65)
        final   = round(emotion * 0.30 + voice * 0.20 + nlp * 0.50, 1)
        level   = 'High' if final >= 75 else ('Medium' if final >= 50 else 'Low')
        return jsonify({'confidence_score': final, 'level': level, 'breakdown': {'emotion': emotion, 'voice': voice, 'nlp': nlp}})
    except Exception as e:
        return jsonify({'confidence_score': 65, 'level': 'Medium', 'error': str(e)})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ml-service', 'nlp': 'tfidf'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug= False)