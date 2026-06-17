import React, { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { BreathingTechnique } from '../types';
import { TechniqueCard } from '../components/TechniqueCard';
import { defaultTechniques } from '../data/breathingTechniques';
import { TAB_BAR_HEIGHT, getTimeGreeting, Screen, Text } from '../components/ui';
import { techniqueCategories } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface TechniqueSelectionScreenProps {
  onViewDetail?: (technique: BreathingTechnique) => void;
}

interface Section {
  key: string;
  label: string;
  techniques: BreathingTechnique[];
}

export const TechniqueSelectionScreen: React.FC<TechniqueSelectionScreenProps> = ({
  onViewDetail,
}) => {
  const sections = useMemo(() => {
    const techniqueMap = new Map(defaultTechniques.map((t) => [t.id, t]));
    const result: Section[] = [];

    (Object.keys(techniqueCategories) as Array<keyof typeof techniqueCategories>).forEach(
      (categoryKey) => {
        const category = techniqueCategories[categoryKey];
        const techniques = category.ids
          .map((id) => techniqueMap.get(id))
          .filter((t): t is BreathingTechnique => Boolean(t));
        if (techniques.length > 0) {
          result.push({ key: categoryKey, label: category.label, techniques });
        }
      }
    );

    return result;
  }, []);

  const handleCardPress = (technique: BreathingTechnique) => {
    onViewDetail?.(technique);
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.lg }}>
        <Text variant="caption" color="secondary">
          {getTimeGreeting()}
        </Text>
        <Text variant="display" style={{ fontSize: 28, lineHeight: 34 }}>
          Choose a technique
        </Text>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + spacing.xl }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: section }) => (
          <View style={{ marginBottom: spacing.xl }}>
            <Text
              variant="caption"
              color="secondary"
              style={{
                paddingHorizontal: spacing.lg,
                marginBottom: spacing.md,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              {section.label}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: spacing.lg - 6,
              }}
            >
              {section.techniques.map((technique) => (
                <TechniqueCard
                  key={technique.id}
                  technique={technique}
                  onPress={() => handleCardPress(technique)}
                />
              ))}
            </View>
          </View>
        )}
      />
    </Screen>
  );
};
