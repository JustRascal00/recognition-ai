'use client';

import { useState } from 'react';
import axios from 'axios';
import '../styles.css';

const VideoProcessing = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedVideoUrl, setProcessedVideoUrl] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            // Check if the file is a video
            if (!selectedFile.type.startsWith('video/')) {
                setError('Please select a video file');
                return;
            }
            setFile(selectedFile);
            setError("");
            setProcessedVideoUrl("");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a video file first');
            return;
        }

        setIsProcessing(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:8000/process-video/", formData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Create a URL for the processed video
            const videoUrl = URL.createObjectURL(response.data);
            setProcessedVideoUrl(videoUrl);
        } catch (error) {
            console.error("Error processing video:", error);
            setError('Error processing video. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container">
            <h1 className="title">Video Emotion Detection</h1>

            <div className="card">
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="fileInput"
                    accept="video/*"
                />
                
                <button 
                    onClick={handleUpload} 
                    className="button" 
                    disabled={isProcessing || !file}
                >
                    {isProcessing ? 'Processing Video...' : 'Process Video'}
                </button>

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                {processedVideoUrl && (
                    <div className="videoContainer">
                        <h2>Processed Video:</h2>
                        <video 
                            controls 
                            src={processedVideoUrl}
                            className="processedVideo"
                        >
                            Your browser does not support the video tag.
                        </video>
                        <a 
                            href={processedVideoUrl} 
                            download="processed_video.mp4"
                            className="button downloadButton"
                        >
                            Download Processed Video
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoProcessing;