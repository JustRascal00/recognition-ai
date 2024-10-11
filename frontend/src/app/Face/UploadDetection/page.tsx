'use client';

import { useState } from 'react';
import axios from 'axios';

const UploadDetection = () => {
    const [file, setFile] = useState<File | null>(null);
    const [emotion, setEmotion] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (file) {
            setIsUploading(true);
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
                console.error("Error uploading the file", error);
            } finally {
                setIsUploading(false);
            }
        } else {
            console.error("No file selected.");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Emotion Detection (Upload)</h1>

                <div className="bg-black p-6 rounded-lg shadow-lg">
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="w-full mb-4 p-2 bg-zinc-800 rounded border border-zinc-700 text-zinc-100"
                    />
                    <button 
                        onClick={handleUpload} 
                        className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:bg-zinc-500 disabled:cursor-not-allowed"
                        disabled={isUploading || !file}
                    >
                        {isUploading ? (
                            <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-zinc-100 mr-2"></div>
                                Uploading...
                            </div>
                        ) : (
                            'Upload & Detect Emotion'
                        )}
                    </button>

                    {emotion && (
                        <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">Detected Emotion:</h2>
                            <p className="text-2xl font-bold text-green-400">{emotion}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadDetection;