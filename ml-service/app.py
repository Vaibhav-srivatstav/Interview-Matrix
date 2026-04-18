import os
import base64
import numpy as np
import signal
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pydub import AudioSegment
import subprocess
import cv2

# ✅ Load env
load_dotenv()

# ✅ Robust FFmpeg setup
FFMPEG_PATHS = ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "ffmpeg"]
for path in FFMPEG_PATHS:
    if os.path.exists(path) or path == "ffmpeg":
        AudioSegment.converter = path
        break

app = Flask(__name__)
CORS(app)

_emotion_analyzer = None

from deepface import DeepFace

print("🔥 Loading DeepFace model...")

# Warmup (important)
DeepFace.analyze(
    np.zeros((224,224,3), dtype=np.uint8),
    actions=['emotion'],
    enforce_detection=False,
    detector_backend='opencv',
    silent=True
)

print("✅ Model loaded successfully")

# ================= TIMEOUT HANDLER =================
def timeout_handler(signum, frame):
    raise TimeoutError("ML timeout")

signal.signal(signal.SIGALRM, timeout_handler)



# ✅ Debug endpoint (VERY IMPORTANT)
@app.route('/check_ffmpeg')
def check_ffmpeg():
    try:
        result = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        return jsonify({
            "working": result.returncode == 0,
            "output": result.stdout[:200]
        })
    except Exception as e:
        return jsonify({"working": False, "error": str(e)})


def get_emotion_analyzer():
    global _emotion_analyzer
    if _emotion_analyzer is None:
        from deepface import DeepFace
        _emotion_analyzer = DeepFace
    return _emotion_analyzer


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ml-service'})


# ================= EMOTION =================
@app.route('/analyze_emotion', methods=['POST'])
def analyze_emotion():
    try:
        data = request.get_json()
        if not data or 'frame' not in data:
            return jsonify(_neutral("No frame"))

        raw = data['frame']

        # remove base64 header
        if ',' in raw:
            raw = raw.split(',', 1)[1]

        # size protection (IMPORTANT)
        if len(raw) > 50000:
            return jsonify(_neutral("Frame too large"))

        img_bytes = base64.b64decode(raw)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify(_neutral("Invalid image"))

        # resize (performance boost)
        img = cv2.resize(img, (160, 160))

        # timeout safety
        signal.alarm(10)

        try:
            result = DeepFace.analyze(
                img,
                actions=['emotion'],
                enforce_detection=False,
                detector_backend='opencv',
                silent=True
            )
        finally:
            signal.alarm(0)

        if isinstance(result, list):
            result = result[0]

        emotions = result.get('emotion', {})
        dominant = result.get('dominant_emotion', 'neutral')

        if sum(emotions.values()) < 1:
            return jsonify(_neutral("No face"))

        confidence_map = {
            'happy': 90, 'neutral': 70, 'surprise': 65,
            'sad': 40, 'fear': 35, 'angry': 30, 'disgust': 25
        }

        confidence = min(
            100,
            confidence_map.get(dominant, 60) +
            (emotions.get(dominant, 0) / 100) * 10
        )

        return jsonify({
            'dominant_emotion': dominant,
            'emotions': {k: round(float(v), 2) for k, v in emotions.items()},
            'confidence_contribution': round(float(confidence), 1),
        })

    except Exception as e:
        app.logger.error(f"Emotion error: {e}")
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

def _neutral(reason=""):
    return {
        'dominant_emotion': 'neutral',
        'emotions': {'neutral': 100.0},
        'confidence_contribution': 65.0,
        'fallback': True,
        'reason': reason
    }


# ================= VOICE =================
@app.route('/analyze_voice', methods=['POST'])
def analyze_voice():
    try:
        import speech_recognition as sr
        from pydub import AudioSegment
        import tempfile

        app.logger.info("Step 1: Request received")

        data = request.get_json()
        if not data or 'audio' not in data:
            return jsonify({'error': 'No audio data'}), 400

        audio_bytes = base64.b64decode(data['audio'])

        if len(audio_bytes) < 1000:
            return jsonify({'error': 'Audio too short'}), 400

        app.logger.info("Step 2: Saving temp file")

        # Save as webm
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        app.logger.info("Step 3: Loading audio")

        audio_seg = AudioSegment.from_file(tmp_path)

        # 🔥 IMPORTANT: normalize audio (fixes many 502 issues)
        audio_seg = audio_seg.set_channels(1).set_frame_rate(16000)

        wav_path = tmp_path + ".wav"
        audio_seg.export(wav_path, format="wav")

        duration_s = len(audio_seg) / 1000.0

        app.logger.info("Step 4: Speech recognition start")

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)

        transcript = ''
        try:
            transcript = recognizer.recognize_google(audio_data)
        except Exception as e:
            app.logger.error(f"Speech error: {e}")
            transcript = ""

        # cleanup
        os.unlink(tmp_path)
        os.unlink(wav_path)

        app.logger.info("Step 5: Processing metrics")

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


# ================= CONFIDENCE =================
@app.route('/confidence_score', methods=['POST'])
def confidence_score():
    try:
        data = request.get_json()
        emotion = data.get('emotion_confidence', 65)
        voice   = data.get('voice_clarity', 65)
        nlp     = data.get('nlp_score', 65)

        final = round(emotion * 0.30 + voice * 0.20 + nlp * 0.50, 1)
        level = 'High' if final >= 75 else ('Medium' if final >= 50 else 'Low')

        return jsonify({'confidence_score': final, 'level': level})

    except:
        return jsonify({'confidence_score': 65, 'level': 'Medium'})


@app.route("/", methods=["GET"])
def root():
    return jsonify({"msg": "ML Service is up", "service": "ml-service"})


@app.route('/ping')
def ping():
    return "pong" 

# ================= RUN =================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)