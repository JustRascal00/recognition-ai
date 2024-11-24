# Emotion Detection AI

**Emotion Detection AI** is a web application that uses AI to detect and analyze emotions from images, videos, and YouTube live streams. The application leverages advanced machine learning models to recognize facial expressions and determine emotional states such as happy, sad, angry, surprised, and more.

## Features

- **Image Upload Detection**: Upload an image to detect and analyze emotions in faces.
- **Video Processing**: Process video files to detect emotions frame by frame.
- **YouTube Live Detection**: Analyze live streams from YouTube to detect emotions in real-time.
- **Preview and Reset Options**: Easily preview the uploaded content and reset for a new analysis.
- **AI-Powered Accuracy**: Detect emotions with state-of-the-art AI models.

## Screenshots

### Main Dashboard
![Main Dashboard]![Screenshot_2](https://github.com/user-attachments/assets/84633027-ee84-42f9-93b5-9fd6aa6a92c0)

### Image Emotion Detection
![Image Emotion Detection]![Screenshot_1](https://github.com/user-attachments/assets/3882e1e3-e18e-4cbb-b004-74389109d665)

### Video Emotion Processing
![Video Emotion Processing]![Screenshot_3](https://github.com/user-attachments/assets/a848eeb0-2931-404e-8799-b4c2ccd3ac54)

### Detected Emotions in Video Frames
**Real-time face detection with bounding boxes and emotion labels**
![Video Emotion Detection with Faces] ![Screenshot_4](https://github.com/user-attachments/assets/28cca2c9-421e-4055-9b2d-d94e9d5bfd5c)

## Technologies Used

- **Frontend**: React.js, Next.js
- **Backend**: FastAPI
- **Machine Learning**: DeepFace (or any ML model you are using)
- **YouTube API**: For live stream emotion detection
- **Video Processing**: Custom pipeline for frame-by-frame analysis

## Installation

### Prerequisites
- Node.js and npm
- Python (3.8 or later)
- Virtual environment (optional but recommended)
- YouTube API key (if using YouTube live detection)

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/emotion-detection-ai.git
   cd emotion-detection-ai
