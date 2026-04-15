FROM python:3.11-slim

# System deps for OpenCV + audio
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev \
    ffmpeg libavcodec-extra \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Pre-download spaCy model
# RUN python -m spacy download en_core_web_sm || true

COPY app.py .
EXPOSE 8000
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8000", "--timeout", "120", "--preload", "app:app"]
