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

## ⚠️ CRITICAL: Python Version Fix

**If your build is failing with pandas compilation errors, you MUST do this:**

1. Go to your Render service → **Settings** → **Advanced Settings**
2. Find **"Python Version"** field
3. Set it to **`3.11.10`** or **`3.11`** (NOT 3.13!)
4. **Save Changes**
5. **Redeploy**

See `RENDER_PYTHON_FIX.md` for detailed instructions.

## Troubleshooting

- **Python Version Issues**: The `runtime.txt` file specifies Python 3.11.10. However, **Render dashboard settings take precedence**. You MUST set Python 3.11 in Render dashboard → Settings → Advanced Settings.
- **Pandas Build Failures**: If you see `cp313` in error logs, Python 3.13 is being used. Python 3.13 is too new and pandas doesn't have wheels for it. **You MUST use Python 3.11 in Render dashboard settings.**
- **Build Failures**: If build fails, check that all dependencies in `requirements.txt` are compatible
- **NumPy Issues**: If numpy fails to build, ensure Python 3.11 or 3.12 is being used (not 3.13+)
- OpenCV requires system libraries that Render should handle automatically
- For WebSocket issues, ensure you're on a paid plan that supports persistent connections

