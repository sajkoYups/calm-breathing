import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors } from './colors';
import { cardShadow } from './spacing';

export * from './colors';
export * from './typography';
export * from './spacing';

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  shadow: ReturnType<typeof cardShadow>;
}

export const useTheme = (): Theme => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    shadow: cardShadow(colors.shadow),
  };
};
