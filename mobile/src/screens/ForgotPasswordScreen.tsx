import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyRound, Mail, Lock, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { authAPI } from '../api/endpoints';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ route, navigation }: Props) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(route.params?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setStep(2);
      Toast.show({ type: 'success', text1: 'OTP Sent', text2: 'Please check your email.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.detail || 'Failed to send OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || newPassword.length < 8) {
      Toast.show({ type: 'error', text1: 'Invalid Input', text2: 'Ensure OTP is entered and password is 8+ chars.' });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, new_password: newPassword });
      setStep(3);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Reset Failed', text2: e.response?.data?.detail || 'Invalid OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" style={styles.p6}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="white" size={20} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 ? 'Reset' : step === 2 ? 'New' : 'Success'} <Text style={styles.primaryText}>{step === 3 ? '!' : 'Password'}</Text>
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 ? "Enter your email to receive an OTP." : step === 2 ? "Enter the OTP and your new password." : "Your password has been reset successfully."}
            </Text>
          </View>

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.progressDot, step >= i ? styles.progressActive : styles.progressInactive]} />
            ))}
          </View>

          {step === 1 && (
            <View style={styles.formGroup}>
              <View style={styles.inputContainer}>
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

              <TouchableOpacity activeOpacity={0.7} 
                onPress={handleSendOTP}
                disabled={isLoading || !email}
                style={[styles.actionBtn, email ? styles.btnActive : styles.btnInactive]}
              >
                {isLoading ? <Loader2 color="white" size={24} /> : <Text style={[styles.btnText, email ? styles.textWhite : styles.textWhite40]}>Send OTP</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.formGroup}>
              <View style={[styles.inputContainer, styles.mb16]}>
                <KeyRound size={20} color="#6b6b80" />
                <TextInput returnKeyType="done"
                  placeholder="6-Digit OTP"
                  placeholderTextColor="#6b6b80"
                  style={[styles.input, styles.trackingWidest]}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#6b6b80" />
                <TextInput returnKeyType="done"
                  placeholder="New Password (8+ chars)"
                  placeholderTextColor="#6b6b80"
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity activeOpacity={0.7} 
                onPress={handleResetPassword}
                disabled={isLoading || otp.length < 6 || newPassword.length < 8}
                style={[styles.actionBtn, otp.length === 6 && newPassword.length >= 8 ? styles.btnActive : styles.btnInactive]}
              >
                {isLoading ? <Loader2 color="white" size={24} /> : <Text style={[styles.btnText, otp.length === 6 && newPassword.length >= 8 ? styles.textWhite : styles.textWhite40]}>Reset Password</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <ShieldCheck size={40} color="#00d68f" />
              </View>
              <TouchableOpacity activeOpacity={0.7} 
                onPress={() => navigation.navigate('Login')}
                style={styles.backLoginBtn}
              >
                <Text style={styles.btnTextPrimary}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  header: {
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressDot: {
    height: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  progressActive: {
    backgroundColor: '#6c63ff',
    width: 32,
  },
  progressInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 8,
  },
  formGroup: {
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
  mb16: {
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  trackingWidest: {
    letterSpacing: 2,
  },
  actionBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
  textWhite: {
    color: '#ffffff',
  },
  textWhite40: {
    color: 'rgba(255,255,255,0.4)',
  },
  btnText: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  successIconBox: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0,214,143,0.2)',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderColor: 'rgba(0,214,143,0.3)',
    borderWidth: 1,
  },
  backLoginBtn: {
    width: '100%',
    backgroundColor: '#6c63ff',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnTextPrimary: {
    color: '#ffffff',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});

export default ForgotPasswordScreen;
