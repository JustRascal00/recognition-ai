'use client';

import { useRouter } from 'next/navigation';  // Use Next.js router for navigation
import './Face/styles.css';  // Import styles for consistent design

const Home = () => {
    const router = useRouter();  // Initialize router to navigate between pages

    return (
        <div className="container">
            <h1 className="title">Emotion Detection</h1>

            <div className="card">
                <button onClick={() => router.push('/Face/UploadDetection')} className="button">
                    Upload Emotion Detection
                </button>
                <button onClick={() => router.push('/Face/LiveStreamDetection')} className="button">
                    Live Stream Emotion Detection
                </button>
            </div>
        </div>
    );
};

export default Home;
