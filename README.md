# Emotion Detection AI

**Emotion Detection AI** is a web application that uses AI to detect and analyze emotions from images, videos, and YouTube live streams. The application leverages advanced machine learning models to recognize facial expressions and determine emotional states such as happy, sad, angry, surprised, and more.

## Features

- **Image Upload Detection**: Upload an image to detect and analyze emotions in faces.
- **Video Processing**: Process video files to detect emotions frame by frame.
- **YouTube Live Detection**: Analyze live streams from YouTube to detect emotions in real-time.
- **Preview and Reset Options**: Easily preview the uploaded content and reset for a new analysis.
- **AI-Powered Accuracy**: Detect emotions with state-of-the-art AI models.

## Screenshots

### Image Emotion Detection
![Image Emotion Detection](./screenshots/Screenshot_1.png)

### Main Dashboard
![Main Dashboard](./screenshots/Screenshot_2.png)

### Video Emotion Processing
![Video Emotion Processing](./screenshots/Screenshot_3.png)

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
