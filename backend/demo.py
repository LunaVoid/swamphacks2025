from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime
from fastapi.responses import FileResponse

import subprocess

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
COMPLETED_DIR = "completedRuns"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_video(video: UploadFile = File(...)):
    try:
        # Create unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"video_{timestamp}.mp4"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save the video file
        with open(file_path, "wb") as buffer:
            content = await video.read()
            buffer.write(content)
        
        subprocess.Popen(["python", "yolov5-fire-detection/yolov5/detect.py", "--source", file_path, "--weights", "model/yolov5s_best.pt", "--conf", "0.35", "--project","./completedRuns","--name",filename])
        
        return {
            "filename": filename,
            "status": "success",
            "message": f"Video saved as {filename}"
        }
    
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/latest")
async def get_latest_video():
    try:
        
        
        folders = os.listdir(COMPLETED_DIR)
        folders.sort(reverse=True)
        print(folders)
        if not folders:
            return {
                "status": "error",
                "message": "No folders found"
            }
        folder_path = os.path.join(COMPLETED_DIR, folders[0])
        print("here file")
        if os.listdir(folder_path):
            print(os.listdir(folder_path)[0])
            print("Others")
            files = os.listdir(folder_path)
            files.sort(reverse=True)
            file =os.path.join(folder_path,files[0])
            subprocess.Popen(["ffmpeg -y -i ", file,"-c:v libx264 -preset ultrafast -crf 23 -an ",os.path.basename(file) ])
            return FileResponse(file, 
            media_type="video/mp4",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Disposition": f"inline; filename={os.path.basename(file)}"
            })
        else:
            return {
                "status": "error",
                "message": "No videos found"
            }
            
    except Exception as e:
        return {
            "status": "error sigma",
            "message": str(e)
        }


@app.get("/test-latest")
async def test_latest_video():
    try:
        folders = os.listdir(COMPLETED_DIR)
        return {
            "folders": folders,"first_folder": folders[1] if folders else None,
            "files": os.listdir(os.path.join(COMPLETED_DIR, folders[1])) if folders else None
        
            }
    except Exception as e:
        return {"error": str(e)}


@app.get("/latesttwo")
async def get_latest_video():
    try:
        folders = os.listdir(COMPLETED_DIR)
        folders.sort(reverse=True)
        
        if not folders:
            return {
                "status": "error",
                "message": "No folders found"
            }
            
        folder_path = os.path.join(COMPLETED_DIR, folders[0])
        print(folder_path)
        
        if os.listdir(folder_path):
            files = os.listdir(folder_path)
            files.sort(reverse=True)
            file = os.path.join(folder_path, files[0])
            print(file)
            # Ensure the converted directory exists
            converted_dir = "./converted"
            os.makedirs(converted_dir, exist_ok=True)

            # Construct the output file path
            output_filename = os.path.basename(file)
            output_file = os.path.join(converted_dir, output_filename)

            print(output_file)
            subprocess.run([
                "ffmpeg",
                "-y",
                "-i", file,
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-crf", "23",
                "-an",
                output_file
            ])
            return FileResponse(
                path=output_file,
                media_type='video/mp4',
                headers={
                    'Content-Type': 'video/mp4',
                    'Access-Control-Allow-Origin': '*',
                    'Accept-Ranges': 'bytes'
            }
    )

        else:
            return {
                "status": "error",
                "message": "No videos found"
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# FastAPI endpoint
@app.get("/latestthree")
async def get_latest_video():
    try:
        
        return FileResponse(
                path="./completedRuns/exp2/input.mp4",
                media_type='video/mp4',
                headers={
                    'Content-Type': 'video/mp4',
                    'Access-Control-Allow-Origin': '*',
                    'Accept-Ranges': 'bytes'
            }
        )
    except Exception as e:
        # Log the error or handle it accordingly
        return {"error": str(e)}, HTTP_500_INTERNAL_SERVER_ERROR
        


# Optional: Endpoint to check server status
@app.get("/")
async def root():
    return {"status": "Server is running"}