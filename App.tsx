import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TechniqueSelectionScreen } from './src/screens/TechniqueSelectionScreen';
import { BreathingScreen } from './src/screens/BreathingScreen';
import { BreathingTechnique } from './src/types';

type Screen = 'Welcome' | 'TechniqueSelection' | 'Breathing';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Welcome');
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);

  const navigateToTechniqueSelection = () => {
    setCurrentScreen('TechniqueSelection');
  };

  const navigateBack = () => {
    setCurrentScreen('Welcome');
  };

  const navigateToBreathing = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique);
    setCurrentScreen('Breathing');
  };

  const navigateBackFromBreathing = () => {
    setCurrentScreen('TechniqueSelection');
  };

  return (
    <>
      {currentScreen === 'Welcome' && (
        <WelcomeScreen onNavigate={navigateToTechniqueSelection} />
      )}
      {currentScreen === 'TechniqueSelection' && (
        <TechniqueSelectionScreen
          onSelectTechnique={navigateToBreathing}
          onBack={navigateBack}
        />
      )}
      {currentScreen === 'Breathing' && selectedTechnique && (
        <BreathingScreen
          technique={selectedTechnique}
          onBack={navigateBackFromBreathing}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
