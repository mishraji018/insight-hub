import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { authAPI } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<AuthStackParamList, 'TwoFA'>;

const TwoFAScreen = ({ route, navigation }: Props) => {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const inputRefs = useRef<Array<TextInput returnKeyType="done" | null>>([]);
  const setTokens = useAuthStore(s => s.setTokens);
  const setUser = useAuthStore(s => s.setUser);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = useBackup ? backupCode : code.join('');
    if ((!useBackup && otp.length < 6) || (useBackup && otp.length < 8)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const response = await authAPI.verify2FA(email, otp);
      if (response.access) {
        await setTokens(response.access, response.refresh);
        setUser(response.user || null);
        // Navigation is handled by the RootStack observing isAuthenticated
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Verification Failed', text2: e.response?.data?.detail || 'Invalid code' });
      setCode(['', '', '', '', '', '']);
      setBackupCode('');
      if (!useBackup) inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeValid = (!useBackup && code.join('').length === 6) || (useBackup && backupCode.length >= 8);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} style={styles.p6}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <ShieldCheck size={48} color="#6c63ff" />
            </View>
            <Text style={styles.title}>Two-Factor Auth</Text>
            <Text style={styles.subtitle}>
              {useBackup 
                ? "Enter one of your 8-character backup codes." 
                : "Enter the 6-digit code from your authenticator app."}
            </Text>
          </View>

          {!useBackup ? (
            <View style={styles.codeContainer}>
              {code.map((digit, idx) => (
                <TextInput returnKeyType="done"
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el as any; }}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={styles.digitInput}
                  selectTextOnFocus
                />
              ))}
            </View>
          ) : (
            <View style={styles.mb32}>
              <TextInput returnKeyType="done"
                value={backupCode}
                onChangeText={setBackupCode}
                placeholder="Enter Backup Code"
                placeholderTextColor="#6b6b80"
                style={styles.backupInput}
                autoCapitalize="characters"
                maxLength={8}
              />
            </View>
          )}

          <TouchableOpacity activeOpacity={0.7} 
            onPress={handleVerify}
            disabled={isLoading || !isCodeValid}
            style={[styles.verifyBtn, isCodeValid ? styles.btnActive : styles.btnInactive]}
          >
            {isLoading ? <Loader2 color="white" size={24} /> : 
              <Text style={[styles.btnText, isCodeValid ? styles.textWhite : styles.textWhite40]}>
                Verify Code
              </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} 
            onPress={() => {
              setUseBackup(!useBackup);
              setCode(['', '', '', '', '', '']);
              setBackupCode('');
            }}
            style={styles.switchBtn}
          >
            <Text style={styles.primaryBold}>
              {useBackup ? "Use Authenticator App" : "Use Backup Code"}
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  p6: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBox: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(108,99,255,0.2)',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderColor: 'rgba(108,99,255,0.3)',
    borderWidth: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6b6b80',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  digitInput: {
    width: 48,
    height: 56,
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
  },
  mb32: {
    marginBottom: 32,
  },
  backupInput: {
    height: 56,
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  verifyBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  textWhite: {
    color: '#ffffff',
  },
  textWhite40: {
    color: 'rgba(255,255,255,0.4)',
  },
  switchBtn: {
    alignItems: 'center',
  },
  primaryBold: {
    color: '#6c63ff',
    fontWeight: '700',
  }
});

export default TwoFAScreen;
