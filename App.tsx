import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TechniqueSelectionScreen } from './src/screens/TechniqueSelectionScreen';
import { TechniqueDetailScreen } from './src/screens/TechniqueDetailScreen';
import { CustomTechniqueScreen } from './src/screens/CustomTechniqueScreen';
import { BreathingScreen } from './src/screens/BreathingScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BreathingTechnique } from './src/types';

type Screen =
  | 'Welcome'
  | 'TechniqueSelection'
  | 'TechniqueDetail'
  | 'CustomTechnique'
  | 'Breathing'
  | 'History'
  | 'Progress'
  | 'Settings';

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

  const navigateToCustomTechnique = (technique?: BreathingTechnique) => {
    if (technique) {
      setSelectedTechnique(technique);
    }
    setCurrentScreen('CustomTechnique');
  };

  const navigateBackFromCustom = () => {
    setCurrentScreen('TechniqueSelection');
    setSelectedTechnique(null);
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
    setSelectedTechnique(null);
  };

  const handleEditTechnique = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique);
    setCurrentScreen('CustomTechnique');
  };

  const handleDeleteTechnique = () => {
    setRefreshKey((prev) => prev + 1); // Force refresh of technique list
    setCurrentScreen('TechniqueSelection');
    setSelectedTechnique(null);
  };

  const navigateToSettings = () => {
    setCurrentScreen('Settings');
  };

  const navigateBackFromSettings = () => {
    setCurrentScreen('TechniqueSelection');
  };

  const navigateToHistory = () => {
    setCurrentScreen('History');
  };

  const navigateBackFromHistory = () => {
    setCurrentScreen('Settings');
  };

  const navigateToProgress = () => {
    setCurrentScreen('Progress');
  };

  const navigateBackFromProgress = () => {
    setCurrentScreen('Settings');
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
          onSettings={navigateToSettings}
          onBack={navigateBack}
        />
      )}
      {currentScreen === 'TechniqueDetail' && selectedTechnique && (
        <TechniqueDetailScreen
          technique={selectedTechnique}
          onBack={navigateBackFromDetail}
          onStart={() => navigateToBreathing(selectedTechnique)}
          onEdit={selectedTechnique.isCustom ? handleEditTechnique : undefined}
          onDelete={selectedTechnique.isCustom ? handleDeleteTechnique : undefined}
        />
      )}
      {currentScreen === 'CustomTechnique' && (
        <CustomTechniqueScreen
          technique={selectedTechnique?.isCustom ? selectedTechnique : undefined}
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
      {currentScreen === 'History' && (
        <HistoryScreen onBack={navigateBackFromHistory} />
      )}
      {currentScreen === 'Progress' && (
        <ProgressScreen onBack={navigateBackFromProgress} />
      )}
      {currentScreen === 'Settings' && (
        <SettingsScreen
          onBack={navigateBackFromSettings}
          onNavigateToHistory={navigateToHistory}
          onNavigateToProgress={navigateToProgress}
        />
      )}
      <StatusBar style="auto" />
    </>
  );
}
