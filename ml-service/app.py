import os
import base64
import re
import math
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pydub import AudioSegment
AudioSegment.converter = "/usr/bin/ffmpeg"

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


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ml-service'})


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
            return jsonify(_neutral())

        if img.shape[1] < 48 or img.shape[0] < 48:
            img = cv2.resize(img, (224, 224))

        DeepFace = get_emotion_analyzer()
        result = DeepFace.analyze(
            img, actions=['emotion'],
            enforce_detection=False,
            detector_backend='opencv',
            silent=True
        )
        if isinstance(result, list):
            result = result[0]

        emotions = result.get('emotion', {})
        dominant = result.get('dominant_emotion', 'neutral')

        if sum(emotions.values()) < 1:
            return jsonify(_neutral('No face detected'))

        confidence_map = {
            'happy': 90, 'neutral': 70, 'surprise': 65,
            'sad': 40, 'fear': 35, 'angry': 30, 'disgust': 25
        }
        confidence = min(100, confidence_map.get(dominant, 60) + (emotions.get(dominant, 0) / 100) * 10)

        return jsonify({
            'dominant_emotion': dominant,
            'emotions': {k: round(float(v), 2) for k, v in emotions.items()},
            'confidence_contribution': round(float(confidence), 1),
        })

    except Exception as e:
        app.logger.error(f'Emotion error: {e}')
        return jsonify(_neutral(str(e)))


def _neutral(reason=''):
    return {
        'dominant_emotion': 'neutral',
        'emotions': {'neutral': 100.0, 'happy': 0.0, 'sad': 0.0,
                     'angry': 0.0, 'fear': 0.0, 'surprise': 0.0, 'disgust': 0.0},
        'confidence_contribution': 65.0,
        'fallback': True,
        'reason': reason,
    }


@app.route('/analyze_answer', methods=['POST'])
def analyze_answer():
    try:
        data = request.get_json()
        question = data.get('question', '')
        answer = data.get('answer', '')
        expected_keywords = data.get('expectedKeywords', [])

        if not answer.strip():
            return jsonify({'nlp_score': 0, 'keyword_score': 0, 'feedback': 'No answer provided.'})

        similarity = tfidf_similarity(question + ' ' + answer, question)
        nlp_score = min(100, max(0, round(similarity * 200 + len(tokenize(answer)) * 0.5, 1)))

        keyword_score = keyword_overlap(answer, expected_keywords)
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
            'feedback': feedback,
        })

    except Exception as e:
        app.logger.error(f'NLP error: {e}')
        return jsonify({'nlp_score': 60, 'keyword_score': 50, 'feedback': 'Analysis completed.'})


def tokenize(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return [w for w in text.split() if len(w) > 2]


def tfidf_similarity(text_a, text_b):
    tokens_a = tokenize(text_a)
    tokens_b = tokenize(text_b)
    if not tokens_a or not tokens_b:
        return 0.0

    vocab = list(set(tokens_a + tokens_b))

    def tfidf_vec(tokens):
        vec = []
        for word in vocab:
            tf = tokens.count(word) / len(tokens) if tokens else 0
            df = (1 if word in tokens_a else 0) + (1 if word in tokens_b else 0)
            idf = math.log(2 / df) if df else 0
            vec.append(tf * idf)
        return vec

    va = tfidf_vec(tokens_a)
    vb = tfidf_vec(tokens_b)
    dot = sum(a * b for a, b in zip(va, vb))
    mag_a = math.sqrt(sum(a**2 for a in va))
    mag_b = math.sqrt(sum(b**2 for b in vb))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0


def keyword_overlap(answer, expected_keywords):
    general = [
        'api', 'rest', 'json', 'database', 'mongodb', 'sql', 'react', 'node',
        'component', 'state', 'props', 'hook', 'async', 'promise', 'closure',
        'class', 'function', 'array', 'object', 'http', 'jwt', 'middleware',
        'dom', 'event', 'algorithm', 'cache', 'query', 'schema', 'model',
    ]
    kws = list(set((expected_keywords or []) + general))
    lower = answer.lower()
    matched = [k for k in kws if k in lower]
    return min(100, len(matched) * 8)


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

        # ✅ Save as WEBM (not wav)
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # ✅ Load audio (auto-detect format)
        audio_seg = AudioSegment.from_file(tmp_path)

        # ✅ Convert to WAV for speech recognition
        wav_path = tmp_path + ".wav"
        audio_seg.export(wav_path, format="wav")

        duration_s = len(audio_seg) / 1000.0

        # ✅ Speech Recognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)

        transcript = ''
        try:
            transcript = recognizer.recognize_google(audio_data)
        except:
            transcript = ''

        # Cleanup temp files
        os.unlink(tmp_path)
        os.unlink(wav_path)

        # Metrics
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
        return jsonify({
            'transcript': '',
            'word_count': 0,
            'speech_rate': 0,
            'pause_count': 0,
            'filler_words': 0,
            'clarity': 60,
            'error': str(e)
        })



def count_pauses(audio_seg, silence_thresh, min_silence_ms=500):
    """Count pauses longer than min_silence_ms."""
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


@app.route('/confidence_score', methods=['POST'])
def confidence_score():
    try:
        data = request.get_json()
        emotion = data.get('emotion_confidence', 65)
        voice   = data.get('voice_clarity', 65)
        nlp     = data.get('nlp_score', 65)
        final   = round(emotion * 0.30 + voice * 0.20 + nlp * 0.50, 1)
        level   = 'High' if final >= 75 else ('Medium' if final >= 50 else 'Low')
        return jsonify({'confidence_score': final, 'level': level})
    except Exception as e:
        return jsonify({'confidence_score': 65, 'level': 'Medium'})

    
@app.route("/", methods=["GET"])
def root():
    return jsonify({"msg": "ML Service is up", "service": "ml-service"})



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)