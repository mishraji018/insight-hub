import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ArrowLeft, Trash2, ShieldAlert, CheckCircle2, Info } from 'lucide-react-native';
import { authAPI } from '../api/endpoints';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await authAPI.getNotifications();
      setNotifications(data.results);
    } catch (e) {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await authAPI.clearNotifications();
      fetchNotifications();
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>{notifications.length} Unread</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={handleClearAll} style={styles.clearBtn}>
          <Trash2 color="#ff4d6d" size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor="#6c63ff" />}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell color="#6b6b80" size={48} style={styles.mb16} />
            <Text style={styles.emptyText}>You have no new notifications.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {notifications.map((notif, i) => (
              <View key={i} style={styles.notifCard}>
                <View style={[styles.iconBox, 
                  notif.type === 'security' ? styles.bgDanger10 : 
                  notif.type === 'login' ? styles.bgPrimary10 : styles.bgSuccess10
                ]}>
                  {notif.type === 'security' ? <ShieldAlert color="#ff4d6d" size={18} /> : 
                   notif.type === 'login' ? <Info color="#6c63ff" size={18} /> : 
                   <CheckCircle2 color="#00d68f" size={18} />}
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                  <Text style={styles.notifDate}>
                    {new Date(notif.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,77,109,0.1)',
    borderColor: 'rgba(255,77,109,0.2)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    opacity: 0.5,
  },
  mb16: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b6b80',
    fontWeight: '700',
    textAlign: 'center',
  },
  listContainer: {
  },
  notifCard: {
    backgroundColor: '#13131a',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bgDanger10: {
    backgroundColor: 'rgba(255,77,109,0.1)',
  },
  bgPrimary10: {
    backgroundColor: 'rgba(108,99,255,0.1)',
  },
  bgSuccess10: {
    backgroundColor: 'rgba(0,214,143,0.1)',
  },
  flex1: {
    flex: 1,
  },
  notifTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  notifMessage: {
    color: '#6b6b80',
    fontSize: 14,
    marginTop: 4,
  },
  notifDate: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
