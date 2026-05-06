import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import {
    RoutinesNavigator,
    CatalogNavigator,
    GoalsNavigator,
    ProfileNavigator,
} from './WorkoutStack';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    Routines: { active: 'clipboard', inactive: 'clipboard-outline' },
    Catalogue: { active: 'barbell', inactive: 'barbell-outline' },
    Objectifs: { active: 'trophy', inactive: 'trophy-outline' },
    Profil: { active: 'person', inactive: 'person-outline' },
};

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: {
                    fontSize: FONTS.sizes.xs,
                    fontWeight: '500',
                },
                tabBarIcon: ({ focused, color }) => {
                    const icons = TAB_ICONS[route.name];
                    const iconName = focused ? icons?.active : icons?.inactive;
                    return <Ionicons name={iconName || 'ellipse'} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Routines" component={RoutinesNavigator} />
            <Tab.Screen name="Catalogue" component={CatalogNavigator} />
            <Tab.Screen name="Objectifs" component={GoalsNavigator} />
            <Tab.Screen name="Profil" component={ProfileNavigator} />
        </Tab.Navigator>
    );
}
