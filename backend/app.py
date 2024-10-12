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

@app.on_event("shutdown")
async def cleanup():
    video_processor.cleanup()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)