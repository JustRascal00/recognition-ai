import cv2
import numpy as np
from deepface import DeepFace
from fastapi import UploadFile
from fastapi.responses import FileResponse
from pathlib import Path
import os

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
            # Process the video
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
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Create temporary AVI file first (for compatibility)
        temp_avi = str(self.UPLOAD_DIR / "temp_output.avi")
        
        # Use XVID codec for temporary AVI
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(temp_avi, fourcc, fps, (frame_width, frame_height))
        
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            # Process every 3rd frame to improve performance
            if frame_count % 3 != 0:
                continue
                
            try:
                processed_frame = self._process_frame(frame)
                out.write(processed_frame)
            except Exception as e:
                print(f"Error processing frame {frame_count}: {e}")
                out.write(frame)  # Write original frame if processing fails
        
        # Release everything
        cap.release()
        out.release()

        # Convert AVI to MP4 using ffmpeg
        try:
            import ffmpeg
            
            # Use ffmpeg to convert to MP4 with H.264 codec
            stream = ffmpeg.input(temp_avi)
            stream = ffmpeg.output(stream, output_path, vcodec='libx264', acodec='aac')
            ffmpeg.run(stream, overwrite_output=True)
            
            # Remove temporary AVI file
            os.remove(temp_avi)
        except ImportError:
            print("ffmpeg-python not installed. Using alternative method...")
            # If ffmpeg-python is not available, try using CV2's MP4V codec directly
            self._convert_to_mp4(temp_avi, output_path, fps, frame_width, frame_height)
            os.remove(temp_avi)

    def _convert_to_mp4(self, input_path: str, output_path: str, fps: int, width: int, height: int):
        cap = cv2.VideoCapture(input_path)
        fourcc = cv2.VideoWriter_fourcc(*'avc1')  # Use H.264 codec
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            out.write(frame)
            
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

    def cleanup(self):
        # Clean up temporary files
        for file in self.UPLOAD_DIR.glob("*"):
            file.unlink()
        self.UPLOAD_DIR.rmdir()