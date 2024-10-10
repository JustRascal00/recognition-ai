'use client';

import { useState } from 'react';
import '../styles.css';  // Adjust the path to import styles correctly

const LiveStreamDetection = () => {
    const [emotion, setEmotion] = useState<string>("");
    const [websocket, setWebSocket] = useState<WebSocket | null>(null);
    const [isLive, setIsLive] = useState(false);

    const startLiveStream = () => {
        const ws = new WebSocket("ws://localhost:8000/ws");
        setWebSocket(ws);
        setIsLive(true);

        ws.onmessage = (event) => {
            setEmotion(event.data);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setIsLive(false);
        };
    };

    const stopLiveStream = () => {
        if (websocket) {
            websocket.close();
            setWebSocket(null);
            setIsLive(false);
        }
    };

    return (
        <div className="container">
            <h1 className="title">Live Stream Emotion Detection</h1>

            <div className="card">
                {!isLive ? (
                    <button onClick={startLiveStream} className="button">
                        Start Live Emotion Detection
                    </button>
                ) : (
                    <button onClick={stopLiveStream} className="button stop">
                        Stop Live Emotion Detection
                    </button>
                )}

                {emotion && (
                    <div className="result">
                        <h2 className="resultText">Detected Emotion: {emotion}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveStreamDetection;
