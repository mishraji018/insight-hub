import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fingerprint, Mail, Lock, Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const resp = await login(email, password);
      if (resp?.requires_2fa) {
        navigation.navigate('TwoFA', { email });
      }
    } catch (e) {
      // Error handled by store
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" style={styles.p6}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome <Text style={styles.primaryText}>Back</Text></Text>
            <Text style={styles.subtitle}>Sign in to continue your insights journey</Text>
          </View>

          <View style={styles.formGroup}>
            <View style={[styles.inputContainer, styles.marginBottom16]}>
              <Mail size={20} color="#6b6b80" />
              <TextInput returnKeyType="done"
                placeholder="Email Address"
                placeholderTextColor="#6b6b80"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6b6b80" />
              <TextInput returnKeyType="done"
                placeholder="Password"
                placeholderTextColor="#6b6b80"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.7} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} 
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginBtn}
          >
            {isLoading ? <Loader2 color="white" size={24} /> : <Text style={styles.loginBtnText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.mutedBold}>New user? </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.primaryBlack}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.biometricContainer}>
             <TouchableOpacity activeOpacity={0.7} style={styles.biometricBtn}>
                <Fingerprint color="#6c63ff" size={32} />
             </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  p6: {
    padding: 24,
  },
  header: {
    marginTop: 80,
    marginBottom: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  primaryText: {
    color: '#6c63ff',
  },
  subtitle: {
    color: '#6b6b80',
    fontSize: 14,
    marginTop: 8,
  },
  formGroup: {
    // Replaced space-y-4 with explicit child margins
  },
  marginBottom16: {
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  forgotText: {
    color: '#6c63ff',
    fontWeight: '700',
    fontSize: 12,
  },
  loginBtn: {
    backgroundColor: '#6c63ff',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    elevation: 8,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loginBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  mutedBold: {
    color: '#6b6b80',
    fontWeight: '700',
  },
  primaryBlack: {
    color: '#6c63ff',
    fontWeight: '900',
  },
  biometricContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 40,
  },
  biometricBtn: {
    padding: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  }
});

export default LoginScreen;
