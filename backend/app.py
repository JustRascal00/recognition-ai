from fastapi import FastAPI, File, UploadFile, WebSocket, Query
import cv2
import numpy as np
from deepface import DeepFace
from fastapi.middleware.cors import CORSMiddleware
from websocket_handler import websocket_endpoint
from video_processor import VideoProcessor

app = FastAPI()

# Initialize VideoProcessor
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

@app.post("/process-video/")
async def process_video(file: UploadFile = File(...)):
    return await video_processor.process_video(file)

@app.websocket("/ws")
async def websocket_route(websocket: WebSocket):
    await websocket_endpoint(websocket)

@app.on_event("shutdown")
async def cleanup():
    video_processor.cleanup()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)