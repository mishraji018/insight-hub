import React, { useEffect } from 'react';
import './global.css'; // NativeWind v4
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './src/navigation/AuthStack';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { useAuthStore } from './src/store/authStore';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';


import NotificationsScreen from './src/screens/NotificationsScreen';
import SessionsScreen from './src/screens/SessionsScreen';
import ErrorBoundary from './src/components/ErrorBoundary';

const RootStack = createNativeStackNavigator();

export default function App() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const initializeAuth = useAuthStore(s => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0a0a0f" />
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen name="Notifications" component={NotificationsScreen} />
            <RootStack.Screen name="Sessions" component={SessionsScreen} />
          </>
        )}
        </RootStack.Navigator>
        <Toast />
      </NavigationContainer>
    </ErrorBoundary>
  );
}
