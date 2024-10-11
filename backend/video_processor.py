import cv2
import numpy as np
from deepface import DeepFace
from fastapi import UploadFile, WebSocket
from fastapi.responses import FileResponse
from pathlib import Path
import os
import json
import tempfile

class VideoProcessor:
    def __init__(self):
        self.UPLOAD_DIR = Path("temp_videos")
        self.UPLOAD_DIR.mkdir(exist_ok=True)
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.websocket = None

    async def process_video(self, file: UploadFile, websocket: WebSocket):
        self.websocket = websocket
        temp_input = self.UPLOAD_DIR / f"input_{file.filename}"
        temp_output = self.UPLOAD_DIR / f"processed_{Path(file.filename).stem}.mp4"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            temp_file.write(file.file.read())
            temp_input = Path(temp_file.name)
        
        try:
            await self._process_video_file(str(temp_input), str(temp_output))
            os.remove(temp_input)
            
            return str(temp_output)  # Return the path as a string
        except Exception as e:
            if temp_input.exists(): 
                os.remove(temp_input)
            if temp_output.exists():
                os.remove(temp_output)
            raise e

    async def _process_video_file(self, input_path: str, output_path: str):
        cap = cv2.VideoCapture(input_path)
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))
        
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            processed_frame = self._process_frame(frame)
            out.write(processed_frame)
            
            await self._update_progress(frame_count, total_frames)
        
        cap.release()
        out.release()

    def _process_frame(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            face_roi = frame[y:y+h, x:x+w]
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            emotion = result[0]["dominant_emotion"]
            
            cv2.putText(frame, emotion, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.9, (36,255,12), 2)
        
        return frame

    async def _update_progress(self, current_frame, total_frames):
        progress = (current_frame / total_frames) * 100
        if self.websocket:
            await self.websocket.send_text(json.dumps({"progress": progress}))

    def cleanup(self):
        for file in self.UPLOAD_DIR.glob("*"):
            file.unlink()
        self.UPLOAD_DIR.rmdir()