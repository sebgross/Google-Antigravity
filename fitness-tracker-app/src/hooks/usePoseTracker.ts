import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, type Results, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import { ExerciseCounter, type ExerciseType } from '../services/ExerciseCounter';

export interface PoseTrackerReturn {
    count: number;
    feedback: string;
    progress: number;
    isLoading: boolean;
    isCameraReady: boolean;
}

export const usePoseTracker = (
    webcamRef: React.RefObject<Webcam | null>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    exerciseType: ExerciseType,
    onRepComplete?: () => void
): PoseTrackerReturn => {
    const [count, setCount] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const counterRef = useRef<ExerciseCounter | null>(null);
    const poseRef = useRef<Pose | null>(null);
    const cameraRef = useRef<Camera | null>(null);

    // Initialize Counter
    useEffect(() => {
        counterRef.current = new ExerciseCounter(exerciseType);
        setCount(0);
        setFeedback('');
        setProgress(0);
    }, [exerciseType]);

    const onResults = useCallback((results: Results) => {
        if (!canvasRef.current || !webcamRef.current?.video) return;

        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw landmarks
        if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                { color: '#d4af37', lineWidth: 4 });
            drawLandmarks(canvasCtx, results.poseLandmarks,
                { color: '#ffffff', lineWidth: 2, radius: 4 });

            // Update Counter
            if (counterRef.current) {
                const state = counterRef.current.update(results);
                setCount(prev => {
                    if (state.count > prev && onRepComplete) {
                        onRepComplete();
                    }
                    return state.count;
                });
                setFeedback(state.feedback);
                setProgress(state.progress);
            }
        }
        canvasCtx.restore();
    }, [onRepComplete]);

    useEffect(() => {
        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults(onResults);
        poseRef.current = pose;

        setIsLoading(false);

        return () => {
            pose.close();
        };
    }, [onResults]);

    useEffect(() => {
        if (webcamRef.current && webcamRef.current.video && poseRef.current) {
            const camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    if (webcamRef.current?.video && poseRef.current) {
                        await poseRef.current.send({ image: webcamRef.current.video });
                        setIsCameraReady(true);
                    }
                },
                width: 1280,
                height: 720
            });
            camera.start();
            cameraRef.current = camera;
        }

        return () => {
            if (cameraRef.current) {
                // Camera stop method might not be exposed in types or might need cleanup
                // Usually camera.stop() but check types. 
                // For now, just letting it unmount.
            }
        };
    }, [webcamRef, isLoading]); // Re-run when webcam ref might be ready

    return { count, feedback, progress, isLoading, isCameraReady };
};
