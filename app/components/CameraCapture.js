'use client';

import { useState, useRef } from 'react';

export default function CameraCapture({ onCapture, onError }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      onError?.('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !isCapturing) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      // Convert blob to png using imageUtils
      const formData = new FormData();
      formData.append('image', blob, 'capture.png');
      onCapture?.(formData);
      stopCapture();
    }, 'image/png');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isCapturing ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-lg rounded-lg shadow-lg"
          />
          <div className="flex gap-4">
            <button
              onClick={takePhoto}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Take Photo
            </button>
            <button
              onClick={stopCapture}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={startCapture}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Open Camera
        </button>
      )}
    </div>
  );
}