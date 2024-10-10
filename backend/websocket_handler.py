import cv2
from fastapi import WebSocket
from deepface import DeepFace

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    video = cv2.VideoCapture(0)

    while True:
        ret, frame = video.read()
        if not ret:
            break

        try:
            result = DeepFace.analyze(frame, actions=['emotion'])
            emotion = result[0]["dominant_emotion"]
            await websocket.send_text(emotion)
        except Exception as e:
            await websocket.send_text(f"Error: {str(e)}")

    video.release()
