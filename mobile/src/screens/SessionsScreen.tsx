import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MonitorSmartphone, ArrowLeft, Trash2 } from 'lucide-react-native';
import { authAPI } from '../api/endpoints';
import * as Haptics from 'expo-haptics';

export default function SessionsScreen({ navigation }: any) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await authAPI.getSessions();
      setSessions(data);
    } catch (e) {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await authAPI.revokeSession(id);
      fetchSessions();
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Active Sessions</Text>
          <Text style={styles.subtitle}>Security Settings</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSessions} tintColor="#6c63ff" />}
      >
        <View style={styles.listContainer}>
          {sessions.map((session, i) => (
            <View key={i} style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={styles.iconBox}>
                  <MonitorSmartphone color="#00d68f" size={18} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionName}>{session.device_name} ({session.browser})</Text>
                  <Text style={styles.sessionIp}>IP: {session.ip_address || 'Unknown'}</Text>
                  <Text style={styles.sessionActive}>
                    Last active: {new Date(session.last_active).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {!session.is_current && (
                <TouchableOpacity activeOpacity={0.7} onPress={() => handleRevoke(session.id)} style={styles.revokeBtn}>
                  <Trash2 color="#ff4d6d" size={18} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6c63ff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  listContainer: {
  },
  sessionCard: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,214,143,0.1)',
    borderColor: 'rgba(0,214,143,0.2)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sessionIp: {
    color: '#6b6b80',
    fontSize: 12,
    marginTop: 4,
  },
  sessionActive: {
    color: '#00d68f',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  revokeBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,77,109,0.1)',
    borderColor: 'rgba(255,77,109,0.2)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
