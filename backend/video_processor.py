import cv2
import numpy as np
from deepface import DeepFace
from fastapi import UploadFile
from fastapi.responses import FileResponse
from pathlib import Path
import os
import sys

class VideoProcessor:
    def __init__(self):
        self.UPLOAD_DIR = Path("temp_videos")
        self.UPLOAD_DIR.mkdir(exist_ok=True)
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    async def process_video(self, file: UploadFile):
        # Create temporary files for input and output videos
        temp_input = self.UPLOAD_DIR / f"input_{file.filename}"
        # Use .mp4 extension explicitly
        temp_output = self.UPLOAD_DIR / f"processed_{Path(file.filename).stem}.mp4"
        
        # Save uploaded video
        with open(temp_input, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        try:
            # Process the video with progress bar
            self._process_video_file(str(temp_input), str(temp_output))
            
            # Clean up input file
            os.remove(temp_input)
            
            # Return the processed video file
            return FileResponse(
                path=temp_output,
                filename=f"processed_{Path(file.filename).stem}.mp4",
                media_type="video/mp4"
            )
        except Exception as e:
            # Clean up files in case of error
            if temp_input.exists():
                os.remove(temp_input)
            if temp_output.exists():
                os.remove(temp_output)
            raise e

    def _process_video_file(self, input_path: str, output_path: str):
        cap = cv2.VideoCapture(input_path)
        
        # Get video properties
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Save directly as MP4
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))
        
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            # Optionally, process every frame
            processed_frame = self._process_frame(frame)
            out.write(processed_frame)
            
            # Update the progress bar
            self._update_progress_bar(frame_count, total_frames)
        
        cap.release()
        out.release()

    def _process_frame(self, frame):
        # Detect faces
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Process each face
        for (x, y, w, h) in faces:
            # Draw rectangle
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            # Get face region and analyze emotion
            face_roi = frame[y:y+h, x:x+w]
            result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            emotion = result[0]["dominant_emotion"]
            
            # Add emotion text
            cv2.putText(frame, emotion, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.9, (36,255,12), 2)
        
        return frame

    def _update_progress_bar(self, current_frame, total_frames):
        progress = (current_frame / total_frames) * 100
        sys.stdout.write(f"\rProcessing video... {progress:.2f}% completed")
        sys.stdout.flush()

    def cleanup(self):
        # Clean up temporary files
        for file in self.UPLOAD_DIR.glob("*"):
            file.unlink()
        self.UPLOAD_DIR.rmdir()
