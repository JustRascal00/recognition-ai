from fastapi import FastAPI, File, UploadFile, WebSocket
import cv2
import numpy as np
from deepface import DeepFace
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from video_processor import VideoProcessor
import io
import os

app = FastAPI()

video_processor = VideoProcessor()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def map_emotion(emotion):
    mapping = {
        "happy": "smile",
        "neutral": "neutral emotion",
        "angry": "angry",
        "surprise": "shocked",
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
    try:
        while True:
            data = await websocket.receive_text()
            if data == "start_processing":
                file_data = await websocket.receive_bytes()
                file = io.BytesIO(file_data)
                upload_file = UploadFile(filename="video.mp4", file=file)
                processed_video_path = await video_processor.process_video(upload_file, websocket)
                
                await websocket.send_text("processing_complete")
                await websocket.send_text(processed_video_path)  # Send the file path
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.get("/download_video/")
async def download_video(video_path: str):
    if os.path.exists(video_path):
        return FileResponse(path=video_path, media_type="video/mp4", filename="processed_video.mp4")
    else:
        return {"error": "File not found"}

@app.on_event("shutdown")
async def cleanup():
    video_processor.cleanup()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)