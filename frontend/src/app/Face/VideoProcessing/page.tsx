'use client';

import { useState, useEffect, useRef } from 'react';

export default function VideoProcessing() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedVideoUrl, setProcessedVideoUrl] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [progress, setProgress] = useState(0);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/ws');
        
        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.progress) {
                    setProgress(data.progress);
                }
            } catch (e) {
                if (event.data === "processing_complete") {
                    setIsProcessing(false);
                } else {
                    // Assume this is the processed video path
                    setProcessedVideoUrl(`http://localhost:8000/download_video/?video_path=${encodeURIComponent(event.data)}`);
                }
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
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
        if (!file || !ws.current) {
            setError('Please select a video file first');
            return;
        }

        setIsProcessing(true);
        setError("");
        setProgress(0);

        ws.current.send("start_processing");
        const reader = new FileReader();
        reader.onload = async (e) => {
            if (e.target && e.target.result && ws.current) {
                ws.current.send(e.target.result as ArrayBuffer);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Video Emotion Detection</h1>

            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="mb-4"
                    accept="video/*"
                />
                
                <button 
                    onClick={handleUpload} 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={isProcessing || !file}
                >
                    {isProcessing ? 'Processing Video...' : 'Process Video'}
                </button>

                {isProcessing && (
                    <div className="mt-4">
                        <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{width: `${progress}%`}}
                            ></div>
                        </div>
                        <p className="text-center mt-2">{progress.toFixed(2)}% Complete</p>
                    </div>
                )}

                {error && (
                    <div className="text-red-500 mt-4">
                        {error}
                    </div>
                )}

                {processedVideoUrl && (
                    <div className="mt-4">
                        <h2 className="text-xl font-bold mb-2">Processed Video:</h2>
                        <video 
                            controls 
                            src={processedVideoUrl}
                            className="w-full"
                        >
                            Your browser does not support the video tag.
                        </video>
                        <a 
                            href={processedVideoUrl} 
                            download="processed_video.mp4"
                            className="mt-4 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Download Processed Video
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
