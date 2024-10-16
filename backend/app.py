from fastapi import FastAPI, File, UploadFile, WebSocket
import cv2
import numpy as np
from deepface import DeepFace
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from video_processor import VideoProcessor
from starlette.websockets import WebSocketDisconnect
import io
import os
from pathlib import Path
from dotenv import load_dotenv
from googleapiclient.discovery import build
import pafy
import yt_dlp

load_dotenv()

app = FastAPI()

video_processor = VideoProcessor()

YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

if not YOUTUBE_API_KEY:
    raise ValueError("YouTube API key not found. Please set it in the .env file.")

youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def map_emotion(emotion):
    mapping = {
        "happy": "happy",
        "neutral": "neutral emotion",
        "angry": "angry",
        "surprise": "shocked",
        "sad": "sad",
        "fear": "fearful",
        "disgust": "disgusted",
    }
    return mapping.get(emotion, "unknown emotion")

@app.post("/recognize/")
async def recognize_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    nparr = np.fromstring(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    try:
        result = DeepFace.analyze(image, actions=['emotion'])
        print("DeepFace result:", result)
        raw_emotion = result[0]["dominant_emotion"]
        mapped_emotion = map_emotion(raw_emotion)
    except Exception as e:
        print("Error in DeepFace analysis:", e)
        return {"error": str(e)}

    return {"emotion": mapped_emotion}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connection_open = True
    try:
        while True:
            try:
                data = await websocket.receive_text()
                if data == "start_processing":
                    file_data = await websocket.receive_bytes()
                    file = io.BytesIO(file_data)
                    upload_file = UploadFile(filename="video.mp4", file=file)
                    processed_video_path = await video_processor.process_video(upload_file, websocket)
                    
                    await websocket.send_text("processing_complete")
                    
                    # Send the URL or link to download the video
                    await websocket.send_text(f"/download/{Path(processed_video_path).name}")
            except WebSocketDisconnect:
                print("Client disconnected")
                connection_open = False
                break
    except Exception as e:
        print(f"WebSocket error: {e}")
        if connection_open:
            try:
                await websocket.send_text(f"Error: {e}")
            except WebSocketDisconnect:
                print("Unable to send error message, client already disconnected.")
    finally:
        if connection_open:
            await websocket.close()

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = video_processor.UPLOAD_DIR / filename
    if file_path.exists():
        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
    else:
        return {"error": "File not found"}

@app.websocket("/ws/youtube")
async def youtube_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    video_url = None
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data['action'] == 'start':
                video_id = data['videoId']
                # Check if the input is already a full URL or just the video ID
                if 'youtube.com' in video_id or 'youtu.be' in video_id:
                    video_url = video_id
                else:
                    video_url = f"https://www.youtube.com/watch?v={video_id}"
                
                try:
                    print(f"Processing video: {video_url}")  # Debug print
                    
                    ydl_opts = {'format': 'best[ext=mp4]'}
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        info = ydl.extract_info(video_url, download=False)
                        video_url = info['url']
                    
                    # Start capturing video
                    cap = cv2.VideoCapture(video_url)
                    
                    while cap.isOpened():
                        ret, frame = cap.read()
                        if not ret:
                            break
                        
                        # Process frame for emotion detection
                        try:
                            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                            emotion = result[0]["dominant_emotion"]
                            await websocket.send_json({"emotion": emotion})
                        except Exception as e:
                            print(f"Error in emotion detection: {e}")
                        
                        # Check if stop signal received
                        try:
                            data = await websocket.receive_json()
                            if data['action'] == 'stop':
                                break
                        except:
                            pass
                    
                    cap.release()
                except Exception as e:
                    error_message = f"Error processing video: {str(e)}"
                    print(error_message)  # Debug print
                    await websocket.send_json({"error": error_message})
            
            elif data['action'] == 'stop':
                break
    
    except Exception as e:
        error_message = f"WebSocket error: {str(e)}"
        print(error_message)  # Debug print
        await websocket.send_json({"error": error_message})
    finally:
        await websocket.close()
@app.on_event("shutdown")
async def cleanup():
    video_processor.cleanup()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)