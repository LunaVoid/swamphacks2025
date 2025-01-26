import os
import cv2
from av import VideoFrame
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaRelay, MediaBlackhole
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import torch

app = FastAPI()

# Allow CORS for all origins for simplicity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

model = torch.hub.load('ultralytics/yolov5', 'custom', path='model/yolov5s_best.pt')

class Offer(BaseModel):
    sdp: str
    type: str

class VideoTransformTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self, track):
        super().__init__()  # Don't forget to call the parent constructor
        self.track = track

    async def recv(self):
        frame = await self.track.recv()
        img = frame.to_ndarray(format="bgr24")
        img = cv2.resize(img, (640, 480))  # Resize the image to 640x480 for faster processing

        
        # height, width, _ = img.shape
        # top_left = (int(width * 0.3), int(height * 0.3))
        # bottom_right = (int(width * 0.7), int(height * 0.7))
        # cv2.rectangle(img, top_left, bottom_right, (255, 0, 0), 2)

        # new_frame = VideoFrame.from_ndarray(img, format="bgr24")
        # new_frame.pts = frame.pts
        # new_frame.time_base = frame.time_base
        results = model(img, size=640)  # Use a smaller size for the model inference
        results = model(img)
        
        for *box, conf, cls in results.xyxy[0].numpy():
            x1, y1, x2, y2 = map(int, box)
            label = f'{model.names[int(cls)]} {conf:.2f}'
            cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
        
        new_frame = VideoFrame.from_ndarray(img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        return new_frame

@app.post("/offer")
async def offer(params: Offer):
    offer = RTCSessionDescription(sdp=params.sdp, type=params.type)

    pc = RTCPeerConnection()
    recorder = MediaBlackhole()

    relay = MediaRelay()

    @pc.on("datachannel")
    async def on_datachannel(channel):
        @channel.on("message")
        async def on_message(message):
            print(f"Message from data channel: {message}")

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        if pc.iceConnectionState == "failed":
            await pc.close()

    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            local_video = VideoTransformTrack(relay.subscribe(track))
            pc.addTrack(local_video)

    await pc.setRemoteDescription(offer)
    await recorder.start()

    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}

# @app.on_event("shutdown")
# async def on_shutdown():
#     pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)