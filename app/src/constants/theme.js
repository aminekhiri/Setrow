export const COLORS = {
    // Backgrounds
    background: '#0D0D0F',
    surface: '#1A1A2E',
    surfaceLight: '#252540',
    surfaceHighlight: '#2E2E4A',

    // Accent
    primary: '#FF6B35',
    primaryLight: '#FF8C5E',
    primaryDark: '#E55A25',
    primaryGlow: 'rgba(255, 107, 53, 0.15)',

    // Text
    text: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textMuted: '#6B6B80',
    textInverse: '#0D0D0F',

    // Status
    success: '#4ADE80',
    successDim: 'rgba(74, 222, 128, 0.15)',
    warning: '#FBBF24',
    warningDim: 'rgba(251, 191, 36, 0.15)',
    danger: '#F87171',
    dangerDim: 'rgba(248, 113, 113, 0.15)',

    // Misc
    border: '#2A2A40',
    overlay: 'rgba(0, 0, 0, 0.6)',
    white: '#FFFFFF',
    black: '#000000',
};

export const MUSCLE_COLORS = {
    'Pectoraux': '#FF6B6B',
    'Dos': '#4ECDC4',
    'Épaules': '#45B7D1',
    'Biceps': '#96CEB4',
    'Triceps': '#FFEAA7',
    'Jambes': '#DDA0DD',
    'Abdominaux': '#98D8C8',
    'Mollets': '#F7DC6F',
    'Avant-bras': '#BB8FCE',
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
        xs: 11,
        sm: 13,
        md: 15,
        lg: 17,
        xl: 20,
        xxl: 26,
        xxxl: 34,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    glow: (color = COLORS.primary) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    }),
};
