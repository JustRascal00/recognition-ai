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
                    setProcessedVideoUrl(`http://localhost:8000${event.data}`);
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
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Video Emotion Detection</h1>

                <div className="bg-black p-6 rounded-lg shadow-lg">
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="w-full mb-4 p-2 bg-zinc-800 rounded border border-zinc-700 text-zinc-100"
                        accept="video/*"
                    />
                    
                    <button 
                        onClick={handleUpload} 
                        className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:bg-zinc-500 disabled:cursor-not-allowed"
                        disabled={isProcessing || !file}
                    >
                        {isProcessing ? 'Processing Video...' : 'Process Video'}
                    </button>

                    {isProcessing && (
                        <div className="mt-4">
                            <div className="bg-zinc-700 rounded-full h-2.5">
                                <div 
                                    className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                                    style={{width: `${progress}%`}}
                                ></div>
                            </div>
                            <p className="text-center mt-2">{progress.toFixed(2)}% Complete</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    {processedVideoUrl && (
                        <div className="mt-6">
                            <h2 className="text-xl font-bold mb-4">Processed Video:</h2>
                            <video 
                                controls 
                                src={processedVideoUrl}
                                className="w-full rounded-lg"
                            >
                                Your browser does not support the video tag.
                            </video>
                            <a 
                                href={processedVideoUrl} 
                                download="processed_video.mp4"
                                className="mt-4 inline-block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out text-center"
                            >
                                Download Processed Video
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}