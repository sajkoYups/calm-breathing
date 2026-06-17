import { StatusBar } from 'expo-status-bar';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect, useRef, useCallback } from 'react';
import { BackHandler, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TechniqueSelectionScreen } from './src/screens/TechniqueSelectionScreen';
import { TechniqueDetailScreen } from './src/screens/TechniqueDetailScreen';
import { BreathingScreen } from './src/screens/BreathingScreen';
import { PowerBreathingScreen } from './src/screens/PowerBreathingScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SafetyNoticeModal } from './src/components/SafetyNoticeModal';
import { MainTabBar, MainTab } from './src/components/ui';
import { BreathingTechnique, SessionConfig } from './src/types';
import { getUserSettings, saveUserSettings } from './src/utils/storage';

SplashScreen.preventAutoHideAsync();

type OverlayScreen = 'welcome' | 'detail' | 'breathing' | 'history';

export default function App() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
  });

  const [activeTab, setActiveTab] = useState<MainTab>('breathe');
  const [overlayStack, setOverlayStack] = useState<OverlayScreen[]>([]);
  const [welcomeMode, setWelcomeMode] = useState<'onboarding' | 'about'>('onboarding');
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [showFullSafety, setShowFullSafety] = useState(false);
  const [showShortSafety, setShowShortSafety] = useState(false);
  const [pendingSessionConfig, setPendingSessionConfig] = useState<SessionConfig | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const overlayStackRef = useRef(overlayStack);
  overlayStackRef.current = overlayStack;

  const showTabBar = overlayStack.length === 0;
  const currentOverlay = overlayStack[overlayStack.length - 1];

  const pushOverlay = useCallback((screen: OverlayScreen) => {
    setOverlayStack((stack) => [...stack, screen]);
  }, []);

  const popOverlay = useCallback(() => {
    const stack = overlayStackRef.current;
    if (stack.length === 0) return;

    const leaving = stack[stack.length - 1];
    if (leaving === 'breathing') {
      setSessionConfig(null);
    }

    setOverlayStack(stack.length <= 1 ? [] : stack.slice(0, -1));
  }, []);

  const clearOverlays = useCallback(() => {
    setOverlayStack([]);
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    getUserSettings().then((settings) => {
      if (!settings.safetyAcknowledged) {
        setShowFullSafety(true);
      }
      if (!settings.hasSeenWelcome) {
        setWelcomeMode('onboarding');
        setOverlayStack(['welcome']);
      }
      setInitialLoadDone(true);
      SplashScreen.hideAsync();
    });
  }, [fontsLoaded]);

  const completeOnboarding = async () => {
    const settings = await getUserSettings();
    await saveUserSettings({ hasSeenWelcome: true });
    clearOverlays();
    setActiveTab('breathe');
    if (!settings.safetyAcknowledged) {
      setShowFullSafety(true);
    }
  };

  const handleFullSafetyContinue = async () => {
    await saveUserSettings({ safetyAcknowledged: true, hasSeenWelcome: true });
    setShowFullSafety(false);
    clearOverlays();
    setActiveTab('breathe');
  };

  const navigateToDetail = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique);
    pushOverlay('detail');
  };

  const handleStartSession = (config: SessionConfig) => {
    setPendingSessionConfig(config);
    setShowShortSafety(true);
  };

  const handleShortSafetyContinue = () => {
    if (pendingSessionConfig) {
      setSessionConfig(pendingSessionConfig);
      setSessionKey((k) => k + 1);
      setPendingSessionConfig(null);
      setShowShortSafety(false);
      pushOverlay('breathing');
    }
  };

  const handleBreatheAgain = () => {
    setSessionKey((k) => k + 1);
  };

  const navigateToHistory = () => {
    pushOverlay('history');
  };

  const navigateToAbout = () => {
    setWelcomeMode('about');
    pushOverlay('welcome');
  };

  const handleStartSessionFromEmpty = () => {
    setActiveTab('breathe');
  };

  const handleHardwareBack = useCallback(() => {
    const stack = overlayStackRef.current;
    if (stack.length === 0) {
      return true;
    }
    if (stack[stack.length - 1] === 'breathing') {
      return false;
    }
    popOverlay();
    return true;
  }, [popOverlay]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => subscription.remove();
  }, [handleHardwareBack]);

  if (!fontsLoaded || !initialLoadDone) {
    return null;
  }

  const isPowerSession = sessionConfig?.technique.kind === 'power';

  const renderOverlay = () => {
    switch (currentOverlay) {
      case 'welcome':
        return (
          <WelcomeScreen
            mode={welcomeMode}
            onNavigate={welcomeMode === 'onboarding' ? completeOnboarding : undefined}
            onBack={welcomeMode === 'about' ? popOverlay : undefined}
          />
        );
      case 'detail':
        return selectedTechnique ? (
          <TechniqueDetailScreen
            technique={selectedTechnique}
            onBack={popOverlay}
            onStart={handleStartSession}
          />
        ) : null;
      case 'breathing':
        return sessionConfig && !isPowerSession ? (
          <BreathingScreen
            key={sessionKey}
            config={sessionConfig}
            onBack={popOverlay}
            onBreatheAgain={handleBreatheAgain}
          />
        ) : sessionConfig && isPowerSession ? (
          <PowerBreathingScreen
            key={sessionKey}
            config={sessionConfig}
            onBack={popOverlay}
            onBreatheAgain={handleBreatheAgain}
          />
        ) : null;
      case 'history':
        return (
          <HistoryScreen
            onBack={popOverlay}
            onStartSession={() => {
              clearOverlays();
              setActiveTab('breathe');
            }}
          />
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'breathe':
        return <TechniqueSelectionScreen onViewDetail={navigateToDetail} />;
      case 'progress':
        return (
          <ProgressScreen showBack={false} onStartSession={handleStartSessionFromEmpty} />
        );
      case 'settings':
        return (
          <SettingsScreen
            showBack={false}
            onNavigateToHistory={navigateToHistory}
            onNavigateToAbout={navigateToAbout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        {overlayStack.length > 0 ? renderOverlay() : renderTabContent()}
        {showTabBar ? (
          <MainTabBar activeTab={activeTab} onTabPress={setActiveTab} />
        ) : null}
      </View>

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

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
