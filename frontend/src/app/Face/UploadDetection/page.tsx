'use client';

import { useState } from 'react';
import axios from 'axios';
import '../styles.css';  // Adjust the path to import styles correctly

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
        <div className="container">
            <h1 className="title">Emotion Detection (Upload)</h1>

            <div className="card">
                <input type="file" onChange={handleFileChange} className="fileInput" />
                <button onClick={handleUpload} className="button" disabled={isUploading}>
                    {isUploading ? (
                        <div className="spinner"></div>
                    ) : (
                        'Upload & Detect Emotion'
                    )}
                </button>

                {emotion && (
                    <div className="result">
                        <h2 className="resultText">Detected Emotion: {emotion}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadDetection;
