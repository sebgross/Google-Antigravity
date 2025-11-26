import React, { useState } from 'react';
import type { ExerciseType } from '../services/ExerciseCounter';
import { Dumbbell, ArrowUp, ArrowDown, Plus, Home, User, ChevronRight, Clock, Flame, Calendar } from 'lucide-react';

interface SetupScreenProps {
    onStart: (config: WorkoutConfig) => void;
}

export interface WorkoutConfig {
    exerciseType: ExerciseType;
    targetSets: number;
    targetReps: number;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
    const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
    const [targetSets, setTargetSets] = useState(3);
    const [targetReps, setTargetReps] = useState(10);

    const exercises: { id: ExerciseType; label: string; icon: React.ReactNode; desc: string; time: string }[] = [
        { id: 'curl', label: 'Bicep Curls', icon: <Dumbbell size={24} />, desc: 'Arm strength', time: '15m' },
        { id: 'pushup', label: 'Pushups', icon: <ArrowDown size={24} />, desc: 'Chest & Triceps', time: '10m' },
        { id: 'pullup', label: 'Pullups', icon: <ArrowUp size={24} />, desc: 'Back & Lats', time: '20m' },
    ];

    const handleStart = () => {
        if (selectedExercise) {
            onStart({ exerciseType: selectedExercise, targetSets, targetReps });
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans pb-24">
            {/* Header Section */}
            <header className="p-6 pt-12 bg-[var(--color-bg)] sticky top-0 z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Hi, Athlete</h1>
                        <p className="text-[var(--color-text-muted)]">Here's your progress track</p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-[var(--color-surface-light)] flex items-center justify-center text-[var(--color-text)]">
                        <User size={20} />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#dcfce7] p-5 rounded-[var(--radius-lg)] text-[#14532d] relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-4xl font-bold mb-1">41</h3>
                            <p className="text-sm font-medium opacity-80">Workouts done</p>
                        </div>
                        <Flame className="absolute right-[-10px] bottom-[-10px] text-[#86efac] opacity-50 w-24 h-24" />
                    </div>
                    <div className="bg-[#fef9c3] p-5 rounded-[var(--radius-lg)] text-[#713f12] relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-4xl font-bold mb-1">4h 32</h3>
                            <p className="text-sm font-medium opacity-80">Time saved</p>
                        </div>
                        <Clock className="absolute right-[-10px] bottom-[-10px] text-[#fde047] opacity-50 w-24 h-24" />
                    </div>
                </div>

                {/* Streak Bar */}
                <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-lg)] flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-[var(--color-success)]/20 p-2 rounded-full text-[var(--color-success)]">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="font-bold">17 days</p>
                            <p className="text-xs text-[var(--color-text-muted)]">Current streak</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">36 days</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Best streak</p>
                    </div>
                </div>
            </header>

            {/* Activities Section */}
            <main className="px-6 rounded-t-[var(--radius-lg)] bg-[var(--color-text)] text-[var(--color-bg)] min-h-[500px] pt-8 -mt-4 relative z-0">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Activities</h2>
                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {exercises.map((ex) => (
                        <div key={ex.id} className="group">
                            <button
                                onClick={() => setSelectedExercise(selectedExercise === ex.id ? null : ex.id)}
                                className={`w-full text-left p-4 rounded-[var(--radius-md)] transition-all duration-300 flex items-center justify-between ${selectedExercise === ex.id
                                    ? 'bg-[var(--color-bg)] text-white shadow-lg scale-[1.02]'
                                    : 'bg-gray-100 hover:bg-gray-200 text-[var(--color-bg)]'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${selectedExercise === ex.id ? 'bg-[var(--color-surface-light)] text-white' : 'bg-white text-[var(--color-surface)]'
                                        }`}>
                                        {ex.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{ex.label}</h3>
                                        <p className={`text-sm ${selectedExercise === ex.id ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {ex.desc} • {ex.time}
                                        </p>
                                    </div>
                                </div>
                                <div className={`transition-transform duration-300 ${selectedExercise === ex.id ? 'rotate-90' : ''}`}>
                                    <ChevronRight size={20} className={selectedExercise === ex.id ? 'text-white' : 'text-gray-400'} />
                                </div>
                            </button>

                            {/* Configuration Panel (Expands when selected) */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${selectedExercise === ex.id ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                                }`}>
                                <div className="bg-gray-50 p-6 rounded-[var(--radius-md)] border border-gray-200">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="text-sm font-bold text-gray-700">Sets</label>
                                                <span className="font-mono font-bold text-[var(--color-primary)]">{targetSets}</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="10" value={targetSets}
                                                onChange={(e) => setTargetSets(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="text-sm font-bold text-gray-700">Reps</label>
                                                <span className="font-mono font-bold text-[var(--color-primary)]">{targetReps}</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="50" value={targetReps}
                                                onChange={(e) => setTargetReps(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                            />
                                        </div>
                                        <button
                                            onClick={handleStart}
                                            className="w-full btn-primary py-4 text-lg shadow-xl"
                                        >
                                            Start {ex.label}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-bg)]/90 backdrop-blur-xl border border-white/10 p-2 rounded-full flex items-center gap-2 shadow-2xl z-50">
                <button className="p-4 rounded-full bg-[var(--color-surface-light)] text-white">
                    <Home size={24} />
                </button>
                <button className="p-4 rounded-full bg-[var(--color-primary)] text-[var(--color-bg)] shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                    <Plus size={28} />
                </button>
                <button className="p-4 rounded-full hover:bg-white/5 text-[var(--color-text-muted)] transition-colors">
                    <User size={24} />
                </button>
            </nav>
        </div>
    );
};

export default SetupScreen;
