// 'use client';

// import { useState } from 'react';

// const LiveStreamDetection = () => {
//     const [emotion, setEmotion] = useState<string>("");
//     const [websocket, setWebSocket] = useState<WebSocket | null>(null);
//     const [isLive, setIsLive] = useState(false);

//     const startLiveStream = () => {
//         const ws = new WebSocket("ws://localhost:8000/ws");
//         setWebSocket(ws);
//         setIsLive(true);

//         ws.onmessage = (event) => {
//             setEmotion(event.data);
//         };

//         ws.onerror = (error) => {
//             console.error("WebSocket error:", error);
//         };

//         ws.onclose = () => {
//             console.log("WebSocket connection closed");
//             setIsLive(false);
//         };
//     };

//     const stopLiveStream = () => {
//         if (websocket) {
//             websocket.close();
//             setWebSocket(null);
//             setIsLive(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4">
//             <div className="max-w-3xl mx-auto">
//                 <h1 className="text-3xl font-bold mb-8 text-center">Live Stream Emotion Detection</h1>

//                 <div className="bg-black p-6 rounded-lg shadow-lg">
//                     {!isLive ? (
//                         <button 
//                             onClick={startLiveStream} 
//                             className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
//                         >
//                             Start Live Emotion Detection
//                         </button>
//                     ) : (
//                         <button 
//                             onClick={stopLiveStream} 
//                             className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
//                         >
//                             Stop Live Emotion Detection
//                         </button>
//                     )}

//                     {emotion && (
//                         <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
//                             <h2 className="text-xl font-semibold mb-2">Detected Emotion:</h2>
//                             <p className="text-2xl font-bold text-green-400">{emotion}</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LiveStreamDetection;