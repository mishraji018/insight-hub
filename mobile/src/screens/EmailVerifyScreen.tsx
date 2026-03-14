import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MailOpen, Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { authAPI } from '../api/endpoints';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerify'>;

const EmailVerifyScreen = ({ route, navigation }: Props) => {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef<Array<TextInput returnKeyType="done" | null>>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

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
    const otp = code.join('');
    if (otp.length < 6) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      await authAPI.verifyEmail({ email, otp });
      Toast.show({ type: 'success', text1: 'Email Verified', text2: 'You can now log in' });
      navigation.replace('Login');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Verification Failed', text2: e.response?.data?.detail || 'Invalid code' });
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await authAPI.resendVerification(email);
      setCooldown(60);
      Toast.show({ type: 'success', text1: 'Code Sent', text2: 'Check your email inbox.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.detail || 'Could not resend code' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="p-6">
          <View className="items-center mb-10">
            <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-6">
              <MailOpen size={48} color="#6c63ff" />
            </View>
            <Text className="text-white text-2xl font-black">Check your inbox</Text>
            <Text className="text-muted text-center mt-2">
              We've sent a 6-digit verification code to
              <Text className="text-white font-bold"> {email}</Text>
            </Text>
          </View>

          <View className="flex-row justify-between mb-8">
            {code.map((digit, idx) => (
              <TextInput returnKeyType="done"
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                className="w-12 h-14 bg-surface-dark border border-white/10 rounded-xl text-white text-center text-xl font-black"
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity activeOpacity={0.7} 
            onPress={handleVerify}
            disabled={isLoading || code.join('').length < 6}
            className={`h-14 rounded-2xl items-center justify-center mb-6 ${code.join('').length === 6 ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-white/10'}`}
          >
            {isLoading ? <Loader2 color="white" size={24} className="animate-spin" /> : <Text className={`font-black uppercase tracking-widest ${code.join('').length === 6 ? 'text-white' : 'text-white/40'}`}>Verify Email</Text>}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-muted font-bold">Didn't receive the code? </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleResend} disabled={cooldown > 0}>
              <Text className={`${cooldown > 0 ? 'text-muted' : 'text-primary'} font-black`}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EmailVerifyScreen;
