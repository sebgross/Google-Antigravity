import { useState } from 'react';
import SetupScreen, { type WorkoutConfig } from './pages/SetupScreen';
import WorkoutScreen from './pages/WorkoutScreen';

function App() {
  const [workoutConfig, setWorkoutConfig] = useState<WorkoutConfig | null>(null);

  const handleStart = (config: WorkoutConfig) => {
    setWorkoutConfig(config);
  };

  const handleBack = () => {
    setWorkoutConfig(null);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      {workoutConfig ? (
        <WorkoutScreen config={workoutConfig} onBack={handleBack} />
      ) : (
        <SetupScreen onStart={handleStart} />
      )}
    </div>
  );
}

export default App;
