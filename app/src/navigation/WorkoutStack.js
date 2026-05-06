import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS, FONTS } from '../constants/theme';

// Catalog
import ExerciseListScreen from '../screens/Catalog/ExerciseListScreen';
import ExerciseDetailScreen from '../screens/Catalog/ExerciseDetailScreen';
import CreateExerciseScreen from '../screens/Catalog/CreateExerciseScreen';

// Routines
import RoutineListScreen from '../screens/Routines/RoutineListScreen';
import CreateRoutineScreen from '../screens/Routines/CreateRoutineScreen';

// Active Workout
import ActiveWorkoutScreen from '../screens/ActiveWorkout/ActiveWorkoutScreen';
import SessionRecapScreen from '../screens/ActiveWorkout/SessionRecapScreen';

// Goals (calendar + goals merged)
import GoalsScreen from '../screens/Profile/GoalsScreen';
import SessionDetailScreen from '../screens/History/SessionDetailScreen';

// Profile
import ProfileScreen from '../screens/Profile/ProfileScreen';

const screenOptions = {
    headerStyle: { backgroundColor: COLORS.background },
    headerTintColor: COLORS.text,
    headerTitleStyle: { fontWeight: '600', fontSize: FONTS.sizes.md },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: COLORS.background },
};

// ---- Routines Stack (first tab) ----
const RoutinesStack = createNativeStackNavigator();
export function RoutinesNavigator() {
    return (
        <RoutinesStack.Navigator screenOptions={screenOptions}>
            <RoutinesStack.Screen name="RoutineList" component={RoutineListScreen} options={{ title: 'Routines' }} />
            <RoutinesStack.Screen name="CreateRoutine" component={CreateRoutineScreen} options={{ title: 'Routine' }} />
            <RoutinesStack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ title: 'Séance', headerShown: false }} />
            <RoutinesStack.Screen name="SessionRecap" component={SessionRecapScreen} options={{ title: 'Récapitulatif', headerShown: false }} />
        </RoutinesStack.Navigator>
    );
}

// ---- Catalog Stack ----
const CatalogStack = createNativeStackNavigator();
export function CatalogNavigator() {
    return (
        <CatalogStack.Navigator screenOptions={screenOptions}>
            <CatalogStack.Screen name="ExerciseList" component={ExerciseListScreen} options={{ title: 'Catalogue' }} />
            <CatalogStack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Détail' }} />
            <CatalogStack.Screen name="CreateExercise" component={CreateExerciseScreen} options={{ title: 'Nouvel exercice' }} />
        </CatalogStack.Navigator>
    );
}

// ---- Goals Stack (calendar + goals + session detail) ----
const GoalsStack = createNativeStackNavigator();
export function GoalsNavigator() {
    return (
        <GoalsStack.Navigator screenOptions={screenOptions}>
            <GoalsStack.Screen name="GoalsList" component={GoalsScreen} options={{ title: 'Objectifs' }} />
            <GoalsStack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Séance' }} />
        </GoalsStack.Navigator>
    );
}

// ---- Profile Stack ----
const ProfileStack = createNativeStackNavigator();
export function ProfileNavigator() {
    return (
        <ProfileStack.Navigator screenOptions={screenOptions}>
            <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profil' }} />
        </ProfileStack.Navigator>
    );
}
