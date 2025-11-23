import React, { useState } from 'react';
import type { ExerciseType } from '../services/ExerciseCounter';
import { Dumbbell, ArrowUp, ArrowDown, Play, Activity, Settings } from 'lucide-react';

interface SetupScreenProps {
    onStart: (config: WorkoutConfig) => void;
}

export interface WorkoutConfig {
    exerciseType: ExerciseType;
    targetSets: number;
    targetReps: number;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
    const [exerciseType, setExerciseType] = useState<ExerciseType>('curl');
    const [targetSets, setTargetSets] = useState(3);
    const [targetReps, setTargetReps] = useState(10);

    const exercises: { id: ExerciseType; label: string; icon: React.ReactNode; desc: string }[] = [
        { id: 'curl', label: 'Bicep Curls', icon: <Dumbbell size={32} />, desc: 'Isolate and build arm strength' },
        { id: 'pushup', label: 'Pushups', icon: <ArrowDown size={32} />, desc: 'Build chest and triceps' },
        { id: 'pullup', label: 'Pullups', icon: <ArrowUp size={32} />, desc: 'Develop back and lats' },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-gold selection:text-black overflow-y-auto">
            {/* Background Gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/20 via-black to-black pointer-events-none" />

            <div className="relative max-w-5xl mx-auto p-6 md:p-12">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-gold/20">
                            <Activity className="text-black" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Fit<span className="text-gold">AI</span></h1>
                    </div>
                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                        <Settings size={24} />
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Exercise Selection */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold mb-2">Start your workout</h2>
                            <p className="text-gray-400 text-lg">Select an exercise to track with AI precision.</p>
                        </div>

                        <div className="grid gap-4">
                            {exercises.map((ex) => (
                                <button
                                    key={ex.id}
                                    onClick={() => setExerciseType(ex.id)}
                                    className={`group relative p-6 rounded-2xl border text-left transition-all duration-300 overflow-hidden ${exerciseType === ex.id
                                        ? 'border-gold bg-gold/10 shadow-[0_0_30px_-10px_rgba(212,175,55,0.3)]'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className={`p-4 rounded-xl transition-colors ${exerciseType === ex.id ? 'bg-gold text-black' : 'bg-white/10 text-gray-400 group-hover:text-white'
                                                }`}>
                                                {ex.icon}
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-bold mb-1 ${exerciseType === ex.id ? 'text-white' : 'text-gray-200'}`}>
                                                    {ex.label}
                                                </h3>
                                                <p className="text-sm text-gray-500">{ex.desc}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${exerciseType === ex.id ? 'border-gold bg-gold' : 'border-white/20'
                                            }`}>
                                            {exerciseType === ex.id && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Configuration */}
                    <div className="lg:col-span-5">
                        <div className="glass-panel p-8 sticky top-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Settings size={20} className="text-gold" />
                                Configuration
                            </h3>

                            <div className="space-y-8">
                                {/* Sets Input */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-300">Target Sets</label>
                                        <span className="text-2xl font-mono font-bold text-gold">{targetSets}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={targetSets}
                                        onChange={(e) => setTargetSets(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold hover:accent-yellow-400"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                                        <span>1</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                </div>

                                {/* Reps Input */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-300">Target Reps</label>
                                        <span className="text-2xl font-mono font-bold text-gold">{targetReps}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={targetReps}
                                        onChange={(e) => setTargetReps(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold hover:accent-yellow-400"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                                        <span>1</span>
                                        <span>25</span>
                                        <span>50</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-6 text-sm text-gray-400">
                                        <span>Estimated Duration</span>
                                        <span>~{targetSets * 2} mins</span>
                                    </div>

                                    <button
                                        onClick={() => onStart({ exerciseType, targetSets, targetReps })}
                                        className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 group"
                                    >
                                        Start Workout
                                        <Play size={20} className="group-hover:translate-x-1 transition-transform fill-black" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupScreen;
