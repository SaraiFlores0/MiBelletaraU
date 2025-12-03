// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpensesSummaryScreen from '../screens/ExpensesSummaryScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AboutScreen from '../screens/AboutScreen';

export type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddExpense: undefined;
  ExpensesSummary: undefined;
  EditExpense: { expense: any }; 
  Profile: undefined;
  About: undefined;
};

// Tipo genérico para las props de cada pantalla
export type RootStackScreenProps<
  T extends keyof RootStackParamList
> = NativeStackScreenProps<RootStackParamList, T>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthLoading"
        screenOptions={{ headerShown: false }}
      >
        {/* Pantalla inicial: revisa si hay sesión y redirige a Home o Login */}
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />

        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Flujo principal */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen
          name="ExpensesSummary"
          component={ExpensesSummaryScreen}
        />
        <Stack.Screen name="EditExpense" component={EditExpenseScreen} />

        {/* Perfil y acerca de */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
