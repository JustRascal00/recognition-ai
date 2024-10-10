from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
from deepface import DeepFace
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Change this if using a different port or URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom emotion mapping function
def map_emotion(emotion):
    mapping = {
        "happy": "smile",
        "neutral": "neutral emotion",
        "angry": "angry",
        "surprise": "shocked",
        # Add more mappings if necessary
    }
    return mapping.get(emotion, "unknown emotion")  # Default to 'unknown emotion'

@app.post("/recognize/")
async def recognize_image(file: UploadFile = File(...)):
    # Read the image
    image_bytes = await file.read()
    nparr = np.fromstring(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    try:
        # DeepFace returns a list of results, so we need to access the first element
        result = DeepFace.analyze(image, actions=['emotion'])
        print("DeepFace result:", result)  # Log the result

        # Access the first result in the list
        raw_emotion = result[0]["dominant_emotion"]
        mapped_emotion = map_emotion(raw_emotion)
    except Exception as e:
        print("Error in DeepFace analysis:", e)  # Log the exception
        return {"error": str(e)}

    return {"emotion": mapped_emotion}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
