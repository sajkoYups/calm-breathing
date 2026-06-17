import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TechniqueSelectionScreen } from './src/screens/TechniqueSelectionScreen';
import { TechniqueDetailScreen } from './src/screens/TechniqueDetailScreen';
import { BreathingScreen } from './src/screens/BreathingScreen';
import { PowerBreathingScreen } from './src/screens/PowerBreathingScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SafetyNoticeModal } from './src/components/SafetyNoticeModal';
import { BreathingTechnique, SessionConfig } from './src/types';
import { getUserSettings, saveUserSettings } from './src/utils/storage';

type Screen =
  | 'Welcome'
  | 'TechniqueSelection'
  | 'TechniqueDetail'
  | 'Breathing'
  | 'History'
  | 'Progress'
  | 'Settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Welcome');
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [showFullSafety, setShowFullSafety] = useState(false);
  const [showShortSafety, setShowShortSafety] = useState(false);
  const [pendingSessionConfig, setPendingSessionConfig] = useState<SessionConfig | null>(null);

  useEffect(() => {
    getUserSettings().then((settings) => {
      if (!settings.safetyAcknowledged) {
        setShowFullSafety(true);
      }
    });
  }, []);

  const navigateToTechniqueSelection = () => {
    getUserSettings().then((settings) => {
      if (!settings.safetyAcknowledged) {
        setShowFullSafety(true);
      } else {
        setCurrentScreen('TechniqueSelection');
      }
    });
  };

  const handleFullSafetyContinue = async () => {
    await saveUserSettings({ safetyAcknowledged: true });
    setShowFullSafety(false);
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

  const handleStartSession = (config: SessionConfig) => {
    setPendingSessionConfig(config);
    setShowShortSafety(true);
  };

  const handleShortSafetyContinue = () => {
    if (pendingSessionConfig) {
      setSessionConfig(pendingSessionConfig);
      setPendingSessionConfig(null);
      setShowShortSafety(false);
      setCurrentScreen('Breathing');
    }
  };

  const navigateBackFromBreathing = () => {
    setSessionConfig(null);
    setCurrentScreen('TechniqueSelection');
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
    setCurrentScreen('TechniqueSelection');
  };

  const isPowerSession = sessionConfig?.technique.kind === 'power';

  return (
    <>
      {currentScreen === 'Welcome' && (
        <WelcomeScreen onNavigate={navigateToTechniqueSelection} />
      )}
      {currentScreen === 'TechniqueSelection' && (
        <TechniqueSelectionScreen
          onViewDetail={navigateToDetail}
          onTrackProgress={navigateToProgress}
          onSettings={navigateToSettings}
          onBack={navigateBack}
        />
      )}
      {currentScreen === 'TechniqueDetail' && selectedTechnique && (
        <TechniqueDetailScreen
          technique={selectedTechnique}
          onBack={navigateBackFromDetail}
          onStart={handleStartSession}
        />
      )}
      {currentScreen === 'Breathing' && sessionConfig && !isPowerSession && (
        <BreathingScreen config={sessionConfig} onBack={navigateBackFromBreathing} />
      )}
      {currentScreen === 'Breathing' && sessionConfig && isPowerSession && (
        <PowerBreathingScreen config={sessionConfig} onBack={navigateBackFromBreathing} />
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

      <SafetyNoticeModal
        visible={showFullSafety}
        mode="full"
        onContinue={handleFullSafetyContinue}
      />
      <SafetyNoticeModal
        visible={showShortSafety}
        mode="short"
        onContinue={handleShortSafetyContinue}
      />

      <StatusBar style="auto" />
    </>
  );
}
