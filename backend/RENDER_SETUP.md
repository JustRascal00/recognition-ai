# Render Deployment Setup

## Quick Steps

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select the repository: `JustRascal00/recognition-ai`
   - Choose **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Python Version**: Set to `3.11.10` (in Advanced settings or via `runtime.txt` - already created)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
   Add these in the Render dashboard:
   - `YOUTUBE_API_KEY`: Your YouTube API key
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://recognition-ai.vercel.app`)
   - `PORT`: This is automatically set by Render (don't change it)

4. **Important Settings**:
   - **Auto-Deploy**: Enable to deploy on every push to main branch
   - **Plan**: Choose based on your needs (Free tier available, but may have limitations)

## Notes

- The `Procfile` is already created and will be used automatically
- WebSocket support is available on Render's paid plans (check current pricing)
- DeepFace and OpenCV may take longer to install on first deployment
- The free tier may have cold start times

## After Deployment

1. Copy your Render backend URL (e.g., `https://your-app.onrender.com`)
2. Update your frontend environment variables to point to this URL
3. Update `FRONTEND_URL` in Render to match your Vercel URL

## Troubleshooting

- **Python Version Issues**: The `runtime.txt` file specifies Python 3.11.10. If Render uses a different version, you can set it in the dashboard under Advanced settings.
- **Build Failures**: If build fails, check that all dependencies in `requirements.txt` are compatible
- **NumPy Issues**: If numpy fails to build, ensure Python 3.11 or 3.12 is being used (not 3.13+)
- OpenCV requires system libraries that Render should handle automatically
- For WebSocket issues, ensure you're on a paid plan that supports persistent connections

