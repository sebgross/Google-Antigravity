import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { usePoseTracker } from '../hooks/usePoseTracker';
import type { WorkoutConfig } from './SetupScreen';

interface WorkoutScreenProps {
    config: WorkoutConfig;
    onBack: () => void;
}

const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ config, onBack }) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [currentSet, setCurrentSet] = useState(1);
    const [repsInSet, setRepsInSet] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [workoutComplete, setWorkoutComplete] = useState(false);

    // Audio context for beeps
    const audioContextRef = useRef<AudioContext | null>(null);

    const playBeep = useCallback((frequency: number = 440, duration: number = 0.1) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = frequency;
        osc.type = 'sine';

        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    }, []);

    const handleRepComplete = useCallback(() => {
        if (isResting || workoutComplete) return;

        setRepsInSet(prev => {
            const newReps = prev + 1;

            // Check for set completion
            if (newReps >= config.targetReps) {
                playBeep(880, 0.3); // Higher pitch for set complete

                if (currentSet >= config.targetSets) {
                    setWorkoutComplete(true);
                    setTimeout(onBack, 1000); // Auto-exit after 1 second
                } else {
                    setIsResting(true);
                    setTimeout(() => {
                        setIsResting(false);
                        setCurrentSet(s => s + 1);
                        setRepsInSet(0);
                    }, 5000); // 5 seconds rest
                }
                return config.targetReps;
            } else {
                playBeep(440, 0.1); // Normal beep
                return newReps;
            }
        });
    }, [config, currentSet, isResting, workoutComplete, playBeep]);

    const { feedback, progress, isLoading } = usePoseTracker(
        webcamRef,
        canvasRef,
        config.exerciseType,
        handleRepComplete
    );

    // Sync internal reps with tracker count (tracker count is total reps, but we track per set)
    // Actually, usePoseTracker returns total count. 
    // We can just use the callback to increment our local state.
    // But wait, if usePoseTracker increments count, we need to make sure we don't double count.
    // The callback is triggered when count increments. So we rely on the callback.

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={onBack} className="flex items-center gap-2 p-2 pr-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors">
                    <ArrowLeft size={24} />
                    <span className="font-medium">End Workout</span>
                </button>
                <div className="text-white font-mono text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    {config.exerciseType.toUpperCase()} • SET {currentSet}/{config.targetSets}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden bg-black">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    width="100%"
                    height="100%"
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "user"
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)'
                    }}
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)'
                    }}
                />
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white font-medium">Loading AI Model...</p>
                    </div>
                </div>
            )}

            {/* Stats Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
                <div className="max-w-md mx-auto">
                    {workoutComplete ? (
                        <div className="text-center animate-pulse-glow p-6 rounded-2xl bg-gold/20 border border-gold/50 backdrop-blur-md">
                            <CheckCircle className="w-16 h-16 text-gold mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-2">Workout Complete!</h2>
                            <p className="text-gray-300 mb-4">Great job crushing those {config.exerciseType}s.</p>
                            <p className="text-sm text-gold/80 mb-6">Returning to menu...</p>
                            <button onClick={onBack} className="btn-primary w-full">
                                Finish Now
                            </button>
                        </div>
                    ) : isResting ? (
                        <div className="text-center p-6 rounded-2xl bg-blue-500/20 border border-blue-500/50 backdrop-blur-md">
                            <h2 className="text-3xl font-bold text-white mb-2">Rest Time</h2>
                            <p className="text-blue-300">Get ready for Set {currentSet + 1}</p>
                            <div className="mt-4 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 animate-[width_5s_linear_reverse_forwards]" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-panel p-4 flex flex-col items-center justify-center">
                                <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Reps</span>
                                <span className="text-6xl font-bold text-white font-mono">{repsInSet}</span>
                                <span className="text-gray-500 text-xs">/ {config.targetReps}</span>
                            </div>
                            <div className="glass-panel p-4 flex flex-col items-center justify-center relative overflow-hidden">
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-gold/20 transition-all duration-300"
                                    style={{ height: `${progress * 100}%` }}
                                />
                                <span className="text-gray-400 text-xs uppercase tracking-wider mb-1 relative z-10">Feedback</span>
                                <span className={`text-xl font-bold text-center relative z-10 ${feedback.includes('Good') ? 'text-green-400' : 'text-white'}`}>
                                    {feedback || "Start Moving"}
                                </span>
                            </div>
                            <button
                                onClick={onBack}
                                className="col-span-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 p-4 rounded-xl font-bold uppercase tracking-wider transition-colors backdrop-blur-md"
                            >
                                End Workout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default WorkoutScreen;
