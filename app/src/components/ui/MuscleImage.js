import React from 'react';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const MUSCLE_IMAGES = {
    pectoraux: require('../../../assets/images/muscles/chest.png'),
    dos: require('../../../assets/images/muscles/back.png'),
    epaules: require('../../../assets/images/muscles/shoulders.png'),
    biceps: require('../../../assets/images/muscles/biceps.png'),
    triceps: require('../../../assets/images/muscles/triceps.png'),
    jambes: require('../../../assets/images/muscles/quadriceps.png'),
    abdominaux: require('../../../assets/images/muscles/abs.png'),
    mollets: require('../../../assets/images/muscles/calves.png'),
    'avant-bras': require('../../../assets/images/muscles/forearm.png'),
    fessiers: require('../../../assets/images/muscles/fessiers.png'),
    quadriceps: require('../../../assets/images/muscles/quadriceps.png'),
    ischio: require('../../../assets/images/muscles/hamstrings.png'),
};

export default function MuscleImage({ muscleGroup, size = 24, style }) {
    const source = MUSCLE_IMAGES[muscleGroup];
    if (!source) {
        return <Ionicons name="barbell-outline" size={size} color={COLORS.primary} />;
    }
    return (
        <Image
            source={source}
            style={[{ width: size, height: size }, style]}
            resizeMode="contain"
        />
    );
}
