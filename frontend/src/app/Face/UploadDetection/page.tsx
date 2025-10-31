'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Upload, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UploadDetection = () => {
    const [file, setFile] = useState<File | null>(null);
    const [emotion, setEmotion] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setError("");
            setEmotion("");
            
            // Create preview URL
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select an image file first');
            return;
        }

        setIsUploading(true);
        setError("");
        
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:8000/recognize/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setEmotion(response.data.emotion);
        } catch (error) {
            setError('Error processing the image. Please try again.');
            console.error("Error uploading the file", error);
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setPreviewUrl("");
        setEmotion("");
        setError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-zinc-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                        Emotion Detection
                    </h1>
                    <p className="text-zinc-400">Upload an image to detect and analyze emotions</p>
                </div>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Upload Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="relative">
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    onChange={handleFileChange} 
                                    className="hidden"
                                    accept="image/*"
                                    id="image-upload"
                                />
                                <label 
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors cursor-pointer bg-zinc-800/50"
                                >
                                    <Upload className="w-8 h-8 mb-2 text-zinc-400" />
                                    <span className="text-sm text-zinc-400">
                                        {file ? file.name : 'Drop your image here or click to browse'}
                                    </span>
                                </label>
                            </div>

                            {previewUrl && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium mb-2">Preview:</h3>
                                    <div className="relative aspect-video">
                                        <Image 
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            className="rounded-lg object-contain"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleUpload}
                                    className="flex-1"
                                    disabled={isUploading || !file}
                                    variant="default"
                                >
                                    {isUploading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-4 h-4 mr-2" />
                                            Detect Emotion
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

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {emotion && (
                                <Card className="border-zinc-800 bg-zinc-800/50">
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <h3 className="text-lg font-semibold mb-2">Detected Emotion</h3>
                                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                                                {emotion}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UploadDetection;