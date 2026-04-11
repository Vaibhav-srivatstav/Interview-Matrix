"""
Flask ML Service - AI Interview Platform
Handles: emotion detection, voice analysis, NLP scoring
"""

import os
import cv2
import base64
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv 

load_dotenv()

app = Flask(__name__)
CORS(app)

# ─── Lazy model loading ────────────────────────────────────────────────
_emotion_analyzer = None
_sentence_model = None


def get_emotion_analyzer():
    global _emotion_analyzer
    if _emotion_analyzer is None:
        from deepface import DeepFace
        _emotion_analyzer = DeepFace
    return _emotion_analyzer


def get_sentence_model():
    global _sentence_model
    if _sentence_model is None:
        from sentence_transformers import SentenceTransformer
        _sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
    return _sentence_model


# ─── Emotion Analysis ─────────────────────────────────────────────────

@app.route('/analyze_emotion', methods=['POST'])
def analyze_emotion():
    """
    Accepts base64 image frame, returns emotion breakdown + confidence score.
    """
    try:
        data = request.get_json()
        if not data or 'frame' not in data:
            return jsonify({'error': 'No frame provided'}), 400

        # Decode base64 image
        img_data = base64.b64decode(data['frame'])
        img_array = np.frombuffer(img_data, dtype=np.uint8)

        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'Invalid image data'}), 400

        DeepFace = get_emotion_analyzer()

        result = DeepFace.analyze(
            img,
            actions=['emotion'],
            enforce_detection=False,
            silent=True
        )

        if isinstance(result, list):
            result = result[0]

        emotions = result.get('emotion', {})
        dominant = result.get('dominant_emotion', 'neutral')

        # Confidence mapping
        confidence_map = {
            'happy': 90, 'neutral': 70, 'surprise': 65,
            'sad': 40, 'fear': 35, 'angry': 30, 'disgust': 25
        }

        confidence = confidence_map.get(dominant, 60)
        dom_strength = emotions.get(dominant, 0)
        confidence = min(100, confidence + (dom_strength / 100) * 10)

        return jsonify({
            'dominant_emotion': dominant,
            'emotions': {k: round(v, 2) for k, v in emotions.items()},
            'confidence_contribution': round(confidence, 1),
        })

    except Exception as e:
        app.logger.error(f'Emotion analysis error: {e}')
        return jsonify({'error': str(e)}), 500


# ─── Voice / Speech Analysis (UNCHANGED) ───────────────────────────────

@app.route('/analyze_voice', methods=['POST'])
def analyze_voice():
    try:
        import speech_recognition as sr
        from pydub import AudioSegment
        import tempfile

        data = request.get_json()
        if not data or 'audio' not in data:
            return jsonify({'error': 'No audio data'}), 400

        audio_bytes = base64.b64decode(data['audio'])

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        audio_seg = AudioSegment.from_wav(tmp_path)
        duration_s = len(audio_seg) / 1000.0

        recognizer = sr.Recognizer()
        with sr.AudioFile(tmp_path) as source:
            audio_data = recognizer.record(source)

        transcript = ''
        try:
            transcript = recognizer.recognize_google(audio_data)
        except:
            transcript = ''

        os.unlink(tmp_path)

        words = transcript.split() if transcript else []
        word_count = len(words)
        speech_rate = (word_count / duration_s * 60) if duration_s > 0 else 0

        filler_words = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually']
        filler_count = sum(1 for w in words if w.lower() in filler_words)

        silence_thresh = audio_seg.dBFS - 14
        pause_count = count_pauses(audio_seg, silence_thresh)

        ideal_wpm = 130
        rate_penalty = min(30, abs(speech_rate - ideal_wpm) / 5)
        filler_penalty = min(20, filler_count * 5)
        clarity = max(30, 100 - rate_penalty - filler_penalty)

        return jsonify({
            'transcript': transcript,
            'word_count': word_count,
            'duration_seconds': round(duration_s, 1),
            'speech_rate': round(speech_rate, 1),
            'pause_count': pause_count,
            'filler_words': filler_count,
            'clarity': round(clarity, 1),
        })

    except Exception as e:
        app.logger.error(f'Voice analysis error: {e}')
        return jsonify({'error': str(e)}), 500


def count_pauses(audio_seg, silence_thresh, min_silence_ms=500):
    chunk_size = 100
    pauses = 0
    in_silence = False
    silence_dur = 0

    for i in range(0, len(audio_seg), chunk_size):
        chunk = audio_seg[i:i + chunk_size]
        if chunk.dBFS < silence_thresh:
            silence_dur += chunk_size
            if not in_silence:
                in_silence = True
        else:
            if in_silence and silence_dur >= min_silence_ms:
                pauses += 1
            in_silence = False
            silence_dur = 0

    return pauses


# ─── NLP Answer Scoring (UNCHANGED) ────────────────────────────────────

@app.route('/analyze_answer', methods=['POST'])
def analyze_answer():
    try:
        data = request.get_json()
        question = data.get('question', '')
        answer = data.get('answer', '')

        if not answer.strip():
            return jsonify({'nlp_score': 0, 'keyword_score': 0, 'feedback': 'No answer provided.'})

        model = get_sentence_model()

        q_embedding = model.encode([question])
        a_embedding = model.encode([answer])

        from sklearn.metrics.pairwise import cosine_similarity
        similarity = cosine_similarity(q_embedding, a_embedding)[0][0]
        nlp_score = min(100, round(float(similarity) * 150, 1))

        tech_keywords = extract_tech_keywords(question + ' ' + answer)
        keyword_score = min(100, len(tech_keywords) * 10)

        if nlp_score >= 80:
            feedback = 'Excellent answer!'
        elif nlp_score >= 60:
            feedback = 'Good answer.'
        elif nlp_score >= 40:
            feedback = 'Partial answer.'
        else:
            feedback = 'Needs improvement.'

        return jsonify({
            'nlp_score': nlp_score,
            'keyword_score': keyword_score,
            'similarity': float(similarity),
            'keywords_detected': tech_keywords,
            'feedback': feedback,
        })

    except Exception as e:
        app.logger.error(f'NLP analysis error: {e}')
        return jsonify({'error': str(e)}), 500


def extract_tech_keywords(text):
    tech_terms = [
        'api','rest','json','database','mongodb','sql','react','node',
        'component','state','props','hook','async','promise','closure',
        'prototype','inheritance','class','function','array','object',
        'http','get','post','authentication','jwt','middleware','server',
        'client','dom','event','callback','algorithm','complexity'
    ]
    text_lower = text.lower()
    return [kw for kw in tech_terms if kw in text_lower]


# ─── Confidence Score ─────────────────────────────────────────────────

@app.route('/confidence_score', methods=['POST'])
def confidence_score():
    try:
        data = request.get_json()
        emotion_confidence = data.get('emotion_confidence', 65)
        voice_clarity = data.get('voice_clarity', 65)
        nlp_score = data.get('nlp_score', 65)

        final = round(
            emotion_confidence * 0.30 +
            voice_clarity * 0.20 +
            nlp_score * 0.50,
            1
        )

        level = 'High' if final >= 75 else ('Medium' if final >= 50 else 'Low')

        return jsonify({
            'confidence_score': final,
            'level': level,
            'breakdown': {
                'emotion': emotion_confidence,
                'voice': voice_clarity,
                'nlp': nlp_score
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ml-service'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
    