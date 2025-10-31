'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Video, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VideoProcessing() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedVideoUrl, setProcessedVideoUrl] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const ws = useRef<WebSocket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/ws');
        
        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.progress) {
                    setProgress(data.progress);
                }
            } catch {
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
            
            // Create preview URL
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
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

    const resetForm = () => {
        setFile(null);
        setPreviewUrl("");
        setProcessedVideoUrl("");
        setError("");
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-zinc-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                        Video Emotion Detection
                    </h1>
                    <p className="text-zinc-400">Upload a video to detect and analyze emotions in real-time</p>
                </div>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Process Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="relative">
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="hidden"
                                    accept="video/*"
                                    id="video-upload"
                                />
                                <label 
                                    htmlFor="video-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors cursor-pointer bg-zinc-800/50"
                                >
                                    <Upload className="w-8 h-8 mb-2 text-zinc-400" />
                                    <span className="text-sm text-zinc-400">
                                        {file ? file.name : 'Drop your video here or click to browse'}
                                    </span>
                                </label>
                            </div>

                            {previewUrl && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium mb-2">Preview:</h3>
                                    <video 
                                        src={previewUrl}
                                        controls
                                        className="w-full rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleUpload}
                                    className="flex-1"
                                    disabled={isProcessing || !file}
                                    variant="default"
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Video className="w-4 h-4 mr-2" />
                                            Process Video
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={resetForm}
                                    variant="outline"
                                    className="border-zinc-700 hover:bg-zinc-800"
                                >
                                    Reset
                                </Button>
                            </div>

                            {isProcessing && (
                                <div className="space-y-2">
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
                                            style={{width: `${progress}%`}}
                                        />
                                    </div>
                                    <p className="text-sm text-zinc-400 text-center">
                                        Processing: {progress.toFixed(1)}%
                                    </p>
                                </div>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {processedVideoUrl && (
                                <div className="space-y-4">
                                    <div className="border border-zinc-800 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3">Processed Result</h3>
                                        <video 
                                            controls 
                                            src={processedVideoUrl}
                                            className="w-full rounded-lg"
                                        />
                                    </div>
                                    
                                    <Button 
                                        asChild
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <a href={processedVideoUrl} download="processed_video.mp4">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Processed Video
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}