'use client';

import { useRouter } from 'next/navigation';
import { Camera, Upload, Video, History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: "Image Upload Detection",
      description: "Upload an image to detect emotions",
      icon: <Upload className="w-6 h-6" />,
      path: "/Face/UploadDetection",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      title: "Video Processing",
      description: "Process video files for emotion detection",
      icon: <Video className="w-6 h-6" />,
      path: "/Face/VideoProcessing",
      gradient: "from-green-500 to-teal-500"
    },
    
    // {
    //   title: "Detection History",
    //   description: "View your previous detection results",
    //   icon: <History className="w-6 h-6" />,
    //   path: "/Face/History",
    //   gradient: "from-pink-500 to-rose-500"
    // }
  ];

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-zinc-100">
              Emotion Detection Suite
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Advanced emotion detection powered by AI. Upload images, process videos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => router.push(feature.path)}
                className="group text-left w-full"
              >
                <Card className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-zinc-100">{feature.title}</CardTitle>
                        <CardDescription className="text-zinc-400">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </button>
            ))}
          </div>

          
        </div>
      </div>
    </div>
  );
}

