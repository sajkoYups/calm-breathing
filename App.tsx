import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TechniqueSelectionScreen } from './src/screens/TechniqueSelectionScreen';
import { TechniqueDetailScreen } from './src/screens/TechniqueDetailScreen';
import { CustomTechniqueScreen } from './src/screens/CustomTechniqueScreen';
import { BreathingScreen } from './src/screens/BreathingScreen';
import { BreathingTechnique } from './src/types';

type Screen = 'Welcome' | 'TechniqueSelection' | 'TechniqueDetail' | 'CustomTechnique' | 'Breathing';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Welcome');
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const navigateToTechniqueSelection = () => {
    setCurrentScreen('TechniqueSelection');
  };

  const navigateBack = () => {
    setCurrentScreen('Welcome');
  };

  const navigateToDetail = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique);
    setCurrentScreen('TechniqueDetail');
  };

  const navigateBackFromDetail = () => {
    setCurrentScreen('TechniqueSelection');
  };

  const navigateToCustomTechnique = () => {
    setCurrentScreen('CustomTechnique');
  };

  const navigateBackFromCustom = () => {
    setCurrentScreen('TechniqueSelection');
  };

  const navigateToBreathing = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique);
    setCurrentScreen('Breathing');
  };

  const navigateBackFromBreathing = () => {
    setCurrentScreen('TechniqueSelection');
  };

  const handleCustomTechniqueSaved = () => {
    setRefreshKey((prev) => prev + 1); // Force refresh of technique list
    setCurrentScreen('TechniqueSelection');
  };

  return (
    <>
      {currentScreen === 'Welcome' && (
        <WelcomeScreen onNavigate={navigateToTechniqueSelection} />
      )}
      {currentScreen === 'TechniqueSelection' && (
        <TechniqueSelectionScreen
          key={refreshKey}
          onViewDetail={navigateToDetail}
          onAddCustom={navigateToCustomTechnique}
          onBack={navigateBack}
        />
      )}
      {currentScreen === 'TechniqueDetail' && selectedTechnique && (
        <TechniqueDetailScreen
          technique={selectedTechnique}
          onBack={navigateBackFromDetail}
          onStart={() => navigateToBreathing(selectedTechnique)}
        />
      )}
      {currentScreen === 'CustomTechnique' && (
        <CustomTechniqueScreen
          onSave={handleCustomTechniqueSaved}
          onBack={navigateBackFromCustom}
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
