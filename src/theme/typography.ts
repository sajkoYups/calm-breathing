export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
} as const;

export const fontSize = {
  display: 32,
  title: 22,
  body: 16,
  caption: 13,
  stat: 40,
} as const;

export type TextVariant = keyof typeof fontSize;

export const textStyles = {
  display: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.display,
    fontWeight: '600' as const,
    lineHeight: 40,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.title,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  stat: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.stat,
    fontWeight: '600' as const,
    lineHeight: 48,
    fontVariant: ['tabular-nums'] as ('tabular-nums')[],
  },
};
