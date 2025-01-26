import React, { useEffect, useRef } from 'react';

function Demo() {
  const videoRef = useRef();

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: ["stun:stun.l.google.com:19302"] }
      ]
    });

    pc.onicecandidate = event => {
      if (event.candidate) {
        console.log(event.candidate);
      }
    };

    pc.ontrack = event => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    const startWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        const response = await fetch('http://localhost:8000/offer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sdp: pc.localDescription.sdp,
            type: pc.localDescription.type
          })
        });

        const answer = await response.json();
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error starting WebRTC: ', error);
      }
    };

    startWebRTC();
  }, []);

  return (
    <>
    <div className="App">
      <h1 className='text-white'>WebRTC Video with OpenCV Annotations</h1>
      <video ref={videoRef} autoPlay playsInline style={{ width: '500px', height: 'auto' }}></video>
    </div>
    </>
  );
}

export default Demo;