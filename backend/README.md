# Backend Setup Instructions

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file in the backend directory:**
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```
   
   Replace `your_youtube_api_key_here` with your actual YouTube API key.

## Running the Backend

### Method 1: Direct Python execution
```bash
python app.py
```

### Method 2: Using uvicorn directly
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes (useful for development).

## Server Information

- **Host:** 0.0.0.0 (accessible from all network interfaces)
- **Port:** 8000
- **API Documentation:** http://localhost:8000/docs (FastAPI auto-generated docs)
- **Alternative API Docs:** http://localhost:8000/redoc

## API Endpoints

- `POST /recognize/` - Upload an image for emotion detection
- `GET /download/{filename}` - Download processed video files
- `WebSocket /ws` - Video processing via WebSocket
- `WebSocket /ws/youtube` - YouTube live stream processing via WebSocket

## Troubleshooting

- **Missing YouTube API Key:** Make sure you have a `.env` file with `YOUTUBE_API_KEY` set
- **Port already in use:** Change the port in `app.py` or stop the process using port 8000
- **Import errors:** Make sure all dependencies are installed with `pip install -r requirements.txt`

