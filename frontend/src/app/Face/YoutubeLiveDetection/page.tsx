'use client'

import { useState, useEffect, useRef } from 'react'

export default function YoutubeLiveDetection() {
  const [videoId, setVideoId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [emotion, setEmotion] = useState('')
  const [error, setError] = useState('')
  const [image, setImage] = useState<string | null>(null)  // New state for the image
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const startProcessing = async () => {
    setIsProcessing(true)
    setError('')
    setEmotion('')
    setImage(null)  // Reset the image

    try {
      ws.current = new WebSocket('ws://localhost:8000/ws/youtube')

      ws.current.onopen = () => {
        if (ws.current) {
          ws.current.send(JSON.stringify({ action: 'start', videoId }))
        }
      }

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.emotion) {
          setEmotion(data.emotion)
        }
        if (data.image) {
          setImage(`data:image/jpeg;base64,${data.image}`)
        }
        if (data.error) {
          setError(data.error)
          setIsProcessing(false)
        }
      }

      ws.current.onclose = () => {
        setIsProcessing(false)
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('WebSocket connection failed')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to start processing')
      setIsProcessing(false)
    }
  }

  const stopProcessing = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ action: 'stop' }))
      ws.current.close()
    }
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6 flex items-center justify-center">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-zinc-100 mb-6">YouTube Live Detection</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter YouTube Video ID"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={isProcessing ? stopProcessing : startProcessing}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 ${
              isProcessing
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Stop Processing' : 'Start Processing'}
          </button>

          {emotion && (
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-zinc-100">Detected Emotion:</p>
              <p className="text-xl text-green-400">{emotion}</p>
            </div>
          )}

          {image && (
            <div className="mt-4 text-center">
              <img src={image} alt="Detected Frame" className="rounded-lg shadow-md" />
            </div>
          )}

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  )
}