import cv2
import numpy as np
from deepface import DeepFace
from fastapi import UploadFile, WebSocket
from fastapi.responses import FileResponse
from pathlib import Path
import os
import json
import tempfile
import shutil
from collections import deque
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoProcessor:
    def __init__(self):
        self.UPLOAD_DIR = Path("temp_videos")
        self.UPLOAD_DIR.mkdir(exist_ok=True)
        
        # Use absolute paths
        current_dir = Path(__file__).parent.resolve()
        model_dir = current_dir / "models"
        prototxt_path = model_dir / "deploy.prototxt"
        model_path = model_dir / "res10_300x300_ssd_iter_140000.caffemodel"
        
        # Initialize the face detector (OpenCV DNN model)
        if not prototxt_path.exists():
            raise FileNotFoundError(f"Prototxt file not found at {prototxt_path}")
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        try:
            self.face_detector = cv2.dnn.readNetFromCaffe(
                str(prototxt_path),
                str(model_path)
            )
        except cv2.error as e:
            logger.error(f"Error loading face detector model: {e}")
            raise
        
        # Initialize Haar Cascade for face detection
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        if self.face_cascade.empty():
            raise FileNotFoundError(f"Haar Cascade XML file not found at {cascade_path}")
        
        self.websocket = None
        self.emotion_history = deque(maxlen=10)
        self.tracking_started = False

    async def process_video(self, file: UploadFile, websocket: WebSocket):
        self.websocket = websocket
        temp_input = self.UPLOAD_DIR / f"input_{file.filename}"
        temp_output = self.UPLOAD_DIR / f"processed_{Path(file.filename).stem}.mp4"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_input = Path(temp_file.name)
        
        try:
            await self._process_video_file(str(temp_input), str(temp_output))
            os.remove(temp_input)
            return str(temp_output)
        except Exception as e:
            logger.error(f"Error processing video: {e}")
            if temp_input.exists(): 
                os.remove(temp_input)
            if temp_output.exists():
                os.remove(temp_output)
            raise e

    async def _process_video_file(self, input_path: str, output_path: str):
        cap = cv2.VideoCapture(input_path)
        
        if not cap.isOpened():
            raise ValueError("Error opening video file")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))
        
        frame_count = 0
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                processed_frame = self._process_frame(frame)
                out.write(processed_frame)
                
                await self._update_progress(frame_count, total_frames)
        finally:
            cap.release()
            out.release()

    def _process_frame(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            face_roi = frame[y:y+h, x:x+w]
            try:
                result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
                emotion = result[0]["dominant_emotion"] if isinstance(result, list) else result["dominant_emotion"]
                
                self.emotion_history.append(emotion)
                smoothed_emotion = max(set(self.emotion_history), key=self.emotion_history.count)
                
                # Adjust text position to ensure it's always visible
                text_y = max(y - 10, 20)  # Ensure text is at least 20 pixels from top
                cv2.putText(frame, smoothed_emotion, (x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36,255,12), 2)
                
                # Add a background rectangle for better text visibility
                (text_width, text_height), _ = cv2.getTextSize(smoothed_emotion, cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)
                cv2.rectangle(frame, (x, text_y - text_height - 5), (x + text_width, text_y + 5), (0, 0, 0), -1)
                cv2.putText(frame, smoothed_emotion, (x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (36,255,12), 2)
            except Exception as e:
                logger.error(f"DeepFace analysis error: {e}")
        
        return frame

    async def _update_progress(self, current_frame, total_frames):
        progress = (current_frame / total_frames) * 100
        if self.websocket:
            await self.websocket.send_text(json.dumps({"progress": progress}))

    def cleanup(self):
        for file in self.UPLOAD_DIR.glob("*"):
            file.unlink()
        self.UPLOAD_DIR.rmdir()
