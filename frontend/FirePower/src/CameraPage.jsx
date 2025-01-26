import React from 'react'
import Navbar from './components/Navbar'

import './CameraPage.css'
function CameraPage() {
    const currentip = "https://172.20.10.2:8000"; 


    async function getMedia(){
        const constraints = {
            audio: false,
            video: {
                facingMode: "environment"  // This will prioritize the back-facing camera
            }
        };
        console.log("test")
        let stream = null;
        const videoElement = document.getElementById('videoElement');
        try {

            stream = await navigator.mediaDevices.getUserMedia(constraints);

            videoElement.srcObject = stream;
            let isRecording = false;
            console.log("Here")
            // Function to handle a single recording session
            function startRecordingSession() {
                let recordedChunks = [];
                console.log("start req") 
                // Don't start a new recording if one is in progress
                if (isRecording) return;
                console.log("media req") 
                let mimeType = 'video/webm'; // Default MIME type
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/mp4'; // Fallback to MP4
                    console.log('WebM not supported, falling back to MP4');
                }
                let mediaRecorder = new MediaRecorder(stream, {
                    mimeType
                });
                console.log("mime") 
    
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };
    
                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, {
                        type: mimeType === 'video/webm' ? 'video/webm' : 'video/mp4'
                    });
                    sendToServer(blob);
                    isRecording = false;
                    console.log("Clip recorded and sent");
                };
    
                // Start recording
                isRecording = true;
                mediaRecorder.start();
                console.log("Started recording");
    
                // Stop after 10 seconds
                setTimeout(() => {
                    if (mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }
                }, 10000);
            }
            startRecordingSession(); 
            setInterval(startRecordingSession, 60000); 
          
        } catch (err) {
          /* handle the error */
            console.log("We are cooked chat");
            console.log(err);
        }
    }

    async function sendToServer(blob) {
        const formData = new FormData();
        formData.append('video', blob, `clip-${Date.now()}.mp4`); // Unique filename
    
        try {
            const response = await fetch(currentip+'/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            console.log('Video uploaded successfully:', result);
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    }
    return (
        <>
            <Navbar/>
            <div>
                <p>Camera View</p>
                <button onClick={getMedia} color="#841584">Click Me</button>
                <video className = "block mx-auto " id="videoElement" autoPlay></video>
            </div>
            
        </>
    )
}


export default CameraPage