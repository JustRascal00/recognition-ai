'use client';

import { useRouter } from 'next/navigation';
import './Face/styles.css';

const Home = () => {
    const router = useRouter();

    return (
        <div className="container">
            <h1 className="title">Emotion Detection</h1>

            <div className="card">
                <button onClick={() => router.push('/Face/UploadDetection')} className="button">
                    Upload Image Detection
                </button>
                {/* <button onClick={() => router.push('/Face/LiveStreamDetection')} className="button">
                    Live Stream Detection
                </button> */}
                <button onClick={() => router.push('/Face/VideoProcessing')} className="button">
                    Video Emotion Detection
                </button>
            </div>
        </div>
    );
};

export default Home;