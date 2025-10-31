# 🔴 CRITICAL: Python Version Fix for Render

## The Problem
Render is using Python 3.13 by default, which causes pandas (a dependency of deepface) to fail building. Python 3.13 is too new and pandas doesn't have pre-built wheels for it yet.

## The Solution - MUST DO THIS:

### Step 1: Set Python Version in Render Dashboard ⚠️ CRITICAL

1. Go to https://dashboard.render.com
2. Click on your web service (recognition-ai)
3. Click **Settings** (in the left sidebar)
4. Scroll down to **Advanced Settings**
5. Find **"Python Version"** field
6. Change it from `3.13.4` (or default) to **`3.11.10`** or **`3.11`**
7. Click **Save Changes**
8. **Redeploy** your service (or wait for auto-deploy)

### Step 2: Verify

After redeploying, check the build logs:
- You should see: `==> Using Python version 3.11.x`
- The build should succeed without pandas compilation errors

## Why This Is Needed

- The `runtime.txt` file exists but Render dashboard setting takes precedence
- Python 3.13 was released in October 2024 and many packages don't support it yet
- pandas tries to build from source on Python 3.13 and fails with compilation errors
- Python 3.11 is stable and has full package support

## If It Still Fails

If you still see Python 3.13 in the logs:
1. Double-check the Python Version setting in Render dashboard
2. Make sure you saved the changes
3. Force a redeploy (Settings → Manual Deploy)
4. Wait for the build to complete

---

**Note**: The `runtime.txt` file in the backend directory specifies Python 3.11.10, but the dashboard setting will override it. Always set it in the dashboard.

