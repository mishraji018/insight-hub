import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  const initializeAuth = useAuthStore(s => s.initializeAuth);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    const check = async () => {
      await initializeAuth();
      setTimeout(() => {
        if (useAuthStore.getState().isAuthenticated) {
          // Navigated by App.tsx RootStack
        } else {
          navigation.replace('Login');
        }
      }, 2000);
    };
    check();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.titlePrimary}>Insight<Text style={styles.titleSecondary}>Hub</Text></Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePrimary: {
    color: '#6c63ff',
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  titleSecondary: {
    color: '#ffffff',
    fontStyle: 'normal',
  }
});

export default SplashScreen;
