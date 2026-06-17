import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { TextVariant, textStyles } from '../../theme/typography';

interface ThemedTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'cta' | 'danger' | 'warning' | 'onAccent';
  align?: TextStyle['textAlign'];
}

export const Text: React.FC<ThemedTextProps> = ({
  variant = 'body',
  color = 'primary',
  align,
  style,
  selectable = true,
  ...props
}) => {
  const { colors } = useTheme();

  const colorMap = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    accent: colors.accent,
    cta: colors.cta,
    danger: colors.danger,
    warning: colors.warningText,
    onAccent: colors.ctaText,
  };

  return (
    <RNText
      selectable={selectable}
      style={[
        textStyles[variant],
        { color: colorMap[color] },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...props}
    />
  );
};
