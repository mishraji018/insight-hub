import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, Loader2, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { authAPI } from '../api/endpoints';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let strength = 0;
  if (hasLength) strength++;
  if (hasUpper) strength++;
  if (hasSpecial) strength++;

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!hasLength || !hasUpper || !hasSpecial) {
      Toast.show({ type: 'error', text1: 'Password does not meet requirements' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || undefined;

      await authAPI.register({
        email,
        password,
        confirm_password: confirmPassword,
        first_name: firstName,
        last_name: lastName,
      });

      navigation.replace('EmailVerify', { email });
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: e.response?.data?.detail || 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = strength >= 3 && name && email && confirmPassword === password;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" style={styles.p6}>
          <View style={styles.header}>
            <Text style={styles.title}>Create <Text style={styles.primaryText}>Account</Text></Text>
            <Text style={styles.subtitle}>Join Insight Hub today</Text>
          </View>

          <View style={styles.formGroup}>
            <View style={[styles.inputContainer, styles.mb16]}>
              <User size={20} color="#6b6b80" />
              <TextInput returnKeyType="done"
                placeholder="Full Name"
                placeholderTextColor="#6b6b80"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputContainer, styles.mb16]}>
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

            <View style={[styles.inputContainer, styles.mb16]}>
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
            
            <View style={[styles.inputContainer, styles.mb16]}>
              <Lock size={20} color="#6b6b80" />
              <TextInput returnKeyType="done"
                placeholder="Confirm Password"
                placeholderTextColor="#6b6b80"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.strengthContainer}>
              <View style={styles.barsContainer}>
                <View style={[styles.bar, strength >= 1 ? styles.bgDanger : styles.bgWhite10, strength >= 2 && styles.bgWarning, strength >= 3 && styles.bgSuccess]} />
                <View style={[styles.bar, strength >= 2 ? styles.bgWarning : styles.bgWhite10, strength >= 3 && styles.bgSuccess]} />
                <View style={[styles.bar, strength >= 3 ? styles.bgSuccess : styles.bgWhite10]} />
              </View>
              <View style={styles.rulesContainer}>
                <View style={styles.rule}>
                  <Check size={14} color={hasLength ? '#00d68f' : '#6b6b80'} />
                  <Text style={[styles.ruleText, hasLength ? styles.textSuccess : styles.textMuted]}>8+ characters</Text>
                </View>
                <View style={styles.rule}>
                  <Check size={14} color={hasUpper ? '#00d68f' : '#6b6b80'} />
                  <Text style={[styles.ruleText, hasUpper ? styles.textSuccess : styles.textMuted]}>1 uppercase letter</Text>
                </View>
                <View style={styles.rule}>
                  <Check size={14} color={hasSpecial ? '#00d68f' : '#6b6b80'} />
                  <Text style={[styles.ruleText, hasSpecial ? styles.textSuccess : styles.textMuted]}>1 special character</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.7} 
            onPress={handleRegister}
            disabled={isLoading}
            style={[styles.registerBtn, isFormValid ? styles.btnActive : styles.btnInactive]}
          >
            {isLoading ? <Loader2 color="white" size={24} /> : <Text style={[styles.btnText, isFormValid ? styles.textWhite : styles.textWhite40]}>Sign Up</Text>}
          </TouchableOpacity>

          <View style={styles.signinRow}>
            <Text style={styles.mutedBold}>Already have an account? </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryBlack}>Sign In</Text>
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
    marginTop: 40,
    marginBottom: 32,
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
    // replaced space-y-4
  },
  mb16: {
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
  strengthContainer: {
    marginTop: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    height: 6,
    flex: 1,
    borderRadius: 999,
    marginRight: 8,
  },
  bgDanger: { backgroundColor: '#ff4d6d' },
  bgWarning: { backgroundColor: '#ffb830' },
  bgSuccess: { backgroundColor: '#00d68f' },
  bgWhite10: { backgroundColor: 'rgba(255,255,255,0.1)' },
  rulesContainer: {
    marginTop: 12,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ruleText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  textSuccess: { color: '#00d68f' },
  textMuted: { color: '#6b6b80' },
  registerBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  btnActive: {
    backgroundColor: '#6c63ff',
    elevation: 8,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  btnText: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  textWhite: { color: '#ffffff' },
  textWhite40: { color: 'rgba(255,255,255,0.4)' },
  signinRow: {
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
  }
});

export default RegisterScreen;
