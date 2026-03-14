import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { LogOut, User as UserIcon, Shield, Bell, Moon, Download, MonitorSmartphone, ChevronRight, Fingerprint, Mail } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import Toast from 'react-native-toast-message';

export default function ProfileScreen({ navigation }: any) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const biometricsEnabled = useAuthStore(s => s.biometricsEnabled);
  const setBiometricsEnabled = useAuthStore(s => s.setBiometricsEnabled);
  const toggleTheme = useAuthStore(s => s.toggleTheme);
  const [isThemeDark, setIsThemeDark] = useState(user?.theme_preference === 'dark');

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Toast.show({ type: 'error', text1: 'Not Available', text2: 'Biometrics not set up on this device.' });
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enable Biometrics Login' });
      if (result.success) {
        setBiometricsEnabled(true);
        Toast.show({ type: 'success', text1: 'Enabled', text2: 'Biometric login is now active.' });
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  const menuSections = [
    {
      title: 'Account Settings',
      items: [
        { label: 'Edit Profile', icon: UserIcon, color: '#6c63ff', action: () => {} },
        { label: 'Security & Password', icon: Shield, color: '#00d68f', action: () => {} },
        { label: 'Notifications', icon: Bell, color: '#ffb830', action: () => {} },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          label: 'Dark Mode', icon: Moon, color: '#6b6b80', 
          right: <Switch value={isThemeDark} onValueChange={(v) => { setIsThemeDark(v); toggleTheme(v ? 'dark' : 'light'); }} trackColor={{ true: '#6c63ff', false: '#3f3f46' }} /> 
        },
        { 
          label: 'Biometric Login', icon: Fingerprint, color: '#6c63ff', 
          right: <Switch value={biometricsEnabled} onValueChange={handleToggleBiometrics} trackColor={{ true: '#6c63ff', false: '#3f3f46' }} /> 
        },
        { 
          label: 'Email Digest', icon: Mail, color: '#ff4d6d', 
          right: <Switch value={!!user?.digest_enabled} onValueChange={() => {}} trackColor={{ true: '#6c63ff', false: '#3f3f46' }} /> 
        },
      ]
    },
    {
       title: 'Data & Privacy',
       items: [
         { label: 'Active Sessions', icon: MonitorSmartphone, color: '#00d68f', action: () => navigation.navigate('Sessions') },
         { label: 'Export My Data', icon: Download, color: '#6b6b80', action: () => {} },
       ]
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <TouchableOpacity activeOpacity={0.7} style={styles.avatarContainer}>
             {user?.avatar ? (
               <Image resizeMode="cover" source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${user.avatar}` }} style={styles.fullSize} />
             ) : (
               <Text style={styles.avatarText}>{user?.first_name?.charAt(0) || 'U'}</Text>
             )}
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.first_name} {user?.last_name || ''}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{user?.role || 'User'}</Text>
          </View>
        </View>

        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuBox}>
              {section.items.map((item: any, i) => (
                <TouchableOpacity activeOpacity={0.7} 
                  key={i} 
                  disabled={!item.action}
                  onPress={item.action}
                  style={[styles.menuItem, i !== section.items.length - 1 && styles.borderBottom]}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                    <item.icon color={item.color} size={18} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.right ? item.right : <ChevronRight color="#6b6b80" size={20} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity activeOpacity={0.7} 
          onPress={() => logout()}
          style={styles.logoutBtn}
        >
           <LogOut color="#ff4d6d" size={20} style={styles.mr2} />
           <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  fullSize: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  userEmail: {
    color: '#6b6b80',
  },
  roleTag: {
    backgroundColor: 'rgba(108,99,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 12,
    borderColor: 'rgba(108,99,255,0.3)',
    borderWidth: 1,
  },
  roleText: {
    color: '#6c63ff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#6b6b80',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 8,
  },
  menuBox: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    color: '#ffffff',
    fontWeight: '700',
  },
  logoutBtn: {
    marginHorizontal: 24,
    marginBottom: 40,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,77,109,0.1)',
    borderColor: 'rgba(255,77,109,0.2)',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mr2: {
    marginRight: 8,
  },
  logoutText: {
    color: '#ff4d6d',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
